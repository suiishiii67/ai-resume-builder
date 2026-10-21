// Creates the one admin account from ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env.
// If that email already has an account, it is made an admin instead (no duplicate).
// Run with: npm run create-admin
require('dotenv').config({ quiet: true })
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const User = require('../models/User')

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.')
  }

  await connectDB()

  const existingUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })
  if (existingUser) {
    existingUser.role = 'admin'
    await existingUser.save()
    console.log(`${existingUser.email} already exists. It is now an admin (password not changed).`)
    return
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const admin = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashedPassword, role: 'admin' })
  console.log(`Admin account created: ${admin.email}`)
}

createAdmin()
  .catch((error) => {
    console.error('Could not create the admin:', error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
