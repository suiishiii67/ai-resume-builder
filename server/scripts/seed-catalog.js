// Adds the built-in roles and templates (site configuration) to MongoDB: npm run seed-catalog
// Roles: only adds the missing ones. Templates: adds the missing ones and resets the three built-in
// presets (name, description, design settings) to seed/templates.js. Safe to run again; never deletes anything.
// Companies are not seeded: the admin adds real companies on the admin page.
require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Role = require('../models/Role')
const Template = require('../models/Template')
const roles = require('../seed/roles')
const templates = require('../seed/templates')

// Inserts each item whose id isn't in the database yet. Returns how many were added.
async function addMissing(Model, items) {
  let added = 0
  for (const item of items) {
    if (!(await Model.exists({ id: item.id }))) {
      await Model.create(item)
      added++
    }
  }
  return added
}

// Saves each built-in template's preset settings, and drops the old fields from before design settings.
// Returns how many were added (the rest were updated).
async function savePresets(items) {
  let added = 0
  for (const item of items) {
    if (!(await Template.exists({ id: item.id }))) added++
    await Template.updateOne(
      { id: item.id },
      { $set: item, $unset: { layout: '', companyTypes: '', industries: '', roles: '' } },
      { upsert: true, strict: false }
    )
  }
  return added
}

async function seedCatalog() {
  await connectDB()
  const addedRoles = await addMissing(Role, roles)
  const addedTemplates = await savePresets(templates)
  console.log(`Roles: ${addedRoles} added (${roles.length - addedRoles} already there)`)
  console.log(`Templates: ${addedTemplates} added, ${templates.length - addedTemplates} updated to their preset settings`)
}

seedCatalog()
  .catch((error) => {
    console.error('Could not seed the catalog:', error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
