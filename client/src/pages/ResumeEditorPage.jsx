// Resume editor (/editor/:resumeId) with live preview.
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useResumes } from '../context/ResumeContext'
import { useToast } from '../context/ToastContext'
import { getResumeById } from '../services/resumeService'
import { improveSection, BASIC_MODE_MESSAGE } from '../services/aiService'
import { getJobText } from '../utils/jobDescription'
import { resolveCompany, resolveRole } from '../utils/targetProfile'
import { getTemplateDesign } from '../data/templateDesign'
import { findResumeErrors } from '../utils/validation'
import { SECTION_LABELS } from '../data/sections'
import { PRINT_PAGE_STYLE, buildPdfFileName } from '../utils/pdf'
import PageLoader from '../components/PageLoader'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import TargetStrip from '../components/TargetStrip'
import ReviewChangesDialog from '../components/ReviewChangesDialog'
import EditorToolbar from '../components/editor/EditorToolbar'
import EditorWorkspace from '../components/editor/EditorWorkspace'
import RetargetDialog from '../components/editor/RetargetDialog'

// The before / after rows for an "Improve with AI" suggestion
function buildReviewItems({ sectionKey, previousValue, value }) {
  if (sectionKey === 'summary') return [{ label: 'Summary', before: previousValue, after: value }]
  if (sectionKey === 'skills') return [{ label: 'Skills', before: previousValue.join(', '), after: value.join(', ') }]
  // Experience / projects: one row per entry whose bullets changed. The fact check also knows the entry's
  // title, company and dates, so those are not highlighted when the AI repeats them.
  return value
    .map((entry, index) => {
      const old = previousValue[index] || {}
      const label = [entry.jobTitle || entry.name, entry.company].filter(Boolean).join(' · ') || `Entry ${index + 1}`
      const original = [old.jobTitle, old.company, old.name, old.techStack, old.startDate, old.endDate, old.bullets].filter(Boolean).join('\n')
      return { label, before: old.bullets || '', after: entry.bullets || '', original }
    })
    .filter((item) => item.before !== item.after)
}

function ResumeEditorPage() {
  const { resumeId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { companies, roles, templates } = useCatalog()
  const { saveResume } = useResumes()
  const { showToast } = useToast()
  const printRef = useRef(null)

  const [resumeData, setResumeData] = useState(null) // the resume being edited
  const [savedSnapshot, setSavedSnapshot] = useState('') // last saved version, to detect unsaved changes
  const [loadError, setLoadError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [improvingSection, setImprovingSection] = useState('')
  const [suggestion, setSuggestion] = useState(null) // an AI suggestion waiting for Accept / Keep mine
  const isImproving = useRef(false) // stops a second request from a quick double click
  const [openSections, setOpenSections] = useState([searchParams.get('section') || 'personal'])
  const [isRetargetOpen, setIsRetargetOpen] = useState(false)
  const [showErrors, setShowErrors] = useState(false) // show every field error after a failed save

  useEffect(() => {
    getResumeById(resumeId, user.id)
      .then((resume) => {
        setResumeData(resume)
        setSavedSnapshot(JSON.stringify(resume))
      })
      .catch((error) => setLoadError(error.message))
  }, [resumeId, user.id])

  // From "Fix in editor": scroll to that section
  const requestedSection = searchParams.get('section')
  const isLoaded = Boolean(resumeData)
  useEffect(() => {
    if (isLoaded && requestedSection) document.getElementById(`section-${requestedSection}`)?.scrollIntoView({ behavior: 'smooth' })
  }, [isLoaded, requestedSection])

  const hasUnsavedChanges = isLoaded && JSON.stringify(resumeData) !== savedSnapshot

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasUnsavedChanges])

  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: resumeData ? buildPdfFileName(resumeData) : 'Resume', pageStyle: PRINT_PAGE_STYLE })

  if (loadError) {
    return <EmptyState title="Resume not found" description={loadError} action={<Button to="/dashboard">Back to my resumes</Button>} />
  }
  if (!resumeData) return <PageLoader message="Opening your resume…" />

  const company = resolveCompany(companies, resumeData.companyId, resumeData.companyName)
  const role = resolveRole(roles, resumeData.roleId, resumeData.roleTitle)

  const updateResume = (changes) => setResumeData((current) => ({ ...current, ...changes }))
  const handleSectionChange = (sectionKey, value) => updateResume({ [sectionKey]: value })
  const handleToggleSection = (sectionKey) => setOpenSections((open) => (open.includes(sectionKey) ? open.filter((key) => key !== sectionKey) : [...open, sectionKey]))

  // direction: -1 = up, +1 = down
  const handleMoveSection = (index, direction) => {
    const newOrder = [...resumeData.sectionOrder]
    ;[newOrder[index], newOrder[index + direction]] = [newOrder[index + direction], newOrder[index]]
    updateResume({ sectionOrder: newOrder })
  }

  const handleAddSkill = (skill) => {
    updateResume({ skills: [...resumeData.skills, skill] })
    showToast(`Added “${skill}” to Skills.`)
  }

  // Ask for a suggestion; nothing changes until the user accepts it
  const handleImprove = async (sectionKey) => {
    if (isImproving.current) return
    isImproving.current = true
    setImprovingSection(sectionKey)
    try {
      const result = await improveSection(sectionKey, resumeData[sectionKey], getJobText(resumeData))
      if (result.source === 'basic') showToast(BASIC_MODE_MESSAGE, 'info')
      const newSuggestion = { sectionKey, previousValue: resumeData[sectionKey], ...result }
      if (buildReviewItems(newSuggestion).length) setSuggestion(newSuggestion)
      else showToast('No changes suggested: this section already looks good.', 'info')
    } catch (error) {
      showToast(error.message, 'error')
    }
    setImprovingSection('')
    isImproving.current = false
  }

  // Accept: apply the suggestion, and keep the old value so the user can undo
  const handleAcceptSuggestion = () => {
    const { sectionKey, previousValue, value, note } = suggestion
    setSuggestion(null)
    handleSectionChange(sectionKey, value)
    setOpenSections((open) => (open.includes(sectionKey) ? open : [...open, sectionKey]))
    showToast(note, 'success', { actionLabel: 'Undo', onAction: () => handleSectionChange(sectionKey, previousValue) })
  }

  const handleRetarget = (changes) => {
    updateResume(changes)
    setIsRetargetOpen(false)
    showToast(`Now targeting ${changes.companyName}. Check the keyword panel for what is missing.`)
  }

  // Returns false when a field is wrong, and opens those sections
  const handleSave = async () => {
    const sectionsWithErrors = findResumeErrors(resumeData)
    if (sectionsWithErrors.length) {
      setShowErrors(true)
      setOpenSections((open) => [...new Set([...open, ...sectionsWithErrors])])
      document.getElementById(`section-${sectionsWithErrors[0]}`)?.scrollIntoView({ behavior: 'smooth' })
      const names = sectionsWithErrors.map((key) => (key === 'personal' ? 'Personal info' : SECTION_LABELS[key])).join(', ')
      showToast(`Fix the highlighted fields in ${names} before saving.`, 'error')
      return false
    }
    setIsSaving(true)
    try {
      const savedResume = await saveResume(resumeData.id, resumeData)
      setResumeData(savedResume)
      setSavedSnapshot(JSON.stringify(savedResume))
      showToast('Resume saved.')
      return true
    } catch (error) {
      showToast(error.message, 'error')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // The ATS checker reads the saved version, so save first
  const handleCheckAts = async () => {
    if (hasUnsavedChanges && !(await handleSave())) return
    navigate(`/ats-checker?resume=${resumeData.id}`)
  }

  return (
    <div className="space-y-4">
      <EditorToolbar
        title={resumeData.title}
        onTitleChange={(title) => updateResume({ title })}
        templates={templates}
        templateId={resumeData.templateId}
        onTemplateChange={(templateId) => updateResume({ templateId })}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onDownload={() => {
          showToast('In the print window, choose “Save as PDF”.', 'info')
          handlePrint()
        }}
        onCheckAts={handleCheckAts}
      />

      <TargetStrip
        companyName={company.name}
        roleTitle={role.title}
        detail={`${company.type} · ${company.emphasis === 'projects' ? 'projects first' : 'experience first'}`}
        action={<Button variant="secondary" size="sm" onClick={() => setIsRetargetOpen(true)}>Change target</Button>}
      />

      <EditorWorkspace
        resumeData={resumeData}
        design={getTemplateDesign(templates, resumeData.templateId)}
        company={company}
        role={role}
        printRef={printRef}
        onAddSkill={handleAddSkill}
        onCheckAts={handleCheckAts}
        sectionProps={{ onSectionChange: handleSectionChange, onMoveSection: handleMoveSection, onImprove: handleImprove, improvingSection, openSections, onToggleSection: handleToggleSection, showErrors }}
      />

      {suggestion && (
        <ReviewChangesDialog
          title={`Improve ${SECTION_LABELS[suggestion.sectionKey] || 'section'}`}
          items={buildReviewItems(suggestion)}
          source={suggestion.source}
          onAccept={handleAcceptSuggestion}
          onKeep={() => setSuggestion(null)}
        />
      )}
      {isRetargetOpen && (
        <RetargetDialog
          companies={companies}
          roles={roles}
          currentTarget={{ companyName: company.name, companyId: company.id, roleTitle: role.title, roleId: role.id }}
          onApply={handleRetarget}
          onClose={() => setIsRetargetOpen(false)}
        />
      )}
    </div>
  )
}

export default ResumeEditorPage
