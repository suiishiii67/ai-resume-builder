const mongoose = require('mongoose')
const toJSON = require('./toJSON')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required.'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false = the password is not loaded unless we ask for it with .select('+password')
    password: { type: String, required: [true, 'Password is required.'], select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON }
)

module.exports = mongoose.model('User', userSchema)
