// Finds the company and role details for a resume's target.
import { DEFAULT_SECTION_ORDER } from '../data/sections'

// Used when the company isn't in our data
export function buildCustomCompany(name) {
  return {
    id: '',
    name,
    type: 'Custom company',
    industry: 'Not specified',
    emphasis: 'experience',
    sectionOrder: DEFAULT_SECTION_ORDER,
    keywords: [],
    focus: 'No saved profile for this company yet, so a balanced general format is used.',
    summaryLine: '',
    isCustom: true,
  }
}

// Used when the role isn't in our data
export function buildCustomRole(title) {
  return {
    id: '',
    title,
    category: 'Custom',
    requiredSkills: ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'MS Office'],
    keywords: ['team', 'results', 'learning'],
    sampleSummary: `Motivated graduate aiming for a ${title} position at {company}, bringing strong fundamentals, clear communication and a habit of learning quickly.`,
    experienceBullets: ['Completed assigned tasks on schedule while learning new tools', 'Worked with a team of 4 to deliver a semester-long project', 'Presented progress updates to mentors every week'],
    projects: [{ name: 'Final Year Project', techStack: '', bullets: ['Planned and delivered the project with a team of 4', 'Documented the design and presented the results'] }],
    certifications: [],
    isCustom: true,
  }
}

// Find by id, then by name, else make a custom one
export function resolveCompany(companies, companyId, companyName) {
  const byId = companies.find((company) => company.id && company.id === companyId)
  if (byId) return byId
  const byName = companies.find((company) => company.name.toLowerCase() === (companyName || '').trim().toLowerCase())
  return byName || buildCustomCompany(companyName || 'Any company')
}

export function resolveRole(roles, roleId, roleTitle) {
  const byId = roles.find((role) => role.id && role.id === roleId)
  if (byId) return byId
  const byTitle = roles.find((role) => role.title.toLowerCase() === (roleTitle || '').trim().toLowerCase())
  return byTitle || buildCustomRole(roleTitle || 'Any role')
}

// Role skills first, then role and company keywords (no duplicates)
export function getTargetKeywords(company, role) {
  const keywordList = []
  const seen = new Set()

  const addKeyword = (word, type, source) => {
    const key = word.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    keywordList.push({ word, type, source })
  }

  role.requiredSkills.forEach((skill) => addKeyword(skill, 'skill', role.title))
  role.keywords.forEach((word) => addKeyword(word, 'keyword', role.title))
  company.keywords.forEach((word) => addKeyword(word, 'keyword', company.name))
  return keywordList
}
