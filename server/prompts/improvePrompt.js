// POST /api/ai/improve: polishes one section of the resume without adding facts.
// Each section asks for a different JSON shape; the server checks the shape before using it.
const { RULES, asData } = require('./rules')

const TASKS = {
  summary: {
    task: `Improve this resume summary: fix grammar and spelling, remove "I", "I am" and "my", make it clear
and professional, and keep it between 40 and 80 words if the facts allow. Keep every fact and number.
The summary is ONE paragraph of full sentences: no bullet points and no line breaks.`,
    shape: '{ "value": "the improved summary", "note": "one short sentence about what changed" }',
  },
  skills: {
    task: `Clean up this skills list: use the standard spelling of each skill ("reactjs" → "React",
"node" → "Node.js"), remove repeats, and put the skills the job description asks for first.
Never add a skill that is not in the list.`,
    shape: '{ "value": ["Skill 1", "Skill 2"], "note": "one short sentence about what changed" }',
  },
  entries: {
    task: `Improve the bullet points of each entry below. "bullets" is text with one bullet per line.
Rewrite each entry's bullets only; do not change titles, companies, names or dates.
Keep each entry's "id" exactly as given, and return every entry once.`,
    shape: '{ "entries": [{ "id": "the same id", "bullets": ["bullet 1", "bullet 2"] }], "note": "one short sentence about what changed" }',
  },
}

function improvePrompt(section, content, jobDescription) {
  const isEntries = section === 'experience' || section === 'projects'
  const { task, shape } = TASKS[isEntries ? 'entries' : section]
  return `
You improve one section of a resume (section: ${section}).
${task}

${RULES}

${asData('SECTION CONTENT', content)}

${asData('JOB DESCRIPTION', jobDescription)}

Reply with this JSON shape:
${shape}
`.trim()
}

module.exports = improvePrompt
