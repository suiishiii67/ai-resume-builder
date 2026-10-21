const express = require('express')
const { getStats, getUsers, toggleBlock, deleteUser, getAllResumes, getAtsChecks } = require('../controllers/adminController')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

// Every route here needs a logged-in admin
router.use(protect, adminOnly)

router.get('/stats', getStats)
router.get('/users', getUsers)
router.patch('/users/:id/block', toggleBlock)
router.delete('/users/:id', deleteUser)
router.get('/resumes', getAllResumes)
router.get('/ats-checks', getAtsChecks)

module.exports = router
