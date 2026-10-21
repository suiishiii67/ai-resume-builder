// The only file that talks to Google Gemini, and the only place the API key is used.
// The key is read from process.env (server/.env) and is never logged, returned or sent to the browser.
const { GoogleGenAI } = require('@google/genai')

const TIMEOUT_MS = 20000

// An error with a friendly message and a status code for the frontend.
// Raw Gemini errors are never sent to the frontend.
class AiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

// Removes anything that looks like an API key from a message before it is logged
function hideSecrets(text) {
  let safeText = String(text)
  const key = process.env.GEMINI_API_KEY
  if (key) safeText = safeText.split(key).join('[hidden]')
  return safeText
    .replace(/([?&]key=)[^&\s"']+/gi, '$1[hidden]')
    .replace(/\b(AIza|AQ\.)[0-9A-Za-z_.-]{20,}/g, '[hidden]')
}

function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new AiError(503, 'AI key not set')
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

// Is it worth trying the backup model? Yes for "free limit reached" (429), "model not found" (404),
// Google's side being busy or too slow (500, 503, 504) and our own 20-second timeout.
function shouldTryBackup(error) {
  const timedOut = /timed? ?out|aborted|deadline/i.test(error.message || '')
  return [429, 404, 500, 503, 504].includes(error.status) || timedOut
}

// "gemini-3.8-flash" → 3.8
function versionOf(model) {
  const match = model.match(/gemini-(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

// Sends the prompt to one model and returns the parsed JSON reply
async function callModel(client, model, prompt) {
  const config = {
    responseMimeType: 'application/json', // ask for JSON only
    temperature: 0.3, // low = steady, factual answers
    httpOptions: { timeout: TIMEOUT_MS },
  }
  // Gemini 3+ models "think" before answering; a low level is faster and enough for short writing tasks
  if (versionOf(model) >= 3) config.thinkingConfig = { thinkingLevel: 'low' }

  const response = await client.models.generateContent({ model, contents: prompt, config })
  try {
    return JSON.parse(response.text)
  } catch {
    throw new AiError(502, 'AI returned an unexpected answer')
  }
}

// Asks Gemini and returns { data, model }: data = the parsed JSON reply, model = which model answered.
// Tries GEMINI_MODEL first, then GEMINI_FALLBACK_MODEL once if the first is busy, limited or missing.
async function askGeminiJSON(prompt) {
  const client = getClient()
  const models = [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL].filter(Boolean)
  if (models.length === 0) throw new AiError(503, 'AI is not available right now')

  let lastError = null
  for (const model of models) {
    try {
      const data = await callModel(client, model, prompt)
      return { data, model }
    } catch (error) {
      lastError = error
      console.warn(`Gemini (${model}) failed: ${error.status || ''} ${hideSecrets(error.message).slice(0, 160)}`.trim())
      if (!shouldTryBackup(error)) break
    }
  }

  if (lastError instanceof AiError) throw lastError
  if (lastError && lastError.status === 429) throw new AiError(429, 'AI limit reached, try again in a minute')
  throw new AiError(503, 'AI is not available right now')
}

module.exports = { askGeminiJSON, AiError, hideSecrets, getClient }
