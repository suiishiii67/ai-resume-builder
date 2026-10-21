const express = require('express')
const { bullets, summary, improve, tailorSummary, generate, jobInsights } = require('../controllers/aiController')
const { protect } = require('../middleware/auth')
const aiLimit = require('../middleware/aiLimit')

const router = express.Router()

// Every AI route needs a logged-in user, and each user has an hourly AI limit
router.use(protect, aiLimit)

router.post('/bullets', bullets)
router.post('/summary', summary)
router.post('/improve', improve)
router.post('/tailor-summary', tailorSummary)
router.post('/generate', generate)
router.post('/job-insights', jobInsights)

module.exports = router
