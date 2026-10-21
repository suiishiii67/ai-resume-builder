// Simple tests that call the running server and print PASS or FAIL for each one.
// Start the server first (npm run dev), then run: npm run check
//
// Tests that need a user make a temporary one (check-<random>@test.local) with createTestUser().
// cleanup() deletes those users and their resumes and ATS checks at the end, even if a test fails.
require('dotenv').config({ quiet: true })
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = require('../models/User')
const Resume = require('../models/Resume')
const AtsCheck = require('../models/AtsCheck')

const BASE_URL = `http://localhost:${process.env.PORT || 5001}`
const TEST_EMAIL_PATTERN = /^check-.*@test\.local$/
// Logged-out quick checks have no user, so the tests mark theirs with this job title to clean them up
const TEST_JOB_TITLE = `Check script ${crypto.randomBytes(4).toString('hex')}`

let passed = 0
let failed = 0

// Sends a request to the API and returns { status, body, text }. Pass a token to be logged in.
async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null, text }
}

// Runs one test. The test function returns true (PASS) or false (FAIL).
async function test(name, testFunction) {
  try {
    const ok = await testFunction()
    if (ok) {
      passed++
      console.log(`PASS  ${name}`)
    } else {
      failed++
      console.log(`FAIL  ${name}`)
    }
  } catch (error) {
    failed++
    console.log(`FAIL  ${name}  (${error.message})`)
  }
}

// A new email for a temporary test user
function createTestEmail() {
  return `check-${crypto.randomBytes(4).toString('hex')}@test.local`
}

// Deletes every temporary test user and everything they created
async function cleanup() {
  const testUsers = await User.find({ email: TEST_EMAIL_PATTERN })
  const testUserIds = testUsers.map((user) => user._id)
  await Resume.deleteMany({ userId: { $in: testUserIds } })
  await AtsCheck.deleteMany({ userId: { $in: testUserIds } })
  await User.deleteMany({ _id: { $in: testUserIds } })
  await AtsCheck.deleteMany({ userId: null, jobTitle: TEST_JOB_TITLE })
  await mongoose.disconnect()
  if (testUsers.length > 0) console.log(`\nCleaned up ${testUsers.length} test user(s).`)
}

async function runTests() {
  console.log(`Testing ${BASE_URL}\n`)

  await test('GET /api/health returns ok and a connected database', async () => {
    const { status, body } = await api('GET', '/api/health')
    return status === 200 && body.ok === true && body.db === 'connected'
  })

  await test('Unknown route returns 404 with a message', async () => {
    const { status, body } = await api('GET', '/api/this-does-not-exist')
    return status === 404 && typeof body.message === 'string'
  })

  // ---------- Part 2: signup, login, profile ----------
  console.log('\nAuth and profile')
  const email = createTestEmail()
  const password = 'testpass123'
  let token = ''

  await test('Signup creates a user and returns a token', async () => {
    const { status, body, text } = await api('POST', '/api/auth/signup', { name: 'Check User', email, password })
    token = body.token
    return status === 201 && typeof body.token === 'string' && body.user.email === email && body.user.role === 'user' && !text.includes('password')
  })

  await test('Signup with role "admin" in the body still creates a normal user', async () => {
    const { status, body } = await api('POST', '/api/auth/signup', { name: 'Sneaky User', email: createTestEmail(), password, role: 'admin' })
    return status === 201 && body.user.role === 'user'
  })

  await test('Signup with an email that already exists fails', async () => {
    const { status, body } = await api('POST', '/api/auth/signup', { name: 'Check User', email: email.toUpperCase(), password })
    return status === 400 && body.message === 'An account with this email already exists.'
  })

  await test('Signup with an invalid email fails', async () => {
    const { status } = await api('POST', '/api/auth/signup', { name: 'Check User', email: 'not-an-email', password })
    return status === 400
  })

  await test('Signup with a weak password fails', async () => {
    const { status } = await api('POST', '/api/auth/signup', { name: 'Check User', email: createTestEmail(), password: 'abcdefgh' })
    return status === 400
  })

  await test('Login works with the right password', async () => {
    const { status, body, text } = await api('POST', '/api/auth/login', { email, password })
    return status === 200 && typeof body.token === 'string' && body.user.email === email && !text.includes('password')
  })

  await test('Login with a wrong password fails', async () => {
    const { status, body } = await api('POST', '/api/auth/login', { email, password: 'wrongpass123' })
    return status === 401 && body.message === 'Incorrect email or password.'
  })

  await test('Login with an unknown email gives the same message', async () => {
    const { status, body } = await api('POST', '/api/auth/login', { email: createTestEmail(), password })
    return status === 401 && body.message === 'Incorrect email or password.'
  })

  await test('GET /api/auth/me works with the token', async () => {
    const { status, body, text } = await api('GET', '/api/auth/me', null, token)
    return status === 200 && body.user.email === email && !text.includes('password')
  })

  await test('GET /api/auth/me fails without a token', async () => {
    const { status } = await api('GET', '/api/auth/me')
    return status === 401
  })

  await test('GET /api/auth/me fails with a fake token', async () => {
    const { status } = await api('GET', '/api/auth/me', null, 'this.is.fake')
    return status === 401
  })

  const newEmail = createTestEmail()
  await test('Profile update changes name and email', async () => {
    const { status, body, text } = await api('PATCH', '/api/users/me', { name: "Check D'Souza", email: newEmail }, token)
    return status === 200 && body.user.name === "Check D'Souza" && body.user.email === newEmail && !text.includes('password')
  })

  await test('Profile update to an email another account uses fails', async () => {
    const other = await api('POST', '/api/auth/signup', { name: 'Other User', email: createTestEmail(), password })
    const { status } = await api('PATCH', '/api/users/me', { name: 'Check User', email: other.body.user.email }, token)
    return status === 400
  })

  await test('Password change with a wrong current password fails', async () => {
    const { status } = await api('PATCH', '/api/users/me/password', { currentPassword: 'wrongpass123', newPassword: 'newpass456' }, token)
    return status === 400
  })

  await test('Password change works: old password stops working, new one works', async () => {
    const change = await api('PATCH', '/api/users/me/password', { currentPassword: password, newPassword: 'newpass456' }, token)
    const oldLogin = await api('POST', '/api/auth/login', { email: newEmail, password })
    const newLogin = await api('POST', '/api/auth/login', { email: newEmail, password: 'newpass456' })
    return change.status === 200 && oldLogin.status === 401 && newLogin.status === 200
  })

  await test('A blocked user cannot log in or use their token (403)', async () => {
    // There is no admin "block" route yet, so block the user straight in the database
    await User.updateOne({ email: newEmail }, { blocked: true })
    const login = await api('POST', '/api/auth/login', { email: newEmail, password: 'newpass456' })
    const me = await api('GET', '/api/auth/me', null, token)
    return login.status === 403 && me.status === 403 && me.body.message === 'Your account has been blocked. Contact the admin.'
  })

  await test('Admin from .env (ADMIN_EMAIL / ADMIN_PASSWORD) can log in and has role admin', async () => {
    const { status, body } = await api('POST', '/api/auth/login', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
    return status === 200 && body.user.role === 'admin'
  })

  // ---------- Part 3: resumes ----------
  console.log('\nResumes')
  // Admin stats before this part creates anything, to compare with later
  const admin = await api('POST', '/api/auth/login', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
  const adminToken = admin.body.token
  const statsBefore = (await api('GET', '/api/admin/stats', null, adminToken)).body

  const owner = await api('POST', '/api/auth/signup', { name: 'Resume Owner', email: createTestEmail(), password })
  const intruder = await api('POST', '/api/auth/signup', { name: 'Other Person', email: createTestEmail(), password })
  const ownerToken = owner.body.token
  const intruderToken = intruder.body.token

  const newResume = {
    title: 'Frontend Developer resume',
    userId: intruder.body.user.id, // must be ignored: the owner comes from the token
    templateId: 'modern',
    personal: { fullName: 'Resume Owner', email: 'owner@example.com', phone: '+91 98200 12345' },
    skills: ['React', 'JavaScript'],
    experience: [{ id: 'exp-1', jobTitle: 'Intern', company: 'Acme', bullets: 'Built things' }],
    jobDescription: { text: 'We need React skills', title: 'Frontend Developer', company: 'Acme', skills: ['React'] },
    createdVia: 'form',
  }
  let resumeId = ''

  await test('Create a resume (owner comes from the token, not the body)', async () => {
    const { status, body } = await api('POST', '/api/resumes', newResume, ownerToken)
    resumeId = body.resume && body.resume.id
    return status === 201 && body.resume.userId === owner.body.user.id && body.resume.jobDescription.title === 'Frontend Developer'
  })

  await test('List my resumes', async () => {
    const { status, body } = await api('GET', '/api/resumes', null, ownerToken)
    return status === 200 && body.resumes.length === 1 && body.resumes[0].id === resumeId
  })

  await test('Read my resume', async () => {
    const { status, body } = await api('GET', `/api/resumes/${resumeId}`, null, ownerToken)
    return status === 200 && body.resume.title === newResume.title && body.resume.experience[0].id === 'exp-1'
  })

  await test('Update my resume', async () => {
    const { status, body } = await api('PUT', `/api/resumes/${resumeId}`, { summary: 'New summary', skills: ['React', 'Node.js'] }, ownerToken)
    return status === 200 && body.resume.summary === 'New summary' && body.resume.skills.length === 2
  })

  await test('Update cannot change userId or atsScore', async () => {
    const { status, body } = await api('PUT', `/api/resumes/${resumeId}`, { userId: intruder.body.user.id, atsScore: 99, atsCheckedAt: new Date() }, ownerToken)
    return status === 200 && body.resume.userId === owner.body.user.id && body.resume.atsScore === null && body.resume.atsCheckedAt === null
  })

  await test('An international phone number is accepted', async () => {
    const { status } = await api('PUT', `/api/resumes/${resumeId}`, { personal: { fullName: 'Resume Owner', phone: '+44 20 7946 0958' } }, ownerToken)
    return status === 200
  })

  await test('An invalid email in personal is rejected (400)', async () => {
    const { status } = await api('PUT', `/api/resumes/${resumeId}`, { personal: { email: 'not-an-email' } }, ownerToken)
    return status === 400
  })

  await test('An invalid phone in personal is rejected (400)', async () => {
    const { status } = await api('PUT', `/api/resumes/${resumeId}`, { personal: { phone: '12345' } }, ownerToken)
    return status === 400
  })

  await test('A resume without a title is rejected (400)', async () => {
    const { status } = await api('POST', '/api/resumes', { summary: 'No title' }, ownerToken)
    return status === 400
  })

  await test('More than 50 skills is rejected (400)', async () => {
    const skills = Array.from({ length: 51 }, (_, index) => `Skill ${index}`)
    const { status } = await api('PUT', `/api/resumes/${resumeId}`, { skills }, ownerToken)
    return status === 400
  })

  await test('An invalid resume id returns 404', async () => {
    const { status, body } = await api('GET', '/api/resumes/not-a-real-id', null, ownerToken)
    return status === 404 && body.message === 'Resume not found'
  })

  await test("Another user gets 404 on my resume (read, update, delete, duplicate)", async () => {
    const read = await api('GET', `/api/resumes/${resumeId}`, null, intruderToken)
    const update = await api('PUT', `/api/resumes/${resumeId}`, { title: 'Hacked' }, intruderToken)
    const remove = await api('DELETE', `/api/resumes/${resumeId}`, null, intruderToken)
    const copy = await api('POST', `/api/resumes/${resumeId}/duplicate`, null, intruderToken)
    const score = await api('PATCH', `/api/resumes/${resumeId}/ats-score`, { score: 50 }, intruderToken)
    const stillMine = await api('GET', `/api/resumes/${resumeId}`, null, ownerToken)
    return [read, update, remove, copy, score].every((result) => result.status === 404) && stillMine.body.resume.title === newResume.title
  })

  await test("tailoredFrom pointing to another user's resume is rejected (400)", async () => {
    const othersResume = await api('POST', '/api/resumes', { title: 'Not yours' }, intruderToken)
    const { status } = await api('POST', '/api/resumes', { title: 'Tailored copy', tailoredFrom: othersResume.body.resume.id }, ownerToken)
    return status === 400
  })

  await test('tailoredFrom pointing to my own resume works', async () => {
    const { status, body } = await api('POST', '/api/resumes', { title: 'Tailored copy', tailoredFrom: resumeId }, ownerToken)
    return status === 201 && body.resume.tailoredFrom === resumeId
  })

  await test('Save an ATS score (75 works, 150 fails)', async () => {
    const valid = await api('PATCH', `/api/resumes/${resumeId}/ats-score`, { score: 75 }, ownerToken)
    const invalid = await api('PATCH', `/api/resumes/${resumeId}/ats-score`, { score: 150 }, ownerToken)
    return valid.status === 200 && valid.body.resume.atsScore === 75 && valid.body.resume.atsCheckedAt !== null && invalid.status === 400
  })

  await test('Duplicate makes a "(copy)" with new entry ids and no ATS score', async () => {
    const { status, body } = await api('POST', `/api/resumes/${resumeId}/duplicate`, null, ownerToken)
    const copy = body.resume
    return status === 201 && copy.id !== resumeId && copy.title === `${newResume.title} (copy)` &&
      copy.atsScore === null && copy.experience[0].id !== 'exp-1' && copy.experience[0].jobTitle === 'Intern'
  })

  await test('Delete my resume', async () => {
    const created = await api('POST', '/api/resumes', { title: 'To delete' }, ownerToken)
    const removed = await api('DELETE', `/api/resumes/${created.body.resume.id}`, null, ownerToken)
    const after = await api('GET', `/api/resumes/${created.body.resume.id}`, null, ownerToken)
    return removed.status === 200 && after.status === 404
  })

  // ---------- Part 3: ATS check records ----------
  console.log('\nATS check records')

  await test('Logged-in ATS check of my own resume is saved with my user id', async () => {
    const check = { source: 'saved', resumeId, score: 72, jobTitle: 'Frontend Developer', hasJobDescription: true, missingSkills: ['TypeScript'] }
    const { status, body } = await api('POST', '/api/ats/checks', check, ownerToken)
    return status === 201 && body.check.userId === owner.body.user.id && body.check.resumeId === resumeId
  })

  await test("Logged-in ATS check with someone else's resumeId fails", async () => {
    const { status } = await api('POST', '/api/ats/checks', { source: 'saved', resumeId, score: 50 }, intruderToken)
    return status === 400
  })

  await test('Logged-out quick check works and stores no user', async () => {
    const check = { source: 'quick', score: 64, jobTitle: TEST_JOB_TITLE, hasJobDescription: true, missingSkills: ['Docker'] }
    const { status, body } = await api('POST', '/api/ats/checks', check)
    const saved = await AtsCheck.findById(body.check.id).lean()
    return status === 201 && body.check.userId === null && saved.userId === null && saved.resumeId === null
  })

  await test('Logged-out check with a resumeId fails', async () => {
    const { status } = await api('POST', '/api/ats/checks', { source: 'quick', resumeId, score: 64, jobTitle: TEST_JOB_TITLE })
    return status === 400
  })

  await test("Logged-out check with source 'saved' fails", async () => {
    const { status } = await api('POST', '/api/ats/checks', { source: 'saved', score: 64, jobTitle: TEST_JOB_TITLE })
    return status === 400
  })

  await test('Resume and job description text in the body are not stored', async () => {
    const check = {
      source: 'quick', score: 80, jobTitle: 'Backend Developer', hasJobDescription: true, missingSkills: [],
      resumeText: 'SECRET RESUME TEXT', jobDescriptionText: 'SECRET JOB TEXT', text: 'SECRET',
    }
    const { status, body, text } = await api('POST', '/api/ats/checks', check, ownerToken)
    const saved = await AtsCheck.findById(body.check.id).lean()
    return status === 201 && !text.includes('SECRET') && !JSON.stringify(saved).includes('SECRET')
  })

  await test('An ATS check with score 150 fails', async () => {
    const { status } = await api('POST', '/api/ats/checks', { source: 'quick', score: 150 }, ownerToken)
    return status === 400
  })

  // ---------- Part 3: admin ----------
  console.log('\nAdmin')
  const adminRoutes = [
    ['GET', '/api/admin/stats'],
    ['GET', '/api/admin/users'],
    ['PATCH', `/api/admin/users/${intruder.body.user.id}/block`],
    ['DELETE', `/api/admin/users/${intruder.body.user.id}`],
    ['GET', '/api/admin/resumes'],
    ['GET', '/api/admin/ats-checks'],
  ]

  await test('A normal user gets 403 on every admin route', async () => {
    const results = await Promise.all(adminRoutes.map(([method, path]) => api(method, path, null, ownerToken)))
    return results.every((result) => result.status === 403)
  })

  await test('No token gets 401 on every admin route', async () => {
    const results = await Promise.all(adminRoutes.map(([method, path]) => api(method, path)))
    return results.every((result) => result.status === 401)
  })

  await test('Admin stats load, and the counts went up after the tests created data', async () => {
    const { status, body } = await api('GET', '/api/admin/stats', null, adminToken)
    return status === 200 &&
      body.totals.users > statsBefore.totals.users &&
      body.totals.resumes > statsBefore.totals.resumes &&
      body.totals.atsChecks > statsBefore.totals.atsChecks &&
      body.totals.quickChecks > statsBefore.totals.quickChecks &&
      body.topMissingSkills.some((row) => row.skill === 'TypeScript') &&
      body.topJobTitles.some((row) => row.jobTitle === 'Frontend Developer') &&
      body.latestResumes.length > 0 && body.latestResumes[0].ownerName !== ''
  })

  await test('Admin users list shows resume counts and no passwords', async () => {
    const { status, body, text } = await api('GET', '/api/admin/users', null, adminToken)
    const ownerRow = body.users.find((user) => user.id === owner.body.user.id)
    return status === 200 && ownerRow.resumeCount === 3 && !text.includes('password')
  })

  await test('Admin resumes list shows the owner name and email', async () => {
    const { status, body } = await api('GET', '/api/admin/resumes', null, adminToken)
    const row = body.resumes.find((resume) => resume.id === resumeId)
    return status === 200 && row.owner.name === 'Resume Owner' && row.owner.email === owner.body.user.email
  })

  await test('Admin ATS checks list loads', async () => {
    const { status, body } = await api('GET', '/api/admin/ats-checks', null, adminToken)
    return status === 200 && body.checks.some((check) => check.resumeId === resumeId)
  })

  await test('Admin blocks a user → they cannot log in (403); unblock → login works again', async () => {
    const credentials = { email: intruder.body.user.email, password }
    const block = await api('PATCH', `/api/admin/users/${intruder.body.user.id}/block`, null, adminToken)
    const blockedLogin = await api('POST', '/api/auth/login', credentials)
    const unblock = await api('PATCH', `/api/admin/users/${intruder.body.user.id}/block`, null, adminToken)
    const login = await api('POST', '/api/auth/login', credentials)
    return block.body.user.blocked === true && blockedLogin.status === 403 && unblock.body.user.blocked === false && login.status === 200
  })

  await test('Admin cannot block or delete their own account', async () => {
    const block = await api('PATCH', `/api/admin/users/${admin.body.user.id}/block`, null, adminToken)
    const remove = await api('DELETE', `/api/admin/users/${admin.body.user.id}`, null, adminToken)
    return block.status === 400 && remove.status === 400
  })

  await test('Admin deletes a user → their resumes and ATS checks are gone', async () => {
    const ownerId = owner.body.user.id
    const removed = await api('DELETE', `/api/admin/users/${ownerId}`, null, adminToken)
    const [users, resumes, checks] = await Promise.all([
      User.countDocuments({ _id: ownerId }),
      Resume.countDocuments({ userId: ownerId }),
      AtsCheck.countDocuments({ userId: ownerId }),
    ])
    const login = await api('POST', '/api/auth/login', { email: owner.body.user.email, password })
    return removed.status === 200 && users === 0 && resumes === 0 && checks === 0 && login.status === 401
  })
}

async function main() {
  // Tests talk to the server over HTTP; this database connection is only for setup and cleanup
  await mongoose.connect(process.env.MONGO_URI)
  try {
    await runTests()
  } catch (error) {
    console.log(`\nTests stopped: ${error.message}. Is the server running (npm run dev)?`)
    failed++
  } finally {
    await cleanup()
  }
  console.log(`\n${passed} passed, ${failed} failed`)
  process.exitCode = failed > 0 ? 1 : 0
}

main()
