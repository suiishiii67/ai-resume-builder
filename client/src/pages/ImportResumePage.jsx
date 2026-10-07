// Import a resume (/import): upload a PDF/Word file or paste text, check the fields, then open the editor.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardPaste, ArrowLeft, ArrowRight } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { useResumes } from '../context/ResumeContext'
import { useToast } from '../context/ToastContext'
import { readResumeFile, parseResumeText, countImportedFields, MIN_TEXT_LENGTH } from '../utils/resumeImport'
import { findResumeErrors } from '../utils/validation'
import { resolveCompany, resolveRole } from '../utils/targetProfile'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import TextArea from '../components/TextArea'
import FormAlert from '../components/FormAlert'
import Spinner from '../components/Spinner'
import Autocomplete from '../components/Autocomplete'
import ResumeFileInput from '../components/ResumeFileInput'
import PersonalInfoForm from '../components/editor/PersonalInfoForm'
import SummaryForm from '../components/editor/SummaryForm'
import SkillsForm from '../components/editor/SkillsForm'
import ExperienceForm from '../components/editor/ExperienceForm'
import ProjectsForm from '../components/editor/ProjectsForm'
import EducationForm from '../components/editor/EducationForm'
import CertificationsForm from '../components/editor/CertificationsForm'

const SCANNED_FILE_MESSAGE = "This PDF may be scanned or image-based. ATS systems can't read it either."

// The review screen shows these sections in this order
const REVIEW_SECTIONS = [
  { key: 'personal', title: 'Personal info', Form: PersonalInfoForm },
  { key: 'summary', title: 'Summary', Form: SummaryForm },
  { key: 'skills', title: 'Skills', Form: SkillsForm },
  { key: 'experience', title: 'Experience', Form: ExperienceForm },
  { key: 'projects', title: 'Projects', Form: ProjectsForm },
  { key: 'education', title: 'Education', Form: EducationForm },
  { key: 'certifications', title: 'Certifications', Form: CertificationsForm },
]

function ImportResumePage() {
  const { companies, roles } = useCatalog()
  const { createResume } = useResumes()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [pastedText, setPastedText] = useState('')
  const [error, setError] = useState('')
  const [isReading, setIsReading] = useState(false)
  // After reading: the fields we found, the raw text, and where it came from
  const [draft, setDraft] = useState(null)
  const [rawText, setRawText] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [target, setTarget] = useState({ companyName: '', companyId: '', roleTitle: '', roleId: '' })
  const [showErrors, setShowErrors] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const showReview = (text, source) => {
    setDraft(parseResumeText(text))
    setRawText(text)
    setSourceName(source)
    setShowErrors(false)
  }

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setIsReading(true)
    try {
      const text = await readResumeFile(file)
      if (text.trim().length < MIN_TEXT_LENGTH) setError(SCANNED_FILE_MESSAGE)
      else showReview(text, file.name)
    } catch (readError) {
      setError(readError.message)
    }
    setIsReading(false)
  }

  const handlePaste = () => {
    if (pastedText.trim().length < MIN_TEXT_LENGTH) {
      setError('Paste the full text of your resume (at least a few lines).')
      return
    }
    setError('')
    showReview(pastedText, 'pasted text')
  }

  const handleStartOver = () => {
    setDraft(null)
    setError('')
  }

  const handleContinue = async () => {
    const sectionsWithErrors = findResumeErrors(draft)
    if (sectionsWithErrors.length) {
      setShowErrors(true)
      document.getElementById(`review-${sectionsWithErrors[0]}`)?.scrollIntoView({ behavior: 'smooth' })
      showToast('Fix the highlighted fields before continuing.', 'error')
      return
    }

    // The target is optional; a company or role we don't know is kept as typed
    const company = target.companyName.trim() ? resolveCompany(companies, target.companyId, target.companyName) : null
    const role = target.roleTitle.trim() ? resolveRole(roles, target.roleId, target.roleTitle) : null
    const title = [company?.name, role?.title].filter(Boolean).join(' – ') || `${draft.personal.fullName || 'My'} resume`.trim()

    setIsSaving(true)
    const newResume = await createResume({
      ...draft,
      title,
      templateId: company && !company.isCustom ? company.preferredTemplate : draft.templateId,
      companyId: company?.id || '',
      companyName: company?.name || '',
      roleId: role?.id || '',
      roleTitle: role?.title || '',
      createdVia: 'import',
    })
    showToast('Resume imported. Check the preview, then save.')
    navigate(`/editor/${newResume.id}`)
  }

  // ---------- Step 1: choose a file or paste text ----------
  if (!draft) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Import my resume" description="Upload the resume you already have, or paste its text. We read it and fill in the fields for you to check." />
        <FormAlert message={error} />

        {isReading ? (
          <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-line bg-paper px-6 py-16 text-center">
            <Spinner size={30} label="Reading" />
            <p className="text-[15px] font-semibold">Reading your resume…</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="flex flex-col rounded-lg border border-line bg-paper p-5">
              <h2 className="mb-3 text-lg font-bold">Upload a file</h2>
              <ResumeFileInput onFile={handleFile} />
            </section>

            <section className="rounded-lg border border-line bg-paper p-5">
              <h2 className="mb-3 text-lg font-bold">Or paste the text</h2>
              <TextArea
                id="resume-text"
                label="Resume text"
                rows={10}
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                placeholder={'Your Name\nemail@example.com | +91 98200 12345\n\nSKILLS\nJava, Python, React\n\nPROJECTS\n…'}
                hint="Copy everything from your resume and paste it here."
              />
              <Button className="mt-4" onClick={handlePaste}>
                <ClipboardPaste size={18} aria-hidden="true" /> Read this text
              </Button>
            </section>
          </div>
        )}
      </div>
    )
  }

  // ---------- Step 2: check and correct what we found ----------
  const counts = countImportedFields(draft)
  const foundText = `${counts.skills} skills, ${counts.experience} experience, ${counts.projects} projects, ${counts.education} education and ${counts.certifications} certification entries`

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Check what we found" description="We filled these fields from your resume using simple rules, so some may be in the wrong place. Correct anything that looks wrong, then continue." />

      <p className="mb-5 rounded-md border border-line bg-paper px-4 py-3 text-[15px]">
        From <span className="font-semibold">{sourceName}</span> we found {foundText}.
      </p>

      <div className="space-y-4">
        <section className="rounded-lg border border-line bg-paper p-5">
          <h2 className="mb-1 text-lg font-bold">Target job (optional)</h2>
          <p className="mb-4 text-sm text-ink-soft">Add the company and role you are applying for, or leave empty and set it later in the editor.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Autocomplete
              id="import-company"
              label="Target company"
              value={target.companyName}
              options={companies.map((company) => ({ id: company.id, label: company.name, meta: company.type }))}
              placeholder="e.g. Infosys"
              onTextChange={(text) => setTarget({ ...target, companyName: text, companyId: '' })}
              onSelect={(option) => setTarget({ ...target, companyName: option.label, companyId: option.id })}
            />
            <Autocomplete
              id="import-role"
              label="Job role"
              value={target.roleTitle}
              options={roles.map((role) => ({ id: role.id, label: role.title, meta: role.category }))}
              placeholder="e.g. Frontend Developer"
              onTextChange={(text) => setTarget({ ...target, roleTitle: text, roleId: '' })}
              onSelect={(option) => setTarget({ ...target, roleTitle: option.label, roleId: option.id })}
            />
          </div>
        </section>

        {REVIEW_SECTIONS.map(({ key, title, Form }) => (
          <section key={key} id={`review-${key}`} className="scroll-mt-24 rounded-lg border border-line bg-paper p-5">
            <h2 className="mb-4 text-lg font-bold">{title}</h2>
            <Form value={draft[key]} onChange={(value) => setDraft({ ...draft, [key]: value })} showErrors={showErrors} />
          </section>
        ))}

        <details className="rounded-lg border border-line bg-paper p-5">
          <summary className="cursor-pointer text-[15px] font-semibold">Show the text we read</summary>
          <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-ground p-3 text-sm whitespace-pre-wrap">{rawText}</pre>
        </details>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        <Button variant="secondary" onClick={handleStartOver}>
          <ArrowLeft size={18} aria-hidden="true" /> Start over
        </Button>
        <Button size="lg" onClick={handleContinue} loading={isSaving}>
          Continue to editor <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export default ImportResumePage
