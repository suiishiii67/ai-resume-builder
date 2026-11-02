// Up/down list to set a company's or template's section order.
import { ArrowUp, ArrowDown } from 'lucide-react'
import { SECTION_LABELS } from '../../data/sections'

function SectionOrderEditor({ value, onChange, label = 'Section order' }) {
  // direction: -1 = up, +1 = down
  const moveSection = (index, direction) => {
    const newOrder = [...value]
    ;[newOrder[index], newOrder[index + direction]] = [newOrder[index + direction], newOrder[index]]
    onChange(newOrder)
  }

  const buttonClasses = 'grid size-8 place-items-center rounded text-ink-soft hover:bg-ink/5 hover:text-ink disabled:opacity-30'

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
      <ol className="divide-y divide-line rounded-md border border-line-strong">
        {value.map((sectionKey, index) => (
          <li key={sectionKey} className="flex items-center gap-3 px-3 py-1.5">
            <span className="tabular w-4 text-sm text-ink-faint">{index + 1}</span>
            <span className="flex-1 font-medium">{SECTION_LABELS[sectionKey]}</span>
            <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} aria-label={`Move ${SECTION_LABELS[sectionKey]} up`} className={buttonClasses}>
              <ArrowUp size={15} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => moveSection(index, 1)} disabled={index === value.length - 1} aria-label={`Move ${SECTION_LABELS[sectionKey]} down`} className={buttonClasses}>
              <ArrowDown size={15} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </fieldset>
  )
}

export default SectionOrderEditor
