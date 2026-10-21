const express = require('express')
const {
  getResumes, getResume, createResume, updateResume, deleteResume, duplicateResume, saveAtsScore,
} = require('../controllers/resumeController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Every route here needs a logged-in user
router.use(protect)

router.get('/', getResumes)
router.post('/', createResume)
router.get('/:id', getResume)
router.put('/:id', updateResume)
router.delete('/:id', deleteResume)
router.post('/:id/duplicate', duplicateResume)
router.patch('/:id/ats-score', saveAtsScore)

module.exports = router
