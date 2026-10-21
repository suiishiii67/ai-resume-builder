// Server-side checks, the same rules as client/src/utils/validation.js.
// Each function returns an error message, or '' when the value is fine.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Letters, spaces, dots, apostrophes and hyphens, e.g. "S. Patil", "D'Souza"
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/
const PASSWORD_MIN_LENGTH = 8

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

module.exports = { validateName, validateEmail, validatePassword }
