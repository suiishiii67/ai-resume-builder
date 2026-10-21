// Skill helpers, the same rules as client/src/utils/jobDescription.js
const skillsList = require('../data/skillsList')

// Escape + . # so "C++" and "Node.js" work in a RegExp
function escapeForRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Whole-word match, ignoring case: "java" does not match inside "javascript"
function containsKeyword(text, keyword) {
  const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeForRegex(keyword.toLowerCase())}(?=$|[^a-z0-9+#])`)
  return pattern.test(text.toLowerCase())
}

// Whole-word match on the exact spelling, so "Go" does not match "go-getter" and "R" not "R&D"
function containsExactWord(text, word) {
  return new RegExp(`(^|[^A-Za-z0-9+#&-])${escapeForRegex(word)}(?=$|[^A-Za-z0-9+#&-])`).test(text)
}

function textHasListedSkill(text, skill) {
  const names = [skill.name, ...skill.aliases]
  return names.some((name) => (skill.caseSensitive ? containsExactWord(text, name) : containsKeyword(text, name)))
}

// The list entry for a skill name or short form ("JS" → JavaScript), or null
function findListedSkill(name) {
  const key = name.trim().toLowerCase()
  return skillsList.find((skill) => skill.name.toLowerCase() === key || skill.aliases.some((alias) => alias.toLowerCase() === key)) || null
}

// Skill names found in the text, in the order of the skills list
function findSkillsInText(text) {
  if (!text || !text.trim()) return []
  return skillsList.filter((skill) => textHasListedSkill(text, skill)).map((skill) => skill.name)
}

// Standard skill names ("reactjs" → "React"), without repeats
function standardiseSkills(skills) {
  const names = skills.map((skill) => (findListedSkill(skill) || {}).name || skill.trim()).filter(Boolean)
  return names.filter((name, index) => names.findIndex((other) => other.toLowerCase() === name.toLowerCase()) === index)
}

// The user's skills, with the ones the job asks for first
function sortSkillsByJob(skills, jobDescription) {
  const jobSkills = findSkillsInText(jobDescription)
  const inJob = skills.filter((skill) => jobSkills.includes((findListedSkill(skill) || {}).name))
  return [...inJob, ...skills.filter((skill) => !inJob.includes(skill))]
}

module.exports = { findListedSkill, findSkillsInText, standardiseSkills, sortSkillsByJob }
