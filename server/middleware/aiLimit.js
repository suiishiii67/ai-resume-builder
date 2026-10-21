// Each user may make up to 30 AI requests per hour (keeps us inside Gemini's free limits).
// Kept in memory, so it resets when the server restarts. Use after protect.
const AI_LIMIT = 30
const ONE_HOUR = 60 * 60 * 1000
const requestTimes = new Map() // user id → times (ms) of their recent AI requests

function aiLimit(req, res, next) {
  const userId = req.user._id.toString()
  const oneHourAgo = Date.now() - ONE_HOUR
  const recent = (requestTimes.get(userId) || []).filter((time) => time > oneHourAgo)

  if (recent.length >= AI_LIMIT) {
    requestTimes.set(userId, recent)
    return res.status(429).json({ message: 'You have used the AI 30 times this hour. Try again later.' })
  }

  recent.push(Date.now())
  requestTimes.set(userId, recent)
  next()
}

module.exports = aiLimit
