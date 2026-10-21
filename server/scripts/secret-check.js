// Scans every file tracked by git for things that look like secrets: npm run secret-check
// Prints only the file name and line number (never the value) and fails if anything is found.
// Run it before every commit.
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const repoRoot = execSync('git rev-parse --show-toplevel').toString().trim()
const trackedFiles = execSync('git ls-files', { cwd: repoRoot }).toString().split('\n').filter(Boolean)

// Values that are clearly placeholders, like "your-key-here" or "replace-with-a-long-random-string"
const PLACEHOLDER = /^(|your[-_].*|replace[-_].*|choose[-_].*|change[-_]?me.*|example.*|xxx+|<.*>|\.\.\.|\[hidden\])$/i

const CHECKS = [
  // Google API keys: "AIza..." or "AQ." followed by a long run of key characters
  { name: 'Google API key', test: (line) => /\b(AIza[0-9A-Za-z_-]{30,}|AQ\.[0-9A-Za-z_-]{30,})/.test(line) },
  // NAME=value with a real (non-placeholder) value, in .env-style files, docs or code
  {
    name: 'secret value',
    test: (line) => {
      const match = line.match(/\b(GEMINI_API_KEY|JWT_SECRET|ADMIN_PASSWORD)\s*=\s*['"]?([^'"\s`]*)/)
      return Boolean(match) && !PLACEHOLDER.test(match[2])
    },
  },
  // A MongoDB address that has a username and password in it (before the @)
  { name: 'MongoDB password', test: (line) => /mongodb(\+srv)?:\/\/[^\s/:@]+:[^\s/@]+@/.test(line) },
]

let found = 0
for (const file of trackedFiles) {
  const fullPath = path.join(repoRoot, file)
  if (!fs.existsSync(fullPath)) continue
  const buffer = fs.readFileSync(fullPath)
  if (buffer.includes(0)) continue // skip images and other binary files

  buffer.toString('utf8').split('\n').forEach((line, index) => {
    for (const check of CHECKS) {
      if (check.test(line)) {
        found++
        console.log(`Possible ${check.name}: ${file}:${index + 1}`)
      }
    }
  })
}

if (found > 0) {
  console.log(`\n${found} possible secret(s) found. Remove them before committing.`)
  process.exitCode = 1
} else {
  console.log(`No secrets found in ${trackedFiles.length} tracked files.`)
}
