const mongoose = require('mongoose')
const toJSON = require('./toJSON')

// The only design choices an admin can make. All of them are ATS-safe: every template is a single
// column of real text, with no tables, images or columns.
const FONTS = ['serif', 'sans', 'calibri']
const HEADING_STYLES = ['caps-line', 'bold']
const SPACINGS = ['compact', 'roomy']
const SECTIONS = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications']
const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/

// A resume template: a name and its design settings.
// Old templates saved before "design" existed get these defaults when they are read.
const templateSchema = new mongoose.Schema(
  {
    // Our own readable id (like "classic"), saved on each resume as templateId
    id: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Enter the template name.'], trim: true },
    description: { type: String, default: '' },
    design: {
      font: { type: String, enum: FONTS, default: 'serif' },
      accentColor: { type: String, match: HEX_COLOUR, default: '#000000' }, // headings and lines only
      headingStyle: { type: String, enum: HEADING_STYLES, default: 'caps-line' },
      spacing: { type: String, enum: SPACINGS, default: 'compact' },
      sectionOrder: { type: [String], default: () => [...SECTIONS] }, // the order a new resume starts with
    },
  },
  { timestamps: true, toJSON }
)

module.exports = mongoose.model('Template', templateSchema)
module.exports.DESIGN_OPTIONS = { FONTS, HEADING_STYLES, SPACINGS, SECTIONS, HEX_COLOUR }
