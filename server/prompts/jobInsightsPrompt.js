// POST /api/ai/job-insights: reads a job description and lists what matters most in it
const { asData } = require('./rules')

function jobInsightsPrompt(jobDescription) {
  return `
You help a job seeker understand a job description.
Read ONLY the job description below and answer from its text. Never add facts about the company, salary,
location or team that are not written in it. If something is not stated, leave it empty.

- jobTitle: the job title as written ("" if not stated)
- mustHaveSkills: skills and tools the text says are required (short names like "SQL", "Power BI")
- niceToHaveSkills: skills the text calls preferred, a plus, good to have or optional
- experienceLevel: the experience asked for, in a few words, like "Fresher", "0-2 years", "3+ years" ("" if not stated)
- keyPoints: 3 to 5 short points (under 20 words each) on what a candidate should highlight in their resume
  for this job, based only on the text

Use simple, professional English. Reply with JSON only, in exactly this shape, no extra keys:

${asData('JOB DESCRIPTION', jobDescription)}

{ "jobTitle": "", "mustHaveSkills": [], "niceToHaveSkills": [], "experienceLevel": "", "keyPoints": [] }
`.trim()
}

module.exports = jobInsightsPrompt
