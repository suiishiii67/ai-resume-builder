// "Improve with AI" button with a loading state and an "AI · Gemini" badge.
import { PenLine } from 'lucide-react'
import Spinner from '../Spinner'
import AiBadge, { AI_TOOLTIP } from '../AiBadge'

function ImproveWithAiButton({ onClick, isLoading, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      aria-busy={isLoading || undefined}
      title={AI_TOOLTIP}
      className="group inline-flex h-8 items-center gap-1.5 rounded-md border border-navy/30 bg-paper px-2.5 text-sm font-semibold text-navy hover:border-navy hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? <Spinner size={14} label="Writing" /> : <PenLine size={15} aria-hidden="true" />}
      {isLoading ? 'Writing…' : 'Improve with AI'}
      <AiBadge />
    </button>
  )
}

export default ImproveWithAiButton
