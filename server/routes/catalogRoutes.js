const express = require('express')
const { getCatalog } = require('../controllers/catalogController')

const router = express.Router()

// Public: the wizard, templates page and landing page need companies, roles and templates
router.get('/', getCatalog)

module.exports = router
