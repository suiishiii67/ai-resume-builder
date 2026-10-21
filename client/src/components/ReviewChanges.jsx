// Before / after view of an AI suggestion. Nothing is changed until the user clicks Accept.
// items: [{ label, before, after, original }]
//   before   = the user's current text, after = the suggestion,
//   original = the text the fact check compares with (usually the same as before)
import { findNewFacts } from '../utils/factCheck'
import FactCheckedText, { FACT_CHECK_TOOLTIP } from './FactCheckedText'
import AiBadge from './AiBadge'

function ReviewChanges({ items, source }) {
  const checkCount = items.reduce((total, item) => total + findNewFacts(item.after, item.original ?? item.before).length, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[15px]">
        <AiBadge source={source} />
        <span className="text-ink-soft">Nothing changes until you click Accept.</span>
      </div>
      {checkCount > 0 && (
        <p className="rounded-md border border-amber/30 bg-amber-soft px-3 py-2 text-sm font-semibold" title={FACT_CHECK_TOOLTIP}>
          {checkCount === 1 ? '1 part is' : `${checkCount} parts are`} highlighted in yellow: they are not in your original text. Check them before accepting.
        </p>
      )}

      {items.map((item) => (
        <section key={item.label}>
          <h3 className="mb-1.5 text-[15px] font-bold">{item.label}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-ground p-3 text-[14px]">
              <p className="board-text mb-1 text-[12px] text-ink-faint">Yours</p>
              <p className="whitespace-pre-line">{item.before || <span className="text-ink-faint">(empty)</span>}</p>
            </div>
            <div className="rounded-md border-2 border-navy/40 bg-paper p-3 text-[14px]">
              <p className="board-text mb-1 text-[12px] text-navy">Suggestion</p>
              <p>
                <FactCheckedText text={item.after} original={item.original ?? item.before} />
              </p>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

export default ReviewChanges
