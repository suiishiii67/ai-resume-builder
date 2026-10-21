// Shows which target keywords are used or missing in the resume.
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { getTargetKeywords } from '../../utils/targetProfile'
import { resumeToText, resumeToPlainText, containsKeyword } from '../../utils/keywordUtils'
import { textHasSkill, getJobSkills } from '../../utils/jobDescription'
import KeywordChips from '../KeywordChips'

function KeywordPanel({ company, role, resumeData, onAddSkill }) {
  const [isOpen, setIsOpen] = useState(true)

  // With a job description: its skills. Older resumes: the sample role and company keywords.
  const jobSkills = getJobSkills(resumeData)
  const hasJobSkills = jobSkills.length > 0
  // No job description and no sample role: nothing to compare against yet
  if (!hasJobSkills && role.isCustom) {
    return (
      <section aria-label="Keywords for this target" className="rounded-lg border border-dashed border-line-strong bg-paper px-4 py-3 text-[15px]">
        <p className="font-semibold">No job description yet</p>
        <p className="mt-0.5 text-sm text-ink-soft">Open the full ATS report and paste a job description. Its skills will show here, green when your resume has them.</p>
      </section>
    )
  }

  const resumeText = resumeToText(resumeData)
  const plainText = resumeToPlainText(resumeData)
  const keywords = hasJobSkills
    ? jobSkills.map((skill) => ({ word: skill, type: 'skill', matched: textHasSkill(plainText, skill) }))
    : getTargetKeywords(company, role).map((keyword) => ({ ...keyword, matched: containsKeyword(resumeText, keyword.word) }))
  const skillKeywords = keywords.filter((keyword) => keyword.type === 'skill')
  const otherKeywords = keywords.filter((keyword) => keyword.type === 'keyword')
  const usedCount = keywords.filter((keyword) => keyword.matched).length
  const coveragePercent = keywords.length ? Math.round((usedCount / keywords.length) * 100) : 0

  return (
    <section aria-label="Keywords for this target" className="overflow-hidden rounded-lg border border-line bg-paper">
      <button type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="board-text rounded-[3px] bg-board px-1.5 py-0.5 text-[13px]">Keywords</span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
          {[resumeData.companyName, resumeData.roleTitle].filter(Boolean).join(' · ') || 'No target yet'}
        </span>
        <span className="tabular text-sm font-semibold text-ink-soft">
          {usedCount} of {keywords.length} used
        </span>
        <ChevronDown size={18} aria-hidden="true" className={`shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
      </button>

      <div className="mx-4 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-signal transition-[width] duration-500" style={{ width: `${coveragePercent}%` }} />
      </div>

      {isOpen && (
        <div className="space-y-4 px-4 pt-3 pb-4">
          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-ink-soft">
              {hasJobSkills ? 'Skills from the job description' : 'Role skills'}: click a missing one to add it to Skills, only if you have it
            </h3>
            <KeywordChips keywords={skillKeywords} onAdd={onAddSkill} missingTone="grey" />
          </div>
          {otherKeywords.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-ink-soft">Use these words in your summary or bullet points</h3>
              <KeywordChips keywords={otherKeywords} missingTone="grey" />
            </div>
          )}
        </div>
      )}
      {!isOpen && <div className="h-3" />}
    </section>
  )
}

export default KeywordPanel
