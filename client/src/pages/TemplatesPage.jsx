// Templates gallery (/templates).
import { useCatalog } from '../context/CatalogContext'
import exampleResume from '../data/exampleResume'
import TemplateCard from '../components/TemplateCard'
import PageLoader from '../components/PageLoader'

function TemplatesPage() {
  const { templates, isCatalogLoading } = useCatalog()

  if (isCatalogLoading) return <PageLoader message="Loading templates…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-board text-[44px] leading-tight font-bold">Resume templates</h1>
      <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Every template is single-column with standard headings and real text, so applicant tracking systems can read it.
        In the create wizard, we suggest one from your job title and experience. You can always pick another.
      </p>

      <p className="tabular mt-8 mb-3 text-sm text-ink-faint">{templates.length} templates</p>

      {/* Same example resume in every template, so only the design changes */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} sampleResume={exampleResume} actionTo={`/create?template=${template.id}`} />
        ))}
      </div>
    </div>
  )
}

export default TemplatesPage
