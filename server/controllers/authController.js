// Signup, login and "who am I"
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { BLOCKED_MESSAGE } = require('../middleware/auth')
const { validateName, validateEmail, validatePassword } = require('../utils/validators')

// The token only holds the user's id. It is signed with JWT_SECRET, so it can't be faked.
function createToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/signup  { name, email, password }  →  { token, user }
async function signup(req, res) {
  const { name, email, password } = req.body || {}

  const error = validateName(name) || validateEmail(email) || validatePassword(password)
  if (error) return res.status(400).json({ message: error })

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() })
  if (existingUser) return res.status(400).json({ message: 'An account with this email already exists.' })

  // role is never taken from the request: everyone who signs up is a normal user
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ name: name.trim(), email, password: hashedPassword, role: 'user' })

  res.status(201).json({ token: createToken(user), user })
}

// POST /api/auth/login  { email, password }  →  { token, user }
async function login(req, res) {
  const { email, password } = req.body || {}
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Enter your email and password.' })
  }

  // The password is hidden by default (select: false), so ask for it here
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
  const isCorrect = user && (await bcrypt.compare(password, user.password))

  // Same message for a wrong email and a wrong password, so nobody can guess which emails exist
  if (!isCorrect) return res.status(401).json({ message: 'Incorrect email or password.' })
  if (user.blocked) return res.status(403).json({ message: BLOCKED_MESSAGE })

  res.json({ token: createToken(user), user })
}

// GET /api/auth/me  →  { user }   (protect has already loaded req.user)
function getMe(req, res) {
  res.json({ user: req.user })
}

module.exports = { signup, login, getMe }
