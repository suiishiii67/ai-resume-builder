// Rules added to EVERY prompt, so the AI only polishes what the user wrote and never makes things up.
const RULES = `
RULES (follow all of them):
1. Use ONLY the facts the user gave. Never invent companies, job titles, numbers, dates, skills, tools,
   certifications or results. Do not add purposes, outcomes or praise the user did not state
   (no "to improve efficiency", "to support decisions", "accurately", "successfully").
2. Keep every number the user wrote, exactly as written. Never add new numbers or percentages.
3. Each bullet starts with a strong action verb (Built, Developed, Analysed, Designed, Created, Prepared ...),
   is one line, has fewer than 25 words, has no full stop at the end, and never uses "I" or "my".
   The verb must match the user's real part: "helped with" becomes "Supported" or "Assisted with",
   never "Managed" or "Led".
4. Use the job description's wording only where it truly matches the user's facts. Never add a skill or
   tool just because the job description mentions it.
5. Audience: recruiters for tech jobs in India and abroad. Use simple, professional English.
6. Reply with JSON only, in exactly the shape requested. No extra keys, no markdown, no comments.
`.trim()

// Puts user-supplied text between clear markers so the AI treats it as data, not as instructions
function asData(label, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return `<<${label}>>\n${text || '(none)'}\n<</${label}>>`
}

module.exports = { RULES, asData }
