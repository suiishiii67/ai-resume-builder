// Companies, roles and templates: everyone can read them, only the admin can change them.
// The same three handlers (create, update, delete) work for all three kinds, set up by KINDS below.
const Company = require('../models/Company')
const Role = require('../models/Role')
const Template = require('../models/Template')

const { FONTS, HEADING_STYLES, SPACINGS, SECTIONS, HEX_COLOUR } = Template.DESIGN_OPTIONS

const KINDS = {
  companies: {
    Model: Company,
    nameField: 'name',
    label: 'Company',
    fields: ['name', 'type', 'industry', 'location', 'emphasis', 'sectionOrder', 'keywords', 'focus', 'summaryLine'],
  },
  roles: {
    Model: Role,
    nameField: 'title',
    label: 'Role',
    fields: ['title', 'category', 'requiredSkills', 'keywords', 'sampleSummary', 'experienceBullets', 'projects', 'certifications'],
  },
  templates: {
    Model: Template,
    nameField: 'name',
    label: 'Template',
    fields: ['name', 'description', 'design'],
    checkExtra: checkDesign,
  },
}

const MAX_NAME = 80
const MAX_TEXT = 2000
const MAX_LIST = 50

// Copies only the allowed fields from the request body
function pickFields(body, fields) {
  const picked = {}
  for (const field of fields) {
    if (body[field] !== undefined) picked[field] = body[field]
  }
  return picked
}

// True if any text (also inside lists and objects) is too long, or any list too big
function isTooBig(value) {
  if (typeof value === 'string') return value.length > MAX_TEXT
  if (Array.isArray(value)) return value.length > MAX_LIST || value.some(isTooBig)
  if (value && typeof value === 'object') return Object.values(value).some(isTooBig)
  return false
}

// A template's design settings: only the ATS-safe choices in models/Template.js are allowed
function checkDesign({ design }) {
  if (design === undefined) return ''
  if (!design || typeof design !== 'object' || Array.isArray(design)) return 'Send the design settings as an object.'
  if (!FONTS.includes(design.font)) return `Font must be one of: ${FONTS.join(', ')}.`
  if (typeof design.accentColor !== 'string' || !HEX_COLOUR.test(design.accentColor)) return 'Accent colour must be a hex colour like #1e3a8a.'
  if (!HEADING_STYLES.includes(design.headingStyle)) return `Heading style must be one of: ${HEADING_STYLES.join(', ')}.`
  if (!SPACINGS.includes(design.spacing)) return `Spacing must be one of: ${SPACINGS.join(', ')}.`
  // Every section exactly once, so no content is ever hidden
  const order = design.sectionOrder
  if (!Array.isArray(order) || order.length !== SECTIONS.length || !SECTIONS.every((section) => order.includes(section))) {
    return `Section order must list each section once: ${SECTIONS.join(', ')}.`
  }
  return ''
}

// Returns an error message, or '' when the fields are fine
function checkFields(fields, nameField, isNew) {
  if (isNew || fields[nameField] !== undefined) {
    const name = typeof fields[nameField] === 'string' ? fields[nameField].trim() : ''
    if (!name) return `Enter the ${nameField}.`
    if (name.length > MAX_NAME) return `The ${nameField} must be ${MAX_NAME} characters or fewer.`
  }
  if (isTooBig(fields)) return `Text must be ${MAX_TEXT} characters or fewer, and lists up to ${MAX_LIST} items.`
  return ''
}

// "Tata Consultancy Services" → "tata-consultancy-services" (adds -2, -3 … if that id is taken)
async function createReadableId(Model, name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'item'
  let id = base
  for (let number = 2; await Model.exists({ id }); number++) id = `${base}-${number}`
  return id
}

// GET /api/catalog  →  { companies, roles, templates }  (public)
async function getCatalog(req, res) {
  const [companies, roles, templates] = await Promise.all([
    Company.find().sort({ name: 1 }),
    Role.find().sort({ createdAt: 1 }),
    Template.find().sort({ createdAt: 1 }),
  ])
  res.json({ companies, roles, templates })
}

// POST /api/admin/<kind>  →  { item }
function createItem(kind) {
  const { Model, nameField, fields, checkExtra } = KINDS[kind]
  return async (req, res) => {
    const values = pickFields(req.body || {}, fields)
    const error = checkFields(values, nameField, true) || (checkExtra ? checkExtra(values) : '')
    if (error) return res.status(400).json({ message: error })

    const id = await createReadableId(Model, values[nameField])
    const item = await Model.create({ ...values, id })
    res.status(201).json({ item })
  }
}

// PUT /api/admin/<kind>/:id  →  { item }
function updateItem(kind) {
  const { Model, nameField, fields, label, checkExtra } = KINDS[kind]
  return async (req, res) => {
    const item = await Model.findOne({ id: String(req.params.id) })
    if (!item) return res.status(404).json({ message: `${label} not found` })

    const values = pickFields(req.body || {}, fields)
    const error = checkFields(values, nameField, false) || (checkExtra ? checkExtra(values) : '')
    if (error) return res.status(400).json({ message: error })

    item.set(values)
    await item.save()
    res.json({ item })
  }
}

// DELETE /api/admin/<kind>/:id  →  { message }
function deleteItem(kind) {
  const { Model, label } = KINDS[kind]
  return async (req, res) => {
    const item = await Model.findOne({ id: String(req.params.id) })
    if (!item) return res.status(404).json({ message: `${label} not found` })

    // The wizard and editor always need at least one template to draw a resume with
    if (kind === 'templates' && (await Template.countDocuments()) <= 1) {
      return res.status(400).json({ message: 'Keep at least one template.' })
    }

    await item.deleteOne()
    res.json({ message: `${label} deleted.` })
  }
}

module.exports = { getCatalog, createItem, updateItem, deleteItem }
