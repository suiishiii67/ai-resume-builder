// Server-side checks, the same rules as client/src/utils/validation.js.
// Each function returns an error message, or '' when the value is fine.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Letters, spaces, dots, apostrophes and hyphens, e.g. "S. Patil", "D'Souza"
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/
const PASSWORD_MIN_LENGTH = 8
// Indian mobile: optional +91, 91 or 0, then 10 digits starting with 6–9
const INDIAN_MOBILE_PATTERN = /^(?:\+91|91|0)?[6-9]\d{9}$/
// International: + and a country code, then 7 to 14 more digits, e.g. +1 415 555 0132, +44 20 7946 0958
const INTERNATIONAL_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/

// Size limits for one resume
const LIMITS = { title: 120, skills: 50, entries: 20, jobDescriptionText: 15000 }
const SECTIONS = ['experience', 'education', 'projects', 'certifications']

function validateName(name) {
  const value = typeof name === 'string' ? name.trim() : ''
  if (!value) return 'Enter your full name.'
  if (value.length < 2) return 'Name must be at least 2 characters.'
  if (value.length > 60) return 'Name must be 60 characters or fewer.'
  if (!NAME_PATTERN.test(value)) return 'Use letters only (spaces, dots and hyphens are fine).'
  return ''
}

function validateEmail(email) {
  const value = typeof email === 'string' ? email.trim() : ''
  if (!value) return 'Enter your email address.'
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address, like name@example.com.'
  return ''
}

function validatePassword(password) {
  if (typeof password !== 'string' || !password) return 'Enter a password.'
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Use at least one letter and one number.'
  return ''
}

function validatePhone(phone) {
  const digits = phone.replace(/[\s()-]/g, '')
  if (!INDIAN_MOBILE_PATTERN.test(digits) && !INTERNATIONAL_PHONE_PATTERN.test(digits)) {
    return 'Enter a 10-digit mobile number like +91 98200 12345, or an international number with its country code, like +44 20 7946 0958.'
  }
  return ''
}

// Checks the resume fields that were sent. isNew = creating (the title is then required).
function validateResume(fields, { isNew }) {
  if (isNew || fields.title !== undefined) {
    const title = typeof fields.title === 'string' ? fields.title.trim() : ''
    if (!title) return 'Enter a title for the resume.'
    if (title.length > LIMITS.title) return `The title must be ${LIMITS.title} characters or fewer.`
  }

  for (const objectField of ['personal', 'jobDescription']) {
    const value = fields[objectField]
    if (value !== undefined && (typeof value !== 'object' || value === null || Array.isArray(value))) {
      return `${objectField} must be an object.`
    }
  }

  const personal = fields.personal || {}
  if (personal.email && validateEmail(personal.email)) return validateEmail(personal.email)
  if (personal.phone && typeof personal.phone === 'string' && validatePhone(personal.phone)) return validatePhone(personal.phone)

  if (Array.isArray(fields.skills) && fields.skills.length > LIMITS.skills) {
    return `A resume can have up to ${LIMITS.skills} skills.`
  }
  for (const section of SECTIONS) {
    if (Array.isArray(fields[section]) && fields[section].length > LIMITS.entries) {
      return `The ${section} section can have up to ${LIMITS.entries} entries.`
    }
  }

  const jobText = fields.jobDescription && fields.jobDescription.text
  if (typeof jobText === 'string' && jobText.length > LIMITS.jobDescriptionText) {
    return `The job description must be ${LIMITS.jobDescriptionText} characters or fewer.`
  }
  return ''
}

module.exports = { validateName, validateEmail, validatePassword, validatePhone, validateResume }
