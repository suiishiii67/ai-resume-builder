// POST /api/ai/bullets: turns the user's own sentences into resume bullet points
const { RULES, asData } = require('./rules')

function bulletsPrompt(text, jobDescription) {
  return `
You write resume bullet points.
Rewrite the user's text below as resume bullet points. Each sentence or line usually becomes one bullet.
Replace weak openings like "worked on", "helped with", "made" or "responsible for" with a strong action verb
that matches what the user actually did. Do not merge or drop facts.

${RULES}

${asData('USER TEXT', text)}

${asData('JOB DESCRIPTION', jobDescription)}

Reply with this JSON shape:
{ "bullets": ["bullet 1", "bullet 2"] }
`.trim()
}

module.exports = bulletsPrompt
