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
