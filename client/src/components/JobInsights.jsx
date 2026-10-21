// "Analyse job description" button and the card it shows: must-have and nice-to-have skills,
// experience level and key points. One AI request per click (never while typing).
// If the AI is busy, only the skills our skill finder spots are shown, with a "Basic mode" label.
import { useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getJobInsights } from '../services/aiService'
import Button from './Button'
import TagList from './TagList'
import AiBadge from './AiBadge'

const MIN_LENGTH = 80

function JobInsights({ jobDescription }) {
  const [insights, setInsights] = useState(null)
  const [analysedText, setAnalysedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const isBusy = useRef(false) // stops a second request from a quick double click

  const text = (jobDescription || '').trim()

  const handleAnalyse = async () => {
    if (isBusy.current) return
    isBusy.current = true
    setIsLoading(true)
    setError('')
    try {
      setInsights(await getJobInsights(text))
      setAnalysedText(text)
    } catch (analyseError) {
      setInsights(null)
      setError(analyseError.message)
    }
    setIsLoading(false)
    isBusy.current = false
  }

  // Hide an old card once the job description has been changed
  const showCard = insights && analysedText === text
  const isBasic = insights?.source === 'basic'

  return (
    <div className="space-y-3">
      <Button variant="secondary" size="sm" onClick={handleAnalyse} loading={isLoading} disabled={text.length < MIN_LENGTH}>
        {!isLoading && <Sparkles size={15} aria-hidden="true" />} {isLoading ? 'Writing…' : 'Analyse job description'} <AiBadge />
      </Button>
      {error && <p className="text-sm font-semibold text-maroon">{error}</p>}

      {showCard && (
        <section aria-label="What this job asks for" className="space-y-3 rounded-md border border-line bg-ground p-4 text-[15px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">{insights.jobTitle || 'What this job asks for'}</h3>
            <AiBadge source={insights.source} />
          </div>

          <div>
            <p className="mb-1 text-sm font-semibold text-ink-soft">{isBasic ? 'Skills found in the text' : 'Must-have skills'}</p>
            {insights.mustHaveSkills.length ? <TagList tags={insights.mustHaveSkills} label="Must-have skills" /> : <p className="text-sm text-ink-faint">None found.</p>}
          </div>

          {!isBasic && (
            <>
              {insights.niceToHaveSkills.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-ink-soft">Nice to have</p>
                  <TagList tags={insights.niceToHaveSkills} label="Nice-to-have skills" />
                </div>
              )}
              {insights.experienceLevel && (
                <p>
                  <span className="text-sm font-semibold text-ink-soft">Experience: </span>
                  {insights.experienceLevel}
                </p>
              )}
              {insights.keyPoints.length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-semibold text-ink-soft">What to highlight</p>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {insights.keyPoints.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
          <p className="text-xs text-ink-faint">Add only skills you really have.</p>
        </section>
      )}
    </div>
  )
}

export default JobInsights
