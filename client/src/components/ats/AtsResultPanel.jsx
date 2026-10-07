// Full ATS report: score, skills, section checks, fixes and how the score works.
import { Link } from 'react-router-dom'
import ScoreCircle from '../ScoreCircle'
import KeywordChips from '../KeywordChips'
import ScoreBreakdown from './ScoreBreakdown'
import SectionChecks from './SectionChecks'
import SuggestionList from './SuggestionList'
import AtsExplainer from './AtsExplainer'

function AtsResultPanel({ report, resumeId }) {
  const panelClasses = 'rounded-lg border border-line bg-paper p-5'
  const skillChips = [...report.missingSkills.map((word) => ({ word, matched: false })), ...report.matchedSkills.map((word) => ({ word, matched: true }))]

  return (
    <div className="space-y-4" aria-live="polite">
      <section aria-label="ATS score" className={`${panelClasses} flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8`}>
        <ScoreCircle score={report.score} size={190} />
        <ScoreBreakdown breakdown={report.breakdown} />
      </section>

      {!report.hasJobDescription && (
        <p className="rounded-md border border-amber/30 bg-amber-soft px-4 py-3 text-[15px] font-semibold">
          Add a job description to get a match score. This score only checks sections and bullet quality.
        </p>
      )}

      {report.hasJobDescription && (
        <section className={panelClasses}>
          <h2 className="mb-1 flex items-baseline justify-between gap-3 text-xl font-bold">
            Skills from the job description
            {report.jobSkills.length > 0 && (
              <span className="tabular text-sm font-semibold text-ink-soft">
                {report.matchedSkills.length} of {report.jobSkills.length} found
              </span>
            )}
          </h2>
          {report.jobSkills.length ? (
            <>
              <p className="mb-3 text-sm text-ink-soft">Green = in your resume. Red = missing. Add a missing skill only if you really have it.</p>
              <KeywordChips keywords={skillChips} />
            </>
          ) : (
            <p className="text-[15px] text-ink-soft">We couldn't find any known skills in this job description, so skills aren't scored. Paste the full job post for a better check.</p>
          )}
          {report.jobTitle && (
            <p className="mt-4 text-[15px]">
              Job title “{report.jobTitle}”: {report.titleFound ? 'mentioned in your resume.' : 'not mentioned yet. '}
              {!report.titleFound && resumeId && (
                <Link to={`/editor/${resumeId}?section=summary`} className="font-semibold text-navy underline">
                  Add it to your summary
                </Link>
              )}
            </p>
          )}
        </section>
      )}

      <section className={panelClasses}>
        <h2 className="mb-4 text-xl font-bold">What to fix first</h2>
        <SuggestionList suggestions={report.suggestions} resumeId={resumeId} />
      </section>

      <section className={panelClasses}>
        <h2 className="mb-2 text-xl font-bold">Section checks</h2>
        <SectionChecks checks={report.sectionChecks} resumeId={resumeId} />
      </section>

      <AtsExplainer />
    </div>
  )
}

export default AtsResultPanel
