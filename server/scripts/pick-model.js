// Finds the best free Gemini models this key can use, and tests them.
//   npm run pick-model            → list Flash models, pick the newest stable ones, test each
//   npm run pick-model -- --saved → test GEMINI_MODEL and GEMINI_FALLBACK_MODEL through the app's geminiService
// Prints model names only, never the key.
require('dotenv').config({ quiet: true })
const { getClient, askGeminiJSON, hideSecrets } = require('../services/geminiService')

const TEST_PROMPT = 'Reply with the word OK as JSON: {"reply": "OK"}'

// "gemini-2.5-flash" → 2.5, so newer versions sort first
function versionOf(name) {
  const match = name.match(/gemini-(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

const isPreview = (name) => /preview|exp/.test(name)
const isLite = (name) => name.includes('flash-lite')

// Newest first; stable before preview when the version is the same
function sortNewestFirst(names) {
  return [...names].sort((first, second) => versionOf(second) - versionOf(first) || isPreview(first) - isPreview(second))
}

async function listFlashModels(client) {
  const names = []
  const pager = await client.models.list({ config: { pageSize: 100 } })
  for await (const model of pager) {
    const name = model.name.replace('models/', '')
    const canWriteText = (model.supportedActions || []).includes('generateContent')
    // Skip image, speech and audio models, and "-latest" aliases that have no version number
    const isTextFlash = name.includes('flash') && !/image|tts|audio|live/.test(name) && versionOf(name) > 0
    if (canWriteText && isTextFlash) names.push(name)
  }
  return names
}

// Sends the tiny test prompt to one model. Returns true if it answered.
async function testModel(client, model) {
  try {
    const response = await client.models.generateContent({
      model,
      contents: TEST_PROMPT,
      config: { responseMimeType: 'application/json', httpOptions: { timeout: 20000 } },
    })
    return /ok/i.test(response.text)
  } catch (error) {
    console.log(`  ${model}: failed (${error.status || 'error'}) ${hideSecrets(error.message).slice(0, 100)}`)
    return false
  }
}

// Picks the newest stable model of one type that answers the test call (newest preview if no stable one works)
async function pickWorking(client, label, candidates) {
  const stable = sortNewestFirst(candidates.filter((name) => !isPreview(name)))
  const previews = sortNewestFirst(candidates.filter(isPreview))
  for (const model of [...stable, ...previews]) {
    const works = await testModel(client, model)
    if (works) {
      const note = isPreview(model) ? ' (preview: no stable model of this type answered)' : ''
      console.log(`  ${label}: ${model} answered OK${note}`)
      return model
    }
  }
  console.log(`  ${label}: no model answered`)
  return null
}

async function pickModels() {
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'set' : 'not set'}`)
  const client = getClient()

  const flashModels = await listFlashModels(client)
  const flash = flashModels.filter((name) => !isLite(name))
  const lite = flashModels.filter(isLite)
  console.log(`\nFlash models: ${sortNewestFirst(flash).join(', ')}`)
  console.log(`Flash-Lite models: ${sortNewestFirst(lite).join(', ')}`)

  console.log('\nTest calls ("Reply with the word OK"):')
  const main = await pickWorking(client, 'Main (Flash)', flash)
  const backup = await pickWorking(client, 'Backup (Flash-Lite)', lite)

  if (main && backup) {
    console.log(`\nSave them with:  npm run set-models -- ${main} ${backup}`)
  }
}

// Tests the saved models through the same code the app uses
async function testSavedModels() {
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'set' : 'not set'}`)
  console.log(`Saved models: ${process.env.GEMINI_MODEL || '(none)'}, ${process.env.GEMINI_FALLBACK_MODEL || '(none)'}`)
  const { data, model } = await askGeminiJSON(TEST_PROMPT)
  console.log(`geminiService answered with ${model}: ${JSON.stringify(data)}`)
}

const run = process.argv.includes('--saved') ? testSavedModels : pickModels
run().catch((error) => {
  console.error(`Failed: ${hideSecrets(error.message)}`)
  process.exitCode = 1
})
