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

// Sends a request to the API and returns { status, body }
async function api(method, path, body) {
  const response = await fetch(BASE_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
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

// A new email for a temporary test user (used by later parts)
// eslint-disable-next-line no-unused-vars
function createTestEmail() {
  return `check-${crypto.randomBytes(4).toString('hex')}@test.local`
}

// Deletes every temporary test user and everything they created
async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI)
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
}

async function main() {
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
