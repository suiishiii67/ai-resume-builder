// Resume editor (/editor/:resumeId) with live preview.
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useResumes } from '../context/ResumeContext'
import { useToast } from '../context/ToastContext'
import { getResumeById } from '../services/resumeService'
import { improveSection } from '../services/aiService'
import { resolveCompany, resolveRole } from '../utils/targetProfile'
import { getTemplateLayout } from '../utils/resumeFormat'
import { findResumeErrors } from '../utils/validation'
import { SECTION_LABELS } from '../data/sections'
import { PRINT_PAGE_STYLE, buildPdfFileName } from '../utils/pdf'
import PageLoader from '../components/PageLoader'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import TargetStrip from '../components/TargetStrip'
import EditorToolbar from '../components/editor/EditorToolbar'
import EditorWorkspace from '../components/editor/EditorWorkspace'
import RetargetDialog from '../components/editor/RetargetDialog'

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

  // Keep the old value so the user can undo
  const handleImprove = async (sectionKey) => {
    const previousValue = resumeData[sectionKey]
    setImprovingSection(sectionKey)
    const result = await improveSection(sectionKey, resumeData, { company, role })
    setImprovingSection('')
    handleSectionChange(sectionKey, result.value)
    setOpenSections((open) => (open.includes(sectionKey) ? open : [...open, sectionKey]))
    showToast(result.note, 'success', { actionLabel: 'Undo', onAction: () => handleSectionChange(sectionKey, previousValue) })
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
    const savedResume = await saveResume(resumeData.id, resumeData)
    setResumeData(savedResume)
    setSavedSnapshot(JSON.stringify(savedResume))
    setIsSaving(false)
    showToast('Resume saved.')
    return true
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
        layout={getTemplateLayout(templates, resumeData.templateId)}
        company={company}
        role={role}
        printRef={printRef}
        onAddSkill={handleAddSkill}
        sectionProps={{ onSectionChange: handleSectionChange, onMoveSection: handleMoveSection, onImprove: handleImprove, improvingSection, openSections, onToggleSection: handleToggleSection, showErrors }}
      />

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
