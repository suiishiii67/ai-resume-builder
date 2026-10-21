const express = require('express')
const { createCheck } = require('../controllers/atsController')
const { optionalAuth } = require('../middleware/auth')

const router = express.Router()

// Works with or without login (the quick check on the public page)
router.post('/checks', optionalAuth, createCheck)

module.exports = router
