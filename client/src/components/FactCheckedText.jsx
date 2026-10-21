// Shows an AI text with the parts that were not in the user's original highlighted in yellow.
import { splitByNewFacts } from '../utils/factCheck'

export const FACT_CHECK_TOOLTIP = 'Check this: not in your original text'

function FactCheckedText({ text, original }) {
  return (
    <span className="whitespace-pre-line">
      {splitByNewFacts(text, original).map((piece, index) =>
        piece.isNew ? (
          <mark key={index} title={FACT_CHECK_TOOLTIP} className="rounded-[2px] bg-[#ffe66d] px-0.5 text-ink">
            {piece.text}
            <span className="sr-only"> (check this: not in your original text)</span>
          </mark>
        ) : (
          <span key={index}>{piece.text}</span>
        )
      )}
    </span>
  )
}

export default FactCheckedText
