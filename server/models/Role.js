const mongoose = require('mongoose')
const toJSON = require('./toJSON')

// A job role: required skills, keywords and example text shown as grey hints in the wizard
const roleSchema = new mongoose.Schema(
  {
    // Our own readable id (like "frontend-developer"), used by templates and resumes
    id: { type: String, required: true, unique: true },
    title: { type: String, required: [true, 'Enter the role title.'], trim: true },
    category: { type: String, default: '' },
    requiredSkills: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    sampleSummary: { type: String, default: '' },
    experienceBullets: { type: [String], default: [] },
    projects: {
      type: [new mongoose.Schema({ name: String, techStack: String, bullets: [String] }, { _id: false })],
      default: [],
    },
    certifications: {
      type: [new mongoose.Schema({ name: String, issuer: String }, { _id: false })],
      default: [],
    },
  },
  { timestamps: true, toJSON }
)

module.exports = mongoose.model('Role', roleSchema)
