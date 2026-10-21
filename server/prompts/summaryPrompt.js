// POST /api/ai/summary (and tailor-summary): a short professional summary from the user's own details
const { RULES, asData } = require('./rules')

function summaryPrompt(profile, jobDescription) {
  return `
You write the professional summary at the top of a resume.
Write a summary of 40 to 80 words from the profile below: degree and graduation year, the role (and company,
if given) being applied for, the most relevant skills, the best project or internship.
Put the skills the job description asks for first, but only skills that are in the profile.
Write in the third person without a name or pronouns (for example "B.Tech graduate skilled in ..."), never "I".
Write ONE paragraph of full sentences: no bullet points and no line breaks.
If the profile has very little, write a shorter honest summary rather than adding anything.

${RULES}

${asData('PROFILE', profile)}

${asData('JOB DESCRIPTION', jobDescription)}

Reply with this JSON shape:
{ "summary": "the summary" }
`.trim()
}

module.exports = summaryPrompt
