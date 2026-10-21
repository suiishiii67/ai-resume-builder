// A user's own resumes: list, read, create, update, delete, duplicate, save ATS score
const crypto = require('crypto')
const mongoose = require('mongoose')
const Resume = require('../models/Resume')
const { validateResume } = require('../utils/validators')

// The only fields a user may set through create/update.
// userId, atsScore and atsCheckedAt are left out on purpose.
const EDITABLE_FIELDS = [
  'title', 'companyId', 'companyName', 'roleId', 'roleTitle', 'templateId', 'sectionOrder',
  'personal', 'summary', 'skills', 'experience', 'education', 'projects', 'certifications',
  'jobDescription', 'createdVia', 'tailoredFrom', 'region',
]

function pickEditableFields(body) {
  const fields = {}
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) fields[field] = body[field]
  }
  return fields
}

// Finds a resume only if it belongs to this user. Someone else's resume (or a bad id) gives null,
// so the user gets the same 404 and can't tell whether that resume exists.
async function findOwnResume(resumeId, userId) {
  if (!mongoose.isValidObjectId(resumeId)) return null
  return Resume.findOne({ _id: resumeId, userId })
}

function notFound(res) {
  return res.status(404).json({ message: 'Resume not found' })
}

// Checks the fields and that tailoredFrom (if given) is one of the user's own resumes.
// Returns an error message or ''.
async function checkFields(fields, userId, isNew) {
  const error = validateResume(fields, { isNew })
  if (error) return error
  if (fields.tailoredFrom) {
    const original = await findOwnResume(fields.tailoredFrom, userId)
    if (!original) return 'tailoredFrom must be one of your own resumes.'
  }
  return ''
}

// GET /api/resumes  →  { resumes }  (newest edited first)
async function getResumes(req, res) {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1 })
  res.json({ resumes })
}

// GET /api/resumes/:id  →  { resume }
async function getResume(req, res) {
  const resume = await findOwnResume(req.params.id, req.user._id)
  if (!resume) return notFound(res)
  res.json({ resume })
}

// POST /api/resumes  →  { resume }
async function createResume(req, res) {
  const fields = pickEditableFields(req.body || {})
  const error = await checkFields(fields, req.user._id, true)
  if (error) return res.status(400).json({ message: error })

  // userId always comes from the token, never from the body
  const resume = await Resume.create({ ...fields, userId: req.user._id })
  res.status(201).json({ resume })
}

// PUT /api/resumes/:id  →  { resume }
async function updateResume(req, res) {
  const resume = await findOwnResume(req.params.id, req.user._id)
  if (!resume) return notFound(res)

  const fields = pickEditableFields(req.body || {})
  const error = await checkFields(fields, req.user._id, false)
  if (error) return res.status(400).json({ message: error })

  resume.set(fields)
  await resume.save()
  res.json({ resume })
}

// DELETE /api/resumes/:id  →  { message }
async function deleteResume(req, res) {
  const resume = await findOwnResume(req.params.id, req.user._id)
  if (!resume) return notFound(res)

  await resume.deleteOne()
  res.json({ message: 'Resume deleted.' })
}

// A new id for a copied entry, in the same style as the editor's ids (e.g. "exp-m1x2k3-ab12")
function newEntryId(oldId) {
  const prefix = String(oldId).split('-')[0] || 'item'
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`
}

// POST /api/resumes/:id/duplicate  →  { resume }
async function duplicateResume(req, res) {
  const original = await findOwnResume(req.params.id, req.user._id)
  if (!original) return notFound(res)

  // toObject() gives a plain copy; remove what the copy must not keep
  const copy = original.toObject()
  delete copy._id
  delete copy.__v
  delete copy.createdAt
  delete copy.updatedAt
  copy.title = `${original.title} (copy)`.slice(0, 120)
  copy.atsScore = null
  copy.atsCheckedAt = null
  for (const section of ['experience', 'education', 'projects', 'certifications']) {
    copy[section] = copy[section].map((entry) => ({ ...entry, id: newEntryId(entry.id) }))
  }

  const resume = await Resume.create(copy)
  res.status(201).json({ resume })
}

// PATCH /api/resumes/:id/ats-score  { score }  →  { resume }
async function saveAtsScore(req, res) {
  const { score } = req.body || {}
  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ message: 'The score must be a number from 0 to 100.' })
  }

  const resume = await findOwnResume(req.params.id, req.user._id)
  if (!resume) return notFound(res)

  // Saving a score should not change "last edited", so updatedAt is left alone
  resume.atsScore = Math.round(score)
  resume.atsCheckedAt = new Date()
  await resume.save({ timestamps: false })
  res.json({ resume })
}

module.exports = { getResumes, getResume, createResume, updateResume, deleteResume, duplicateResume, saveAtsScore, findOwnResume }
