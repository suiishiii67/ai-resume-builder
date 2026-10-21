const express = require('express')
const { getStats, getUsers, toggleBlock, deleteUser, getAllResumes, getAtsChecks } = require('../controllers/adminController')
const { createItem, updateItem, deleteItem } = require('../controllers/catalogController')
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

// Catalog: companies, roles and templates
for (const kind of ['companies', 'roles', 'templates']) {
  router.post(`/${kind}`, createItem(kind))
  router.put(`/${kind}/:id`, updateItem(kind))
  router.delete(`/${kind}/:id`, deleteItem(kind))
}

module.exports = router
