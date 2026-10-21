// Resume templates (site configuration) and which companies and roles they suit.
// Loaded into MongoDB by: npm run seed-catalog
const templates = [
  {
    id: 'classic',
    name: 'Classic',
    layout: 'classic',
    description: 'Serif type with ruled section headings. Conservative, formal and easy for any ATS to parse.',
    companyTypes: ['Service-based', 'Consulting', 'Finance'],
    industries: ['IT Services & Consulting', 'Management & Technology Consulting', 'Banking & Financial Services'],
    roles: ['software-engineer', 'backend-developer', 'data-analyst'],
  },
  {
    id: 'modern',
    name: 'Modern',
    layout: 'modern',
    description: 'Clean sans-serif with a navy name band and skill tags. Suits product companies and startups.',
    companyTypes: ['Product-based', 'Startup'],
    industries: ['Technology (SaaS)', 'Consumer Tech'],
    roles: ['frontend-developer', 'full-stack-developer', 'ui-ux-designer'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    layout: 'minimal',
    description: 'Compact, dense single column with small-caps headings. Fits more on one page without clutter.',
    companyTypes: ['Finance', 'Product-based'],
    industries: ['Banking & Financial Services', 'Technology (SaaS)'],
    roles: ['data-analyst', 'software-engineer', 'backend-developer'],
  },
]

module.exports = templates
