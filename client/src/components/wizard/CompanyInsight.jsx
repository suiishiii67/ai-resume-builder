// Wizard panel: what the chosen company looks for.
import { ArrowRight } from 'lucide-react'
import { SECTION_LABELS } from '../../data/sections'
import TagList from '../TagList'

function CompanyInsight({ company, role }) {
  return (
    <section aria-label="What this target looks for" className="rounded-lg border border-line bg-paper p-5">
      <h2 className="text-lg font-bold">What {company.name} looks for</h2>
      <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{company.focus}</p>

      <dl className="mt-4 grid gap-4 text-[15px] sm:grid-cols-2">
        <div>
          <dt className="board-text text-[13px] text-ink-faint">Company type</dt>
          <dd className="font-semibold">{company.type} · {company.industry}</dd>
        </div>
        <div>
          <dt className="board-text text-[13px] text-ink-faint">Emphasis</dt>
          <dd className="font-semibold">{company.emphasis === 'projects' ? 'Projects before experience' : 'Experience before projects'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="board-text text-[13px] text-ink-faint">Section order</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-1.5 font-semibold">
            {company.sectionOrder.map((sectionKey, index) => (
              <span key={sectionKey} className="inline-flex items-center gap-1.5">
                {SECTION_LABELS[sectionKey]}
                {index < company.sectionOrder.length - 1 && <ArrowRight size={14} className="text-ink-faint" aria-hidden="true" />}
              </span>
            ))}
          </dd>
        </div>
        {company.keywords.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="board-text mb-1.5 text-[13px] text-ink-faint">Company keywords</dt>
            <dd><TagList tags={company.keywords} label={`${company.name} keywords`} /></dd>
          </div>
        )}
        <div className="sm:col-span-2">
          <dt className="board-text mb-1.5 text-[13px] text-ink-faint">Skills a {role.title} needs</dt>
          <dd><TagList tags={role.requiredSkills} label={`${role.title} skills`} /></dd>
        </div>
      </dl>
    </section>
  )
}

export default CompanyInsight
