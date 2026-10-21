// The logged-in user's own profile and password
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { validateName, validateEmail, validatePassword } = require('../utils/validators')

// PATCH /api/users/me  { name, email }  →  { user }
async function updateProfile(req, res) {
  const { name, email } = req.body || {}

  const error = validateName(name) || validateEmail(email)
  if (error) return res.status(400).json({ message: error })

  const newEmail = email.trim().toLowerCase()
  const emailOwner = await User.findOne({ email: newEmail })
  if (emailOwner && !emailOwner._id.equals(req.user._id)) {
    return res.status(400).json({ message: 'Another account already uses this email.' })
  }

  req.user.name = name.trim()
  req.user.email = newEmail
  await req.user.save()

  res.json({ user: req.user })
}

// PATCH /api/users/me/password  { currentPassword, newPassword }  →  { message }
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {}
  if (typeof currentPassword !== 'string' || !currentPassword) {
    return res.status(400).json({ message: 'Enter your current password.' })
  }

  const error = validatePassword(newPassword)
  if (error) return res.status(400).json({ message: error })
  if (newPassword === currentPassword) {
    return res.status(400).json({ message: 'Choose a password different from your current one.' })
  }

  // Check the current password first
  const user = await User.findById(req.user._id).select('+password')
  const isCorrect = await bcrypt.compare(currentPassword, user.password)
  if (!isCorrect) return res.status(400).json({ message: 'Your current password is incorrect.' })

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  res.json({ message: 'Password changed.' })
}

module.exports = { updateProfile, changePassword }
