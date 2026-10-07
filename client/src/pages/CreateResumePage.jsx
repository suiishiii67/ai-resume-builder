// Create Resume wizard (/create): target, template, details, then AI draft.
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useResumes } from '../context/ResumeContext'
import { useToast } from '../context/ToastContext'
import { resolveCompany, resolveRole, getTargetKeywords } from '../utils/targetProfile'
import { validateRequiredFields, validateBasicsForm, hasErrors } from '../utils/validation'
import { buildResumeDraft, generateResume } from '../services/aiService'
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
  const [target, setTarget] = useState({ companyName: '', companyId: '', roleTitle: '', roleId: '' })
  // '' = use the company's recommended template
  const [chosenTemplateId, setChosenTemplateId] = useState(searchParams.get('template') || '')
  const [basics, setBasics] = useState({ fullName: user.name, email: user.email, phone: '', location: '', degree: '', institution: '', graduationYear: '', score: '', experienceLevel: 'internship', lastCompany: '' })
  const [errors, setErrors] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)

  // Worked out from the target
  const company = resolveCompany(companies, target.companyId, target.companyName)
  const role = resolveRole(roles, target.roleId, target.roleTitle)
  const selectedTemplateId = chosenTemplateId || company.preferredTemplate
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || templates[0]
  const recommendedIds = [...new Set([company.preferredTemplate, ...templates.filter((template) => template.roles.includes(role.id)).map((template) => template.id)])]

  const previewResume = useMemo(() => buildResumeDraft({ basics, company, role, templateId: selectedTemplateId }), [basics, company, role, selectedTemplateId])

  const handleNext = () => {
    if (step === 1) {
      const targetErrors = validateRequiredFields(target, { companyName: 'a target company', roleTitle: 'a job role' })
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

  // Check a field when the user leaves it
  const handleBasicsBlur = (event) => setErrors({ ...errors, [event.target.name]: validateBasicsForm(basics)[event.target.name] })

  const handleGenerate = async () => {
    const basicsErrors = validateBasicsForm(basics)
    setErrors(basicsErrors)
    if (hasErrors(basicsErrors)) return

    setIsGenerating(true)
    const draft = await generateResume({ basics, company, role, templateId: selectedTemplate.id })
    const newResume = await createResume(draft)
    showToast(`Draft ready for ${company.name}. Review it, then check your ATS score.`)
    navigate(`/editor/${newResume.id}`)
  }

  if (isCatalogLoading) return <PageLoader message="Loading companies and roles…" />

  const generatingSteps = [
    `Reading the ${company.name} profile`,
    `Ordering sections: ${company.sectionOrder.slice(0, 3).map((key) => SECTION_LABELS[key]).join(', ')}…`,
    `Writing a summary for a ${role.title}`,
    `Adding ${role.requiredSkills.length} skills and ${getTargetKeywords(company, role).length} keywords`,
    `Applying the ${selectedTemplate?.name} template`,
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Create a resume" description="Start with where you are applying. Everything else is tailored to it." />

      <div className="mb-6">
        <TargetStrip companyName={target.companyName} roleTitle={target.roleTitle} detail={target.companyName && `${company.type} · ${selectedTemplate?.name} template`} />
      </div>

      {isGenerating ? (
        <GeneratingState steps={generatingSteps} />
      ) : (
        <>
          <WizardProgress currentStep={step} />
          {step === 1 && <StepTarget target={target} onTargetChange={setTarget} companies={companies} roles={roles} errors={errors} company={company} role={role} templateName={templates.find((template) => template.id === company.preferredTemplate)?.name} />}
          {step === 2 && <StepTemplate templates={templates} selectedTemplateId={selectedTemplate?.id} onSelect={setChosenTemplateId} recommendedIds={recommendedIds} previewResume={previewResume} companyName={company.name} />}
          {step === 3 && <StepBasics basics={basics} onChange={handleBasicsChange} onBlur={handleBasicsBlur} errors={errors} />}

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
              <Button size="lg" onClick={handleGenerate}>
                <PenLine size={18} aria-hidden="true" /> Generate with AI
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CreateResumePage
