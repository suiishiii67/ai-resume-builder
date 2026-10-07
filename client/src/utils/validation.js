// Form checks (Indian formats). Each field check returns an error message or ''.
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_HINT = `At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Letters, spaces, dots, apostrophes and hyphens, e.g. "S. Patil", "D'Souza"
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/
// Indian mobile: optional +91, 91 or 0, then 10 digits starting with 6–9
const INDIAN_MOBILE_PATTERN = /^(?:\+91|91|0)?[6-9]\d{9}$/
const CITY_PATTERN = /^[A-Za-z][A-Za-z .,'()-]*$/
const URL_PATTERN = /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i
const LINKEDIN_PATTERN = /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_-]{3,100}\/?$/i
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

const currentYear = () => new Date().getFullYear()

export function validateEmail(email) {
  if (!email.trim()) return 'Enter your email address.'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address, like name@example.com.'
  return ''
}

export function validateName(name, label = 'your full name') {
  const value = name.trim()
  if (!value) return `Enter ${label}.`
  if (value.length < 2) return 'Name must be at least 2 characters.'
  if (value.length > 60) return 'Name must be 60 characters or fewer.'
  if (!NAME_PATTERN.test(value)) return 'Use letters only (spaces, dots and hyphens are fine).'
  return ''
}

export function validatePhone(phone, { required = false } = {}) {
  const digits = phone.replace(/[\s()-]/g, '')
  if (!digits) return required ? 'Enter your mobile number.' : ''
  if (!INDIAN_MOBILE_PATTERN.test(digits)) return 'Enter a 10-digit Indian mobile number starting with 6–9, like +91 98200 12345.'
  return ''
}

export function validateCity(city) {
  const value = city.trim()
  if (!value) return ''
  if (!CITY_PATTERN.test(value) || value.length > 60) return 'Enter a city name, like Pune, Maharashtra.'
  return ''
}

// Graduation and education years: 1980 to six years ahead (course still running)
export function validateYear(year, { required = false, label = 'year' } = {}) {
  const value = String(year).trim()
  if (!value) return required ? `Enter the ${label}.` : ''
  if (!/^\d{4}$/.test(value)) return 'Enter a 4-digit year, like 2027.'
  const number = Number(value)
  if (number < 1980 || number > currentYear() + 6) return `Enter a year between 1980 and ${currentYear() + 6}.`
  return ''
}

export function validatePastYear(year) {
  const error = validateYear(year)
  if (error) return error
  return Number(year) > currentYear() ? 'This year has not happened yet.' : ''
}

// CGPA out of 10 (or "/ 4") or percentage out of 100, e.g. "CGPA 8.4 / 10", "8.4", "78%"
export function validateScore(score) {
  const value = score.trim()
  if (!value) return ''
  const match = value.match(/(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?/)
  if (!match) return 'Enter a CGPA like 8.4 / 10 or a percentage like 78%.'
  const number = Number(match[1])
  const outOf = match[2] ? Number(match[2]) : null
  const isPercent = /%|percent/i.test(value) || (!outOf && !/cgpa|gpa|sgpa|cpi/i.test(value) && number > 10)
  if (outOf !== null) return number <= outOf ? '' : `Score cannot be more than ${outOf}.`
  if (isPercent) return number <= 100 ? '' : 'Percentage cannot be more than 100.'
  return number <= 10 ? '' : 'CGPA cannot be more than 10.'
}

export function validateLinkedIn(link) {
  const value = link.trim()
  if (!value) return ''
  return LINKEDIN_PATTERN.test(value) ? '' : 'Enter your LinkedIn profile link, like linkedin.com/in/your-name.'
}

export function validateUrl(link) {
  const value = link.trim()
  if (!value) return ''
  return URL_PATTERN.test(value) ? '' : 'Enter a valid link, like github.com/your-name.'
}

// "May 2026", "05/2026", "2026" or "Present". Returns a sortable number, or null if not valid.
function parseMonthYear(text) {
  const value = text.trim().toLowerCase()
  if (/^(present|current|now|ongoing)$/.test(value)) return Infinity
  let match = value.match(/^([a-z]+)\.?\s+(\d{4})$/)
  if (match) {
    // Full name ("July"), short form ("Jul") or "Sept"
    const month = MONTHS.findIndex((name) => name === match[1] || name.slice(0, 3) === match[1] || (match[1] === 'sept' && name === 'september'))
    return month === -1 ? null : Number(match[2]) * 12 + month
  }
  match = value.match(/^(\d{1,2})[/-](\d{4})$/)
  if (match) return Number(match[1]) >= 1 && Number(match[1]) <= 12 ? Number(match[2]) * 12 + Number(match[1]) - 1 : null
  match = value.match(/^(\d{4})$/)
  return match ? Number(match[1]) * 12 : null
}

export function validateMonthYear(text, { allowPresent = false } = {}) {
  const value = text.trim()
  if (!value) return ''
  const parsed = parseMonthYear(value)
  if (parsed === null || (parsed === Infinity && !allowPresent)) return allowPresent ? 'Use a month and year, like Jul 2026, or Present.' : 'Use a month and year, like May 2026.'
  if (parsed !== Infinity) {
    const year = Math.floor(parsed / 12)
    if (year < 1980 || year > currentYear() + 1) return `Enter a year between 1980 and ${currentYear() + 1}.`
  }
  return ''
}

export function validateDateOrder(start, end) {
  const startValue = parseMonthYear(String(start))
  const endValue = parseMonthYear(String(end))
  if (startValue === null || endValue === null) return ''
  return endValue < startValue ? 'End cannot be before the start.' : ''
}

export function validateNewPassword(password) {
  if (!password) return 'Enter a password.'
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Use at least one letter and one number.'
  return ''
}

export function validateLoginForm({ email, password }) {
  return {
    email: validateEmail(email),
    password: password ? '' : 'Enter your password.',
  }
}

export function validateSignupForm({ name, email, password, confirmPassword }) {
  return {
    name: validateName(name),
    email: validateEmail(email),
    password: validateNewPassword(password),
    confirmPassword: !confirmPassword
      ? 'Type your password again.'
      : confirmPassword !== password
        ? 'Passwords do not match.'
        : '',
  }
}

export function validateProfileForm({ name, email }) {
  return {
    name: validateName(name),
    email: validateEmail(email),
  }
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  return {
    currentPassword: currentPassword ? '' : 'Enter your current password.',
    newPassword: newPassword && newPassword === currentPassword ? 'Choose a password different from your current one.' : validateNewPassword(newPassword),
    confirmPassword: confirmPassword === newPassword ? '' : 'Passwords do not match.',
  }
}

// Create wizard, step 3
export function validateBasicsForm(basics) {
  return {
    ...validateRequiredFields(basics, { degree: 'your degree', institution: 'your college' }),
    fullName: validateName(basics.fullName),
    email: validateEmail(basics.email),
    phone: validatePhone(basics.phone, { required: true }),
    location: validateCity(basics.location),
    graduationYear: validateYear(basics.graduationYear, { required: true, label: 'graduation year' }),
    score: validateScore(basics.score),
  }
}

// Editor: personal info section
export function validatePersonalInfo(personal) {
  return {
    fullName: personal.fullName?.trim() ? validateName(personal.fullName) : '',
    email: personal.email?.trim() ? validateEmail(personal.email) : '',
    phone: validatePhone(personal.phone || ''),
    location: validateCity(personal.location || ''),
    linkedin: validateLinkedIn(personal.linkedin || ''),
    portfolio: validateUrl(personal.portfolio || ''),
  }
}

// Editor: one entry of a list section
const ENTRY_VALIDATORS = {
  education: (entry) => ({
    location: validateCity(entry.location || ''),
    startYear: validateYear(entry.startYear || ''),
    endYear: validateYear(entry.endYear || '') || validateDateOrder(entry.startYear || '', entry.endYear || ''),
    score: validateScore(entry.score || ''),
  }),
  experience: (entry) => ({
    startDate: validateMonthYear(entry.startDate || ''),
    endDate: validateMonthYear(entry.endDate || '', { allowPresent: true }) || validateDateOrder(entry.startDate || '', entry.endDate || ''),
  }),
  projects: (entry) => ({ link: validateUrl(entry.link || '') }),
  certifications: (entry) => ({ year: validatePastYear(entry.year || '') }),
}

export function validateEntry(sectionKey, entry) {
  return ENTRY_VALIDATORS[sectionKey]?.(entry) || {}
}

// Sections of a resume that have errors, for blocking Save
export function findResumeErrors(resume) {
  const sections = []
  if (hasErrors(validatePersonalInfo(resume.personal || {}))) sections.push('personal')
  Object.keys(ENTRY_VALIDATORS).forEach((sectionKey) => {
    if ((resume[sectionKey] || []).some((entry) => hasErrors(validateEntry(sectionKey, entry)))) sections.push(sectionKey)
  })
  return sections
}

export function validateRequiredFields(values, requiredFieldLabels) {
  const errors = {}
  Object.entries(requiredFieldLabels).forEach(([field, label]) => {
    errors[field] = String(values[field] || '').trim() ? '' : `Enter ${label}.`
  })
  return errors
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
