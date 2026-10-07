// Checklist of the sections a resume should have.
import { Link } from 'react-router-dom'
import { CircleCheck, CircleX } from 'lucide-react'

function SectionChecks({ checks, resumeId }) {
  return (
    <ul className="divide-y divide-line">
      {checks.map((check) => (
        <li key={check.id} className="flex items-center gap-3 py-2.5 text-[15px]">
          {check.passed ? (
            <CircleCheck size={20} className="shrink-0 text-signal" aria-hidden="true" />
          ) : (
            <CircleX size={20} className="shrink-0 text-maroon" aria-hidden="true" />
          )}
          <span className="flex-1">
            {check.label}
            <span className="sr-only">{check.passed ? ': present' : ': missing'}</span>
          </span>
          {!check.passed && resumeId && (
            <Link to={`/editor/${resumeId}?section=${check.section}`} className="text-sm font-semibold text-navy underline">
              Add it
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export default SectionChecks
