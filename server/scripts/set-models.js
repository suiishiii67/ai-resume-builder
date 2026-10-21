// Saves the chosen models in server/.env:  npm run set-models -- <main> <backup>
// Changes ONLY the GEMINI_MODEL= and GEMINI_FALLBACK_MODEL= lines (adds them if missing).
// Never prints any other line of .env.
const fs = require('fs')
const path = require('path')

const ENV_PATH = path.join(__dirname, '..', '.env')
const MODEL_NAME_PATTERN = /^[a-z0-9][a-z0-9.-]{2,60}$/

const [main, backup] = process.argv.slice(2)
if (!MODEL_NAME_PATTERN.test(main || '') || !MODEL_NAME_PATTERN.test(backup || '')) {
  console.error('Usage: npm run set-models -- <main-model> <backup-model>   e.g. gemini-2.5-flash gemini-2.5-flash-lite')
  process.exit(1)
}

// Replaces the line "NAME=..." or adds it at the end
function setLine(lines, name, value) {
  const index = lines.findIndex((line) => line.startsWith(`${name}=`))
  if (index === -1) lines.push(`${name}=${value}`)
  else lines[index] = `${name}=${value}`
}

const lines = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8').split('\n') : []
if (lines.length && lines[lines.length - 1] === '') lines.pop() // so new lines go before the final newline
setLine(lines, 'GEMINI_MODEL', main)
setLine(lines, 'GEMINI_FALLBACK_MODEL', backup)
fs.writeFileSync(ENV_PATH, `${lines.join('\n')}\n`)

console.log(`Models saved: ${main}, ${backup}`)
