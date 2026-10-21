// Circular ring that shows the match estimate (the ATS score) out of 100.
import { getScoreBand } from '../utils/scoreBand'

// Shown under the main score, so users know what the number means
export const MATCH_ESTIMATE_NOTE = 'An estimate of how well your resume matches this job. Real company systems differ. Add only skills you really have.'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ScoreCircle({ score, size = 200 }) {
  const band = getScoreBand(score)
  const dashOffset = CIRCUMFERENCE * (1 - score / 100)

  return (
    <figure className="flex flex-col items-center" aria-label={`Match estimate ${score} out of 100, ${band.label}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--color-line)" strokeWidth="9" />
          {/* The dash offset hides (100 - score)% of the ring */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={band.color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="animate-ring-sweep"
            style={{ '--ring-from': CIRCUMFERENCE, '--ring-to': dashOffset }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-board tabular leading-none font-bold text-ink" style={{ fontSize: size * 0.36 }}>
            {score}
          </span>
          <span className="tabular text-sm font-semibold text-ink-faint">out of 100</span>
        </div>
      </div>
      <figcaption className="board-text mt-2 text-lg" style={{ color: band.color }}>
        {band.label}
      </figcaption>
    </figure>
  )
}

export default ScoreCircle
