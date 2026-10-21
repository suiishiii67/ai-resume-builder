// POST /api/ai/generate: ONE request writes the summary and turns every project and internship
// description into bullets. Everything else in the draft is built by plain code.
const { RULES, asData } = require('./rules')

function generatePrompt(profile, jobDescription) {
  return `
You help a student write the first draft of their resume.
1. Write a professional summary of 40 to 80 words from the profile (degree, graduation year, the role and
   company being applied for, the most relevant skills, the best project or internship). Third person,
   no name, never "I". ONE paragraph of full sentences, no bullet points.
2. For every item in "projects" and "experience", turn its "description" into resume bullet points.
   Keep each item's "key" exactly as given and return every item once.

${RULES}

${asData('PROFILE', profile)}

${asData('JOB DESCRIPTION', jobDescription)}

Reply with this JSON shape:
{
  "summary": "the summary",
  "projects": [{ "key": "the same key", "bullets": ["bullet 1", "bullet 2"] }],
  "experience": [{ "key": "the same key", "bullets": ["bullet 1", "bullet 2"] }]
}
`.trim()
}

module.exports = generatePrompt
