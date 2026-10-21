// Templates gallery (/templates) with filters.
import { useState } from 'react'
import { SearchX } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext'
import exampleResume from '../data/exampleResume'
import Select from '../components/Select'
import Button from '../components/Button'
import TemplateCard from '../components/TemplateCard'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/PageLoader'

// Same example resume in every template, so only the design changes
const PREVIEW_RESUME = exampleResume
const EMPTY_FILTERS = { industry: '', companyType: '', roleId: '' }

function TemplatesPage() {
  const { templates, roles, isCatalogLoading } = useCatalog()
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const industries = [...new Set(templates.flatMap((template) => template.industries))].sort()
  const companyTypes = [...new Set(templates.flatMap((template) => template.companyTypes))].sort()
  const toOptions = (values, allLabel) => [{ value: '', label: allLabel }, ...values.map((value) => ({ value, label: value }))]

  const visibleTemplates = templates.filter(
    (template) =>
      (!filters.industry || template.industries.includes(filters.industry)) &&
      (!filters.companyType || template.companyTypes.includes(filters.companyType)) &&
      (!filters.roleId || template.roles.includes(filters.roleId))
  )

  const getRoleTitles = (template) => template.roles.map((roleId) => roles.find((role) => role.id === roleId)?.title).filter(Boolean)
  const updateFilter = (field) => (event) => setFilters({ ...filters, [field]: event.target.value })

  if (isCatalogLoading) return <PageLoader message="Loading templates…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-board text-[44px] leading-tight font-bold">Resume templates</h1>
      <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Every template is single-column with standard headings and real text, so applicant tracking systems can read it.
        In the create wizard, the ones that suit your target company come first.
      </p>

      <div className="mt-8 grid gap-3 rounded-lg border border-line bg-paper p-4 sm:grid-cols-3">
        <Select id="filter-industry" label="Industry" value={filters.industry} onChange={updateFilter('industry')} options={toOptions(industries, 'All industries')} />
        <Select id="filter-company-type" label="Company type" value={filters.companyType} onChange={updateFilter('companyType')} options={toOptions(companyTypes, 'All company types')} />
        <Select
          id="filter-role"
          label="Job role"
          value={filters.roleId}
          onChange={updateFilter('roleId')}
          options={[{ value: '', label: 'All roles' }, ...roles.map((role) => ({ value: role.id, label: role.title }))]}
        />
      </div>

      <p className="tabular mt-5 mb-3 text-sm text-ink-faint" aria-live="polite">
        {visibleTemplates.length} of {templates.length} templates
      </p>

      {visibleTemplates.length === 0 ? (
        <EmptyState
          icon={<SearchX size={24} aria-hidden="true" />}
          title="No template matches all three filters"
          description="Clear a filter to see more. Any template can still be used for any company."
          action={<Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-5">
          {visibleTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              sampleResume={PREVIEW_RESUME}
              roleTitles={getRoleTitles(template)}
              actionTo={`/create?template=${template.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TemplatesPage
