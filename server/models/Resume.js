const mongoose = require('mongoose')
const toJSON = require('./toJSON')

// Nested items keep their own "id" (made by the editor), so Mongo's _id is turned off for them.
// "bullets" is plain text with one bullet per line, the same as in the editor.
const experienceSchema = new mongoose.Schema(
  {
    id: { type: String, required: [true, 'Each entry needs an id.'] },
    jobTitle: { type: String, default: '' },
    company: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    bullets: { type: String, default: '' },
  },
  { _id: false }
)

const educationSchema = new mongoose.Schema(
  {
    id: { type: String, required: [true, 'Each entry needs an id.'] },
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    location: { type: String, default: '' },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    score: { type: String, default: '' },
  },
  { _id: false }
)

const projectSchema = new mongoose.Schema(
  {
    id: { type: String, required: [true, 'Each entry needs an id.'] },
    name: { type: String, default: '' },
    techStack: { type: String, default: '' },
    link: { type: String, default: '' },
    bullets: { type: String, default: '' },
  },
  { _id: false }
)

const certificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: [true, 'Each entry needs an id.'] },
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    year: { type: String, default: '' },
  },
  { _id: false }
)

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Resume title is required.'], trim: true },

    // The job this resume targets
    companyId: { type: String, default: '' },
    companyName: { type: String, default: '' },
    roleId: { type: String, default: '' },
    roleTitle: { type: String, default: '' },

    templateId: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'classic' },
    sectionOrder: {
      type: [String],
      default: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
    },

    personal: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    summary: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },

    // The job description the resume is matched against
    jobDescription: {
      text: { type: String, default: '' },
      title: { type: String, default: '' },
      company: { type: String, default: '' },
      skills: { type: [String], default: [] },
    },

    // Latest ATS score (null = never checked)
    atsScore: { type: Number, min: 0, max: 100, default: null },
    atsCheckedAt: { type: Date, default: null },

    createdVia: { type: String, enum: ['import', 'form', 'blank'], default: 'form' },
    tailoredFrom: { type: String, default: '' }, // id of the resume this was copied from
    region: { type: String, enum: ['india', 'international'], default: 'india' },
  },
  { timestamps: true, toJSON }
)

module.exports = mongoose.model('Resume', resumeSchema)
