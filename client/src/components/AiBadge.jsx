// Small tag on AI buttons and AI results: "AI · Gemini", or "Basic mode" when the written rules were used.
export const AI_TOOLTIP = 'Written by Google Gemini from your own details. You review it before anything changes.'
export const BASIC_TOOLTIP = 'The AI was busy, so simple written rules were used. They only tidy what you typed.'

function AiBadge({ source = 'ai', className = '' }) {
  const isBasic = source === 'basic'
  return (
    <span
      title={isBasic ? BASIC_TOOLTIP : AI_TOOLTIP}
      className={`rounded-[3px] px-1 py-px text-[10px] leading-tight font-bold tracking-wide whitespace-nowrap uppercase ${isBasic ? 'bg-line text-ink-soft' : 'bg-board text-ink'} ${className}`}
    >
      {isBasic ? 'Basic mode' : 'AI · Gemini'}
    </span>
  )
}

export default AiBadge
