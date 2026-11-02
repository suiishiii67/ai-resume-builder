const mongoose = require('mongoose')
const toJSON = require('./toJSON')

// A company profile: the emphasis, section order and keywords the keyword panel and ATS check use.
// Added by the admin (there are no built-in companies).
const companySchema = new mongoose.Schema(
  {
    // Our own readable id (like "infosys"), used by resumes and the wizard
    id: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Enter the company name.'], trim: true },
    type: { type: String, default: 'Other' },
    industry: { type: String, default: '' },
    location: { type: String, default: '' },
    emphasis: { type: String, enum: ['projects', 'experience'], default: 'experience' },
    sectionOrder: { type: [String], default: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'] },
    keywords: { type: [String], default: [] },
    focus: { type: String, default: '' },
    summaryLine: { type: String, default: '' },
  },
  { timestamps: true, toJSON }
)

module.exports = mongoose.model('Company', companySchema)
