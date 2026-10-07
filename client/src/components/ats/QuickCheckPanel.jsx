// Quick ATS check: upload or paste a resume, paste a job description, get the score.
// Used on the ATS checker page ("Upload my resume") and the public /quick-check page.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanSearch, PenLine, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useResumes } from '../../context/ResumeContext'
import { analyzeResume, saveAtsCheck } from '../../services/atsService'
import { readResumeFile, parseResumeText, countImportedFields, MIN_TEXT_LENGTH } from '../../utils/resumeImport'
import { findSkillsInText } from '../../utils/jobDescription'
import { savePendingResume } from '../../utils/pendingResume'
import Button from '../Button'
import TextArea from '../TextArea'
import FormAlert from '../FormAlert'
import Spinner from '../Spinner'
import EmptyState from '../EmptyState'
import JobDescriptionBox from '../JobDescriptionBox'
import ResumeFileInput from '../ResumeFileInput'
import AtsResultPanel from './AtsResultPanel'

const UNREADABLE_MESSAGE = "We couldn't read text from this file. It may be scanned or image-based, and many ATS systems can't read it either."
const MIN_JD_LENGTH = 80

function QuickCheckPanel() {
  const { user } = useAuth()
  const { createResume } = useResumes()
  const navigate = useNavigate()

  const [inputMode, setInputMode] = useState('file') // 'file' or 'paste'
  const [resumeText, setResumeText] = useState('') // text read from the file
  const [sourceName, setSourceName] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [isReading, setIsReading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  // The checked resume and its report
  const [checked, setChecked] = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    setErrors({})
    setIsReading(true)
    try {
      const text = await readResumeFile(file)
      if (text.trim().length < MIN_TEXT_LENGTH) {
        setErrors({ resume: UNREADABLE_MESSAGE })
      } else {
        setResumeText(text)
        setSourceName(file.name)
      }
    } catch (readError) {
      setErrors({ resume: readError.message })
    }
    setIsReading(false)
  }

  const handleCheck = async () => {
    const text = inputMode === 'file' ? resumeText : pastedText
    const jdLength = jobDescription.trim().length
    const newErrors = {
      resume: text.trim().length < MIN_TEXT_LENGTH ? (inputMode === 'file' ? 'Upload your resume first.' : 'Paste the full text of your resume.') : '',
      jobDescription: jdLength > 0 && jdLength < MIN_JD_LENGTH ? `Paste the full job description (at least ${MIN_JD_LENGTH} characters), or leave it empty.` : '',
    }
    setErrors(newErrors)
    if (newErrors.resume || newErrors.jobDescription) return

    setIsChecking(true)
    const resume = parseResumeText(text)
    const report = await analyzeResume({ resume, jobDescription })
    await saveAtsCheck({ source: 'quick', userId: user?.id || '', score: report.score, jobTitle: report.jobTitle, hasJobDescription: report.hasJobDescription })
    setChecked({ resume, report, jobDescription: jobDescription.trim() })
    setIsChecking(false)
  }

  // Save the uploaded resume and open it in the editor (log in first if needed)
  const handleImprove = async () => {
    const { resume, report } = checked
    const newResume = {
      ...resume,
      title: report.jobTitle ? `${report.jobTitle} – Uploaded resume` : 'Uploaded resume',
      companyId: '',
      companyName: '',
      roleId: '',
      roleTitle: report.jobTitle,
      jobDescription: checked.jobDescription,
      jobSkills: findSkillsInText(checked.jobDescription),
      createdVia: 'import',
    }
    if (!user) {
      savePendingResume(newResume)
      // /continue-import needs a login, so this goes to the login page first
      navigate('/continue-import')
      return
    }
    setIsSaving(true)
    const savedResume = await createResume(newResume)
    navigate(`/editor/${savedResume.id}`)
  }

  const tabClasses = (mode) => `h-9 flex-1 rounded-md text-[15px] font-semibold ${inputMode === mode ? 'bg-navy text-white' : 'text-ink-soft hover:text-ink'}`
  const counts = resumeText ? countImportedFields(parseResumeText(resumeText)) : null

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-label="Your resume and the job description" className="space-y-5 rounded-lg border border-line bg-paper p-5 xl:sticky xl:top-6">
        <div>
          <h2 className="mb-3 text-lg font-bold">1. Your resume</h2>
          <div role="tablist" aria-label="How to add your resume" className="mb-3 flex gap-1 rounded-lg border border-line p-1">
            <button type="button" role="tab" aria-selected={inputMode === 'file'} className={tabClasses('file')} onClick={() => setInputMode('file')}>Upload file</button>
            <button type="button" role="tab" aria-selected={inputMode === 'paste'} className={tabClasses('paste')} onClick={() => setInputMode('paste')}>Paste text</button>
          </div>

          <FormAlert message={errors.resume} />

          {inputMode === 'file' &&
            (isReading ? (
              <div role="status" className="flex items-center justify-center gap-3 rounded-md border border-line py-10">
                <Spinner size={22} label="Reading" />
                <span className="text-[15px] font-semibold">Reading your resume…</span>
              </div>
            ) : resumeText ? (
              <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-ground px-4 py-3 text-[15px]">
                <p>
                  <span className="font-semibold">{sourceName}</span>
                  <span className="block text-sm text-ink-soft">
                    Found {counts.skills} skills, {counts.experience} experience, {counts.projects} projects and {counts.education} education entries.
                  </span>
                </p>
                <button type="button" onClick={() => setResumeText('')} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-navy underline">
                  <RefreshCw size={14} aria-hidden="true" /> Change
                </button>
              </div>
            ) : (
              <ResumeFileInput id="quick-resume-file" onFile={handleFile} compact />
            ))}

          {inputMode === 'paste' && (
            <TextArea id="quick-resume-text" label="Resume text" rows={8} value={pastedText} onChange={(event) => setPastedText(event.target.value)} placeholder="Copy everything from your resume and paste it here…" />
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">2. The job</h2>
          <JobDescriptionBox id="quick-job-description" value={jobDescription} onChange={setJobDescription} error={errors.jobDescription} rows={8} optional />
        </div>

        <Button size="lg" onClick={handleCheck} loading={isChecking} disabled={isReading}>
          {!isChecking && <ScanSearch size={18} aria-hidden="true" />} Check score
        </Button>
      </section>

      <div>
        {isChecking && (
          <div role="status" className="flex flex-col items-center gap-3 rounded-lg border border-line bg-paper px-6 py-16 text-center">
            <Spinner size={30} label="Checking" />
            <p className="text-[15px] font-semibold">Checking your resume against the job description…</p>
          </div>
        )}
        {!isChecking && checked && (
          <div className="space-y-4">
            <AtsResultPanel report={checked.report} />
            <div className="flex flex-col items-start gap-2 rounded-lg border-2 border-ink bg-board p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] font-semibold">Fix these points with a live preview and a live score.</p>
              <Button onClick={handleImprove} loading={isSaving}>
                {!isSaving && <PenLine size={17} aria-hidden="true" />} Improve this resume in the editor
              </Button>
            </div>
            {!user && <p className="text-sm text-ink-soft">You'll be asked to log in or sign up first. Your resume is kept until then.</p>}
          </div>
        )}
        {!isChecking && !checked && (
          <EmptyState
            icon={<ScanSearch size={24} aria-hidden="true" />}
            title="Your report will appear here"
            description="Upload your resume and paste the job description. You'll get a score out of 100, the skills you matched and missed, and what to fix first."
          />
        )}
      </div>
    </div>
  )
}

export default QuickCheckPanel
