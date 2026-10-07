// Landing page section that previews the ATS checker.
import { Check } from 'lucide-react'
import Button from '../Button'
import ScoreCircle from '../ScoreCircle'
import KeywordChips from '../KeywordChips'
import sampleResumes from '../../data/sampleResumes'
import { calculateAtsScore } from '../../utils/atsScore'

// A real report for the sample Frontend Developer resume
const sampleResume = sampleResumes.find((resume) => resume.id === 'r-aarav-frontend')
const sampleReport = sampleResume && calculateAtsScore(sampleResume, sampleResume.jobDescription)
const SAMPLE_SKILLS = sampleReport ? [...sampleReport.matchedSkills.slice(0, 6).map((word) => ({ word, matched: true })), ...sampleReport.missingSkills.map((word) => ({ word, matched: false }))] : []

const REPORT_ITEMS = ['A score out of 100, with a plain explanation of every point', 'Skills from the job description: matched and missing', 'Section and bullet point checks', 'Fixes ranked by impact, each linked to the right editor section']

function AtsTeaser() {
  return (
    <section aria-labelledby="ats-title" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
      <div>
        <h2 id="ats-title" className="font-board text-4xl leading-tight font-bold">
          Know your score before you apply
        </h2>
        <p className="mt-3 max-w-lg text-[17px] leading-relaxed text-ink-soft">
          Paste the job description and see how well your resume matches it. It's an estimate, like Jobscan, and it shows its working.
        </p>
        <ul className="mt-6 space-y-2.5">
          {REPORT_ITEMS.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px]">
              <Check size={18} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <Button to="/quick-check" className="mt-7">
          Check my resume's ATS score
        </Button>
      </div>

      <figure className="rounded-lg border border-line bg-paper p-6 shadow-panel">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ScoreCircle score={sampleReport?.score ?? 0} size={150} />
          <div>
            <h3 className="board-text text-[13px] text-ink-soft">Skills from the job description</h3>
            <div className="mt-2">
              <KeywordChips keywords={SAMPLE_SKILLS} />
            </div>
          </div>
        </div>
        <figcaption className="mt-4 text-xs text-ink-faint">Real report for the sample Frontend Developer resume.</figcaption>
      </figure>
    </section>
  )
}

export default AtsTeaser
