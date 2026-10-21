// Small live match estimate (the ATS score) in the editor. It updates as the user types.
import { ScanSearch } from 'lucide-react'
import { calculateAtsScore } from '../../utils/atsScore'
import { getJobText } from '../../utils/jobDescription'
import { getScoreBand } from '../../utils/scoreBand'
import { MATCH_ESTIMATE_NOTE } from '../ScoreCircle'

function AtsScoreBox({ resumeData, onOpenReport }) {
  const report = calculateAtsScore(resumeData, getJobText(resumeData))
  const band = getScoreBand(report.score)

  return (
    <section aria-label="Live match estimate" className="flex items-center gap-4 rounded-lg border border-line bg-paper px-4 py-3">
      <p className="tabular shrink-0 text-3xl leading-none font-bold" style={{ color: band.color }} aria-live="polite">
        {report.score}
        <span className="text-base text-ink-faint">/100</span>
      </p>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-bold text-ink">Live match estimate · {band.label}</p>
        <p className="text-ink-soft">
          {report.jobSkills.length
            ? `${report.matchedSkills.length} of ${report.jobSkills.length} job skills in your resume`
            : 'Add a job description to get a match score'}
        </p>
        <p className="mt-0.5 text-xs text-ink-faint">{MATCH_ESTIMATE_NOTE}</p>
      </div>
      <button type="button" onClick={onOpenReport} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy underline">
        <ScanSearch size={16} aria-hidden="true" /> Full report
      </button>
    </section>
  )
}

export default AtsScoreBox
