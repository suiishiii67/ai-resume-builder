const express = require('express')
const { updateProfile, changePassword } = require('../controllers/userController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Every route here needs a logged-in user
router.use(protect)

router.patch('/me', updateProfile)
router.patch('/me/password', changePassword)

module.exports = router
