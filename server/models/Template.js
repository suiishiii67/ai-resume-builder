const mongoose = require('mongoose')
const toJSON = require('./toJSON')

// A resume template. "layout" is which of the 3 designs the frontend draws it with.
const templateSchema = new mongoose.Schema(
  {
    // Our own readable id (like "classic"), saved on each resume as templateId
    id: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Enter the template name.'], trim: true },
    layout: { type: String, enum: ['classic', 'modern', 'minimal'], default: 'classic' },
    description: { type: String, default: '' },
    companyTypes: { type: [String], default: [] },
    industries: { type: [String], default: [] },
    roles: { type: [String], default: [] }, // role ids this template suits
  },
  { timestamps: true, toJSON }
)

module.exports = mongoose.model('Template', templateSchema)
