const mongoose = require('mongoose')
const toJSON = require('./toJSON')

// A record of one ATS check, used for admin statistics.
// Only the result is saved here, never the resume text itself.
const atsCheckSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['saved', 'quick'], required: true }, // saved resume or uploaded file
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = not logged in
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    score: { type: Number, min: 0, max: 100, required: true },
    jobTitle: { type: String, default: '' },
    hasJobDescription: { type: Boolean, default: false },
    missingSkills: { type: [String], default: [] },
    checkedAt: { type: Date, default: Date.now },
  },
  { toJSON }
)

module.exports = mongoose.model('AtsCheck', atsCheckSchema)
