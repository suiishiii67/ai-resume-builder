// Template preview card (used in the gallery and the wizard).
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import ResumePreview from './templates/ResumePreview'
import StatusStamp from './StatusStamp'
import { withDesignDefaults } from '../data/templateDesign'

function TemplateCard({ template, sampleResume, isRecommended, isSelected, onSelect, actionTo }) {
  const design = withDesignDefaults(template.design)
  const borderClasses = isSelected ? 'border-ink ring-[3px] ring-board' : 'border-line'

  const preview = (
    <div className="relative h-64 overflow-hidden border-b border-line bg-ground px-5 pt-4">
      {/* Each card shows the resume in this template's own section order */}
      <ResumePreview resume={{ ...sampleResume, sectionOrder: design.sectionOrder }} design={design} maxScale={0.42} />
      {isRecommended && (
        <StatusStamp tone="signal" className="absolute top-3 left-3 bg-paper">
          Recommended
        </StatusStamp>
      )}
      {isSelected && (
        <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full border-2 border-ink bg-board" aria-hidden="true">
          <Check size={18} strokeWidth={3} />
        </span>
      )}
    </div>
  )

  const details = (
    <div className="flex flex-1 flex-col p-4 text-left">
      <h3 className="text-lg font-bold">{template.name}</h3>
      <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{template.description}</p>
      {actionTo && (
        <div className="mt-auto pt-4">
          <Link to={actionTo} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-navy px-4 text-[15px] font-semibold text-white hover:bg-navy-soft">
            Use this template
          </Link>
        </div>
      )}
    </div>
  )

  // In the wizard the whole card is a button
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(template.id)}
        aria-pressed={isSelected}
        className={`flex flex-col overflow-hidden rounded-lg border-2 bg-paper text-left shadow-panel transition-shadow hover:shadow-pop ${borderClasses}`}
      >
        {preview}
        {details}
      </button>
    )
  }

  return (
    <article className={`flex flex-col overflow-hidden rounded-lg border bg-paper shadow-panel ${borderClasses}`}>
      {preview}
      {details}
    </article>
  )
}

export default TemplateCard
