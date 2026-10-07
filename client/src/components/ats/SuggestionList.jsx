// List of fixes, most important first, with "Fix in editor" links.
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import StatusStamp from '../StatusStamp'

const PRIORITY_TONES = { high: 'maroon', medium: 'amber', low: 'neutral' }

function SuggestionList({ suggestions, resumeId }) {
  if (suggestions.length === 0) {
    return <p className="text-[15px] text-ink-soft">Nothing important to fix. This resume covers the job description well.</p>
  }

  return (
    <ol className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <li key={index} className="flex flex-col gap-2 rounded-md border border-line p-3 sm:flex-row sm:items-start sm:gap-3">
          <StatusStamp tone={PRIORITY_TONES[suggestion.priority]} className="self-start">
            {suggestion.priority}
          </StatusStamp>
          <p className="flex-1 text-[15px] leading-relaxed">{suggestion.text}</p>
          {/* No saved resume yet (quick check): no editor link */}
          {resumeId && (
            <Link
              to={`/editor/${resumeId}?section=${suggestion.section}`}
              className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold whitespace-nowrap text-navy underline"
            >
              Fix in editor <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </li>
      ))}
    </ol>
  )
}

export default SuggestionList
