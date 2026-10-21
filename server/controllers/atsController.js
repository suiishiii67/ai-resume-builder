// Saves a record of each ATS check (only the result, never the resume or job description text)
const AtsCheck = require('../models/AtsCheck')
const { findOwnResume } = require('./resumeController')

// ---- Simple limit for logged-out users: 30 saved checks per hour per IP address ----
// Kept in memory, so it resets when the server restarts. Fine for a laptop-only project.
const GUEST_LIMIT = 30
const ONE_HOUR = 60 * 60 * 1000
const guestChecks = new Map() // ip → list of times (ms) of their recent checks

function recentGuestChecks(ip) {
  const oneHourAgo = Date.now() - ONE_HOUR
  const recent = (guestChecks.get(ip) || []).filter((time) => time > oneHourAgo)
  guestChecks.set(ip, recent)
  return recent
}

// POST /api/ats/checks  { source, resumeId, score, jobTitle, hasJobDescription, missingSkills }  →  { check }
async function createCheck(req, res) {
  const { source, resumeId, score, jobTitle = '', hasJobDescription = false, missingSkills = [] } = req.body || {}
  const isGuest = !req.user

  if (isGuest && recentGuestChecks(req.ip).length >= GUEST_LIMIT) {
    return res.status(429).json({ message: 'Too many checks, try again later' })
  }

  // ---- Check what was sent ----
  if (source !== 'saved' && source !== 'quick') {
    return res.status(400).json({ message: "source must be 'saved' or 'quick'." })
  }
  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ message: 'The score must be a number from 0 to 100.' })
  }
  if (typeof jobTitle !== 'string' || jobTitle.length > 120) {
    return res.status(400).json({ message: 'The job title must be text of 120 characters or fewer.' })
  }
  if (typeof hasJobDescription !== 'boolean') {
    return res.status(400).json({ message: 'hasJobDescription must be true or false.' })
  }
  const skillsAreValid = Array.isArray(missingSkills) && missingSkills.length <= 50 &&
    missingSkills.every((skill) => typeof skill === 'string' && skill.length <= 60)
  if (!skillsAreValid) {
    return res.status(400).json({ message: 'missingSkills must be a list of up to 50 short skill names.' })
  }

  // ---- Who the check belongs to ----
  if (isGuest) {
    // Quick check without an account: nothing links it to a person or a resume
    if (source !== 'quick') return res.status(400).json({ message: "Without logging in, source must be 'quick'." })
    if (resumeId) return res.status(400).json({ message: 'Log in to check a saved resume.' })
  } else if (source === 'saved' || resumeId) {
    // A saved-resume check must point to one of the user's own resumes
    const resume = await findOwnResume(resumeId, req.user._id)
    if (!resume) return res.status(400).json({ message: 'resumeId must be one of your own resumes.' })
  }

  // Only these fields are saved. Anything else in the body (like resume text) is ignored.
  const check = await AtsCheck.create({
    source,
    userId: isGuest ? null : req.user._id,
    resumeId: resumeId || null,
    score: Math.round(score),
    jobTitle: jobTitle.trim(),
    hasJobDescription,
    missingSkills: missingSkills.map((skill) => skill.trim()).filter(Boolean),
  })

  if (isGuest) recentGuestChecks(req.ip).push(Date.now())
  res.status(201).json({ check })
}

module.exports = { createCheck }
