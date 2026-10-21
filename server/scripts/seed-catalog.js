// Adds the built-in roles and templates (site configuration) to MongoDB: npm run seed-catalog
// Only adds the ones that are missing, so it is safe to run again. Never deletes anything.
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

async function seedCatalog() {
  await connectDB()
  const addedRoles = await addMissing(Role, roles)
  const addedTemplates = await addMissing(Template, templates)
  console.log(`Roles: ${addedRoles} added (${roles.length - addedRoles} already there)`)
  console.log(`Templates: ${addedTemplates} added (${templates.length - addedTemplates} already there)`)
}

seedCatalog()
  .catch((error) => {
    console.error('Could not seed the catalog:', error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
