// Suggests a built-in template from the user's own details (not the company). The user can always pick another.
//   a tech job title             -> Tech ("modern")
//   full-time work experience    -> Professional ("minimal")
//   otherwise (a fresher)        -> Campus Placement ("classic")
const TECH_CATEGORIES = ['Engineering', 'Data']
const TECH_TITLE = /developer|engineer|programmer|software|devops|data|sde|tester|\bqa\b/i
const INTERNSHIP_TITLE = /intern|trainee|apprentice/i

export function recommendTemplateId({ role, experience = [] }) {
  if (TECH_CATEGORIES.includes(role?.category) || TECH_TITLE.test(role?.title || '')) return 'modern'
  const hasFullTimeJob = experience.some((entry) => entry.jobTitle?.trim() && !INTERNSHIP_TITLE.test(entry.jobTitle))
  return hasFullTimeJob ? 'minimal' : 'classic'
}

// The recommended template, or the first one if an admin deleted it
export function findRecommendedTemplate(templates, details) {
  const recommendedId = recommendTemplateId(details)
  return templates.find((template) => template.id === recommendedId) || templates[0]
}
