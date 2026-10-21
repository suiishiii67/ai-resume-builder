// Create Resume wizard (/create): target, template, details, then AI draft.
import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useResumes } from '../context/ResumeContext'
import { useToast } from '../context/ToastContext'
import { resolveCompany, resolveRole } from '../utils/targetProfile'
import { validateRequiredFields, validateBasicsForm, validateEntry, hasErrors } from '../utils/validation'
import { buildResumeDraft, generateResume, BASIC_MODE_MESSAGE } from '../services/aiService'
import { findSkillsInText, buildJobDescription } from '../utils/jobDescription'
import { SECTION_LABELS } from '../data/sections'
import PageHeader from '../components/PageHeader'
import TargetStrip from '../components/TargetStrip'
import Button from '../components/Button'
import PageLoader from '../components/PageLoader'
import WizardProgress from '../components/wizard/WizardProgress'
import StepTarget from '../components/wizard/StepTarget'
import StepTemplate from '../components/wizard/StepTemplate'
import StepBasics from '../components/wizard/StepBasics'
import GeneratingState from '../components/wizard/GeneratingState'
import AiBadge, { AI_TOOLTIP } from '../components/AiBadge'
import ReviewChangesDialog from '../components/ReviewChangesDialog'

// Stop letters being typed into number fields
const INPUT_FILTERS = {
  phone: (value) => value.replace(/[^\d+\s()-]/g, ''),
  graduationYear: (value) => value.replace(/\D/g, '').slice(0, 4),
}

function CreateResumePage() {
  const { user } = useAuth()
  const { companies, roles, templates, isCatalogLoading } = useCatalog()
  const { createResume } = useResumes()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState(1)
  const [target, setTarget] = useState({ jobDescription: '', companyName: '', companyId: '', roleTitle: '', roleId: '' })
  // '' = use the company's recommended template
  const [chosenTemplateId, setChosenTemplateId] = useState(searchParams.get('template') || '')
  const [basics, setBasics] = useState({ fullName: user.name, email: user.email, phone: '', location: '', degree: '', institution: '', graduationYear: '', score: '', skills: [], projects: [], experience: [] })
  const [errors, setErrors] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [showEntryErrors, setShowEntryErrors] = useState(false) // project/internship errors after a failed Generate
  const [aiDraft, setAiDraft] = useState(null) // the AI draft, waiting for Accept / Keep mine
  const [isSaving, setIsSaving] = useState(false)
  const isBusy = useRef(false) // stops a second request from a quick double click

  // Worked out from the target
  const company = resolveCompany(companies, target.companyId, target.companyName)
  const role = resolveRole(roles, target.roleId, target.roleTitle)
  const selectedTemplateId = chosenTemplateId || company.preferredTemplate
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || templates[0]
  const recommendedIds = [...new Set([company.preferredTemplate, ...templates.filter((template) => template.roles.includes(role.id)).map((template) => template.id)])]

  // The company the user typed ('' if none)
  const companyName = target.companyName.trim() ? company.name : ''
  const previewResume = useMemo(() => buildResumeDraft({ basics, company, role, companyName, templateId: selectedTemplateId, jobDescription: target.jobDescription }), [basics, company, role, companyName, selectedTemplateId, target.jobDescription])
  const draftOptions = { basics, company, role, companyName, templateId: selectedTemplate?.id, jobDescription: target.jobDescription }

  const handleNext = () => {
    if (step === 1) {
      const jobDescriptionLength = target.jobDescription.trim().length
      const targetErrors = {
        ...validateRequiredFields(target, { roleTitle: 'the job title' }),
        jobDescription: jobDescriptionLength > 0 && jobDescriptionLength < 80 ? 'Paste the full job description (at least 80 characters), or leave it empty.' : '',
      }
      setErrors(targetErrors)
      if (hasErrors(targetErrors)) return
    }
    setErrors({})
    setStep(step + 1)
  }

  const handleBasicsChange = (event) => {
    const { name } = event.target
    const value = INPUT_FILTERS[name] ? INPUT_FILTERS[name](event.target.value) : event.target.value
    const newValues = { ...basics, [name]: value }
    setBasics(newValues)
    // While typing, re-check only a field that already shows an error
    if (errors[name]) setErrors({ ...errors, [name]: validateBasicsForm(newValues)[name] })
  }

  // For skills, projects and internships (they are lists, not text boxes)
  const handleBasicsFieldChange = (name, value) => setBasics({ ...basics, [name]: value })

  // Check a field when the user leaves it
  const handleBasicsBlur = (event) => setErrors({ ...errors, [event.target.name]: validateBasicsForm(basics)[event.target.name] })

  const handleGenerate = async () => {
    const basicsErrors = validateBasicsForm(basics)
    const entryHasErrors = ['projects', 'experience'].some((key) => basics[key].some((entry) => hasErrors(validateEntry(key, entry))))
    setErrors(basicsErrors)
    setShowEntryErrors(entryHasErrors)
    if (hasErrors(basicsErrors) || entryHasErrors) {
      showToast('Fix the highlighted fields first.', 'error')
      return
    }

    if (isBusy.current) return
    isBusy.current = true
    setIsGenerating(true)
    try {
      // Uses only what the user typed
      const draft = await generateResume(draftOptions)
      if (draft.source === 'ai') {
        setAiDraft(draft) // the user reviews it first
        setIsGenerating(false)
      } else {
        // Basic mode only tidies the user's own words, so there is nothing new to review
        showToast(BASIC_MODE_MESSAGE, 'info')
        await saveDraft(draft)
      }
    } catch (error) {
      showToast(error.message, 'error')
      setIsGenerating(false)
    }
    isBusy.current = false
  }

  // Creates the resume from a draft and opens it in the editor
  const saveDraft = async (draft) => {
    const { source: _source, ...resumeFields } = draft
    const newResume = await createResume({
      ...resumeFields,
      jobDescription: buildJobDescription(target.jobDescription, { title: role.title, company: companyName }),
      createdVia: 'form',
    })
    showToast('Draft ready. Review it, then check your match estimate.')
    navigate(`/editor/${newResume.id}`)
  }

  // Accept = the AI draft; Keep mine = the draft made from the user's own words by the written rules
  const handleReviewChoice = async (useAi) => {
    setIsSaving(true)
    try {
      await saveDraft(useAi ? aiDraft : buildResumeDraft(draftOptions))
    } catch (error) {
      showToast(error.message, 'error')
      setIsSaving(false)
    }
  }

  if (isCatalogLoading) return <PageLoader message="Loading companies and roles…" />

  const jobSkillCount = findSkillsInText(target.jobDescription).length
  const generatingSteps = [
    jobSkillCount ? `Reading the job description: ${jobSkillCount} skills found` : 'No job description, using your details only',
    `Ordering sections: ${company.sectionOrder.slice(0, 3).map((key) => SECTION_LABELS[key]).join(', ')}…`,
    `Writing a summary from your degree, skills and best project`,
    `Turning your sentences into bullet points`,
    `Applying the ${selectedTemplate?.name} template`,
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Create a resume" description="Paste the job you are applying for, then add your own details. The draft uses only what you type." />

      <div className="mb-6">
        <TargetStrip companyName={target.companyName} roleTitle={target.roleTitle} detail={target.roleTitle && `${selectedTemplate?.name} template`} />
      </div>

      {isGenerating ? (
        <GeneratingState steps={generatingSteps} />
      ) : (
        <>
          <WizardProgress currentStep={step} />
          {step === 1 && <StepTarget target={target} onTargetChange={setTarget} companies={companies} roles={roles} errors={errors} company={company} role={role} templateName={templates.find((template) => template.id === company.preferredTemplate)?.name} />}
          {step === 2 && <StepTemplate templates={templates} selectedTemplateId={selectedTemplate?.id} onSelect={setChosenTemplateId} recommendedIds={recommendedIds} previewResume={previewResume} companyName={company.name} />}
          {step === 3 && <StepBasics basics={basics} onChange={handleBasicsChange} onBlur={handleBasicsBlur} onFieldChange={handleBasicsFieldChange} errors={errors} role={role} showEntryErrors={showEntryErrors} />}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            {step > 1 ? (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={18} aria-hidden="true" /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight size={18} aria-hidden="true" />
              </Button>
            ) : (
              <Button size="lg" onClick={handleGenerate} title={AI_TOOLTIP}>
                <PenLine size={18} aria-hidden="true" /> Generate with AI <AiBadge />
              </Button>
            )}
          </div>
        </>
      )}

      {aiDraft && (
        <ReviewChangesDialog
          title="Review your AI draft"
          items={buildDraftReviewItems(aiDraft, basics, previewResume.summary, role.title, companyName)}
          source={aiDraft.source}
          onAccept={() => handleReviewChoice(true)}
          onKeep={() => handleReviewChoice(false)}
          onClose={() => setAiDraft(null)}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}

// The before / after rows for the AI draft. "Yours" is what the user typed (and the summary the written
// rules make from it); the fact check compares the AI text with everything the user typed.
function buildDraftReviewItems(aiDraft, basics, ownSummary, roleTitle, companyName) {
  const typedProjects = basics.projects.filter((entry) => entry.name?.trim())
  const typedExperience = basics.experience.filter((entry) => entry.jobTitle?.trim() || entry.company?.trim())
  const entryText = (entry) => Object.values(entry).filter((value) => typeof value === 'string').join('\n')
  const allTyped = [
    basics.fullName, basics.degree, basics.institution, basics.graduationYear, basics.score, basics.location,
    roleTitle, companyName, basics.skills.join(', '), ...typedProjects.map(entryText), ...typedExperience.map(entryText),
  ].filter(Boolean).join('\n')

  return [
    { label: 'Summary', before: ownSummary, after: aiDraft.summary, original: allTyped },
    ...aiDraft.projects.map((entry, index) => ({ label: `Project: ${entry.name}`, before: typedProjects[index]?.bullets || '', after: entry.bullets, original: allTyped })),
    ...aiDraft.experience.map((entry, index) => ({
      label: `Experience: ${[entry.jobTitle, entry.company].filter(Boolean).join(' · ')}`,
      before: typedExperience[index]?.bullets || '',
      after: entry.bullets,
      original: allTyped,
    })),
  ].filter((item) => item.after)
}

export default CreateResumePage
