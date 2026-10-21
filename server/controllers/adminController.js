// Admin only: statistics, users and all resumes / ATS checks
const mongoose = require('mongoose')
const User = require('../models/User')
const Resume = require('../models/Resume')
const AtsCheck = require('../models/AtsCheck')

// GET /api/admin/stats  →  { totals, averageAtsScore, topMissingSkills, topJobTitles, resumesByCreatedVia,
//                          resumesPerCompany, checkedResumes, latestResumes }
async function getStats(req, res) {
  const [users, resumes, atsChecks, quickChecks] = await Promise.all([
    User.countDocuments({ role: 'user' }), // admins are not counted
    Resume.countDocuments(),
    AtsCheck.countDocuments(),
    AtsCheck.countDocuments({ source: 'quick' }),
  ])

  // Average of the latest score saved on each resume (resumes never checked are skipped)
  const [average] = await Resume.aggregate([
    { $match: { atsScore: { $ne: null } } },
    { $group: { _id: null, averageScore: { $avg: '$atsScore' } } },
  ])

  // The 10 skills that ATS checks most often found missing
  const topMissingSkills = await AtsCheck.aggregate([
    { $unwind: '$missingSkills' }, // one row per missing skill
    { $group: { _id: '$missingSkills', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 10 },
    { $project: { _id: 0, skill: '$_id', count: 1 } },
  ])

  // The 10 job titles people checked their resume against most often
  const topJobTitles = await AtsCheck.aggregate([
    { $match: { jobTitle: { $ne: '' } } },
    { $group: { _id: '$jobTitle', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 10 },
    { $project: { _id: 0, jobTitle: '$_id', count: 1 } },
  ])

  // How resumes were made: { import: 3, form: 5, blank: 1 }
  const createdViaRows = await Resume.aggregate([{ $group: { _id: '$createdVia', count: { $sum: 1 } } }])
  const resumesByCreatedVia = { import: 0, form: 0, blank: 0 }
  for (const row of createdViaRows) resumesByCreatedVia[row._id] = row.count

  // How many resumes target each company: { "Infosys": 4, "No company yet": 2 }
  const companyRows = await Resume.aggregate([{ $group: { _id: '$companyName', count: { $sum: 1 } } }])
  const resumesPerCompany = {}
  for (const row of companyRows) resumesPerCompany[row._id || 'No company yet'] = row.count

  // How many resumes have an ATS score saved
  const checkedResumes = await Resume.countDocuments({ atsScore: { $ne: null } })

  // The 5 most recently edited resumes, with the owner's name
  const latest = await Resume.find().sort({ updatedAt: -1 }).limit(5).populate('userId', 'name')
  const latestResumes = latest.map((resume) => ({
    id: resume._id.toString(),
    title: resume.title,
    ownerName: resume.userId ? resume.userId.name : '',
    updatedAt: resume.updatedAt,
  }))

  res.json({
    totals: { users, resumes, atsChecks, quickChecks },
    averageAtsScore: average ? Math.round(average.averageScore) : 0,
    topMissingSkills,
    topJobTitles,
    resumesByCreatedVia,
    resumesPerCompany,
    checkedResumes,
    latestResumes,
  })
}

// GET /api/admin/users  →  { users }  (each with resumeCount, never the password)
async function getUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 })

  // Count resumes per user in one query: [{ _id: userId, count: 3 }, ...]
  const counts = await Resume.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }])
  const countByUser = new Map(counts.map((row) => [row._id.toString(), row.count]))

  res.json({
    users: users.map((user) => ({ ...user.toJSON(), resumeCount: countByUser.get(user._id.toString()) || 0 })),
  })
}

// Finds the user an admin wants to change. Sends 404/400 and returns null if it's not allowed.
async function findUserToManage(req, res) {
  const user = mongoose.isValidObjectId(req.params.id) ? await User.findById(req.params.id) : null
  if (!user) {
    res.status(404).json({ message: 'User not found' })
    return null
  }
  if (user._id.equals(req.user._id)) {
    res.status(400).json({ message: "You can't block or delete your own account." })
    return null
  }
  if (user.role === 'admin') {
    res.status(400).json({ message: "You can't block or delete another admin." })
    return null
  }
  return user
}

// PATCH /api/admin/users/:id/block  →  { user }  (blocks, or unblocks if already blocked)
async function toggleBlock(req, res) {
  const user = await findUserToManage(req, res)
  if (!user) return

  user.blocked = !user.blocked
  await user.save()
  res.json({ user })
}

// DELETE /api/admin/users/:id  →  { message }  (also deletes their resumes and ATS checks)
async function deleteUser(req, res) {
  const user = await findUserToManage(req, res)
  if (!user) return

  await Resume.deleteMany({ userId: user._id })
  await AtsCheck.deleteMany({ userId: user._id })
  await user.deleteOne()
  res.json({ message: 'User and their data deleted.' })
}

// GET /api/admin/resumes  →  { resumes }  (newest first, with owner name and email)
async function getAllResumes(req, res) {
  const resumes = await Resume.find().sort({ updatedAt: -1 }).limit(100).populate('userId', 'name email')
  res.json({
    resumes: resumes.map((resume) => {
      const owner = resume.userId
      return {
        ...resume.toJSON(),
        userId: owner ? owner._id.toString() : '',
        owner: owner ? { name: owner.name, email: owner.email } : null,
      }
    }),
  })
}

// GET /api/admin/ats-checks  →  { checks }  (newest first)
async function getAtsChecks(req, res) {
  const checks = await AtsCheck.find().sort({ checkedAt: -1 }).limit(100)
  res.json({ checks })
}

module.exports = { getStats, getUsers, toggleBlock, deleteUser, getAllResumes, getAtsChecks }
