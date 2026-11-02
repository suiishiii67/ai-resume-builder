// Small helpers used by the resume templates.
// Bullets are stored one per line
export function splitBullets(bulletText) {
  return (bulletText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

// "May 2026 – Jul 2026", "May 2026", or "" when both are empty
export function formatDateRange(start, end) {
  if (start && end) return `${start} – ${end}`
  return start || end || ''
}

export function getContactItems(personal) {
  return [personal.email, personal.phone, personal.location, personal.linkedin, personal.portfolio].filter(Boolean)
}

// Empty sections are left out of the resume
export function hasSectionContent(resume, sectionKey) {
  const value = resume[sectionKey]
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value && value.trim())
}

// "2 Oct 2026"
export function formatDate(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
