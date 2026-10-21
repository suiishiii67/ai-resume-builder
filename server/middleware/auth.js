// Login checks for routes.
// The frontend sends the token from login/signup in a header: "Authorization: Bearer <token>"
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const BLOCKED_MESSAGE = 'Your account has been blocked. Contact the admin.'

// Returns the token from the Authorization header, or null if there is none
function getToken(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

// Checks the token and finds its user. Sends 401/403 and returns null if something is wrong.
async function findUserFromToken(token, res) {
  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    res.status(401).json({ message: 'Your session has expired or is invalid. Please log in again.' })
    return null
  }

  const user = await User.findById(payload.id)
  if (!user) {
    res.status(401).json({ message: 'This account no longer exists. Please log in again.' })
    return null
  }
  if (user.blocked) {
    res.status(403).json({ message: BLOCKED_MESSAGE })
    return null
  }
  return user
}

// Route needs a logged-in user. Puts the user on req.user.
async function protect(req, res, next) {
  const token = getToken(req)
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' })

  const user = await findUserFromToken(token, res)
  if (!user) return
  req.user = user
  next()
}

// Route works with or without login (like the quick ATS check). req.user is null for guests.
async function optionalAuth(req, res, next) {
  const token = getToken(req)
  if (!token) {
    req.user = null
    return next()
  }

  const user = await findUserFromToken(token, res)
  if (!user) return
  req.user = user
  next()
}

// Use after protect: only admins may continue
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only the admin can do this.' })
  next()
}

module.exports = { protect, optionalAuth, adminOnly, BLOCKED_MESSAGE }
