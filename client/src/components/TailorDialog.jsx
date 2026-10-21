// "Tailor for a new job": makes a copy of a resume for a new job description.
// The original resume is not changed.
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import { useResumes } from '../context/ResumeContext'
import { useToast } from '../context/ToastContext'
import { tailorSummary, BASIC_MODE_MESSAGE } from '../services/aiService'
import { findSkillsInText, textHasSkill, guessJobTitle, buildJobDescription, getJobText } from '../utils/jobDescription'
import { resumeToPlainText } from '../utils/keywordUtils'
import { calculateAtsScore } from '../utils/atsScore'
import { resumeToFactText } from '../utils/factCheck'
import { resolveCompany, resolveRole } from '../utils/targetProfile'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import JobDescriptionBox from './JobDescriptionBox'
import KeywordChips from './KeywordChips'
import AiBadge, { AI_TOOLTIP } from './AiBadge'
import ReviewChanges from './ReviewChanges'
import JobInsights from './JobInsights'

const MIN_JD_LENGTH = 80

function TailorDialog({ resume, onClose }) {
  const { companies, roles } = useCatalog()
  const { createResume, saveScore } = useResumes()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState('job') // 'job' → 'skills' → 'review'
  const [job, setJob] = useState({ jobDescription: '', jobTitle: '', companyName: '' })
  const [errors, setErrors] = useState({})
  const [tickedSkills, setTickedSkills] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [pending, setPending] = useState(null) // { copy, summary, source }: the new summary waiting for review
  const isBusy = useRef(false) // stops a second request from a quick double click

  // Skills the job asks for, split into the ones the resume has and the ones it doesn't
  const jobSkills = findSkillsInText(job.jobDescription)
  const resumeText = resumeToPlainText(resume)
  const matchedSkills = jobSkills.filter((skill) => textHasSkill(resumeText, skill))
  const missingSkills = jobSkills.filter((skill) => !matchedSkills.includes(skill))

  const handleJobDescriptionChange = (jobDescription) => {
    setJob({ ...job, jobDescription, jobTitle: job.jobTitle.trim() ? job.jobTitle : guessJobTitle(jobDescription) })
    setErrors({ ...errors, jobDescription: '' })
  }

  const handleNext = () => {
    const newErrors = {
      jobDescription: job.jobDescription.trim().length < MIN_JD_LENGTH ? `Paste the full job description (at least ${MIN_JD_LENGTH} characters).` : '',
      jobTitle: job.jobTitle.trim() ? '' : 'Enter the job title.',
    }
    setErrors(newErrors)
    if (!newErrors.jobDescription && !newErrors.jobTitle) setStep('skills')
  }

  const toggleSkill = (skill) => setTickedSkills((current) => (current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]))

  // Step 2 → 3: build the copy and ask for a summary written for the new job (nothing is saved yet)
  const handleWriteSummary = async () => {
    if (isBusy.current) return
    isBusy.current = true
    setIsWriting(true)
    const company = job.companyName.trim() ? resolveCompany(companies, '', job.companyName) : null
    const role = resolveRole(roles, '', job.jobTitle)

    // Skills that match the job go to the top, then the ticked ones, then the rest
    const isJobSkill = (skill) => jobSkills.some((jobSkill) => textHasSkill(skill, jobSkill))
    const skills = [...resume.skills.filter(isJobSkill), ...tickedSkills, ...resume.skills.filter((skill) => !isJobSkill(skill))]

    const copy = {
      ...structuredClone(resume),
      title: [company?.name, role.title].filter(Boolean).join(' – '),
      companyId: company?.id || '',
      companyName: company?.name || '',
      roleId: role.id,
      roleTitle: role.title,
      skills,
      jobDescription: buildJobDescription(job.jobDescription, { title: job.jobTitle, company: job.companyName }),
      tailoredFrom: resume.id,
    }
    try {
      const { summary, source } = await tailorSummary(copy, job.jobDescription)
      if (source === 'basic') showToast(BASIC_MODE_MESSAGE, 'info')
      setPending({ copy, summary, source })
      setStep('review')
    } catch (error) {
      showToast(error.message, 'error')
    }
    setIsWriting(false)
    isBusy.current = false
  }

  // Step 3: Accept = the new summary, Keep mine = the current summary. Either way a NEW copy is made.
  const handleCreate = async (useNewSummary) => {
    setIsCreating(true)
    try {
      const summary = useNewSummary ? pending.summary : resume.summary
      const newResume = await createResume({ ...pending.copy, summary })
      const report = calculateAtsScore(newResume, getJobText(newResume))
      await saveScore(newResume.id, report.score)
      showToast(`Tailored copy created. New match estimate: ${report.score}/100. Your original resume is unchanged.`)
      navigate(`/editor/${newResume.id}`)
    } catch (error) {
      showToast(error.message, 'error')
      setIsCreating(false)
    }
  }

  const footer =
    step === 'job' ? (
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleNext}>Next: check skills</Button>
      </>
    ) : step === 'skills' ? (
      <>
        <Button variant="secondary" onClick={() => setStep('job')} disabled={isWriting}>
          <ArrowLeft size={17} aria-hidden="true" /> Back
        </Button>
        <Button onClick={handleWriteSummary} loading={isWriting} title={AI_TOOLTIP}>
          {!isWriting && <Target size={17} aria-hidden="true" />} {isWriting ? 'Writing…' : 'Write summary for this job'} <AiBadge />
        </Button>
      </>
    ) : (
      <>
        <Button variant="secondary" onClick={() => handleCreate(false)} disabled={isCreating}>Keep mine</Button>
        <Button onClick={() => handleCreate(true)} loading={isCreating}>Accept</Button>
      </>
    )

  return (
    <Modal title={`Tailor “${resume.title}” for a new job`} size={step === 'review' ? 'xl' : 'lg'} onClose={isCreating ? () => {} : onClose} footer={footer}>
      {step === 'review' ? (
        <div className="space-y-4">
          <p className="text-[15px] text-ink-soft">
            Accept or keep your summary: either way a new copy is created and your original resume stays as it is.
          </p>
          <ReviewChanges
            items={[{ label: 'Summary', before: resume.summary, after: pending.summary, original: resumeToFactText(pending.copy) }]}
            source={pending.source}
          />
        </div>
      ) : step === 'job' ? (
        <div className="space-y-4">
          <p className="text-[15px] text-ink-soft">We make a copy for the new job. Your original resume stays as it is.</p>
          <JobDescriptionBox id="tailor-job-description" value={job.jobDescription} onChange={handleJobDescriptionChange} error={errors.jobDescription} rows={8} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="tailor-job-title" label="Job title" required value={job.jobTitle} error={errors.jobTitle} onChange={(event) => setJob({ ...job, jobTitle: event.target.value })} placeholder="e.g. Frontend Developer" />
            <Input id="tailor-company" label="Company (optional)" value={job.companyName} onChange={(event) => setJob({ ...job, companyName: event.target.value })} placeholder="e.g. Infosys" />
          </div>
          <JobInsights jobDescription={job.jobDescription} />
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 font-bold">Already in your resume ({matchedSkills.length})</h3>
            {matchedSkills.length ? (
              <KeywordChips keywords={matchedSkills.map((word) => ({ word, matched: true }))} />
            ) : (
              <p className="text-[15px] text-ink-soft">None of the job's skills are in this resume yet.</p>
            )}
            <p className="mt-2 text-sm text-ink-soft">These move to the top of your skills.</p>
          </div>

          <fieldset>
            <legend className="mb-1 font-bold">Missing from your resume ({missingSkills.length})</legend>
            {missingSkills.length ? (
              <>
                <p className="mb-3 text-sm font-semibold text-maroon">Tick only the ones you really have.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {missingSkills.map((skill) => (
                    <label key={skill} className="flex items-center gap-2.5 rounded-md border border-line px-3 py-2 text-[15px]">
                      <input type="checkbox" checked={tickedSkills.includes(skill)} onChange={() => toggleSkill(skill)} className="size-4" />
                      {skill}
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[15px] text-ink-soft">Nothing missing. Your resume already has every skill this job lists.</p>
            )}
          </fieldset>

          <p className="rounded-md border border-line bg-ground px-3 py-2.5 text-sm leading-relaxed">
            The copy is named “{[job.companyName.trim(), job.jobTitle.trim()].filter(Boolean).join(' – ')}”, and its summary is rewritten for this job using only your own details.
          </p>
        </div>
      )}
    </Modal>
  )
}

export default TailorDialog
