// Finds skills in a job description (or any text) using the skills list and its short forms.
import skillsList from '../data/skillsList'
import { containsKeyword } from './keywordUtils'

// Escape + . # so "C++" and "Node.js" work in a RegExp
function escapeForRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Whole-word match on the exact spelling, so "Go" does not match "go-getter" and "R" not "R&D"
function containsExactWord(text, word) {
  return new RegExp(`(^|[^A-Za-z0-9+#&-])${escapeForRegex(word)}(?=$|[^A-Za-z0-9+#&-])`).test(text)
}

// True if the text uses the skill's name or any of its short forms
function textHasListedSkill(text, skill) {
  const names = [skill.name, ...skill.aliases]
  return names.some((name) => (skill.caseSensitive ? containsExactWord(text, name) : containsKeyword(text, name)))
}

// The list entry for a skill name or short form ("JS" → JavaScript), or null
export function findListedSkill(name) {
  const key = name.trim().toLowerCase()
  return skillsList.find((skill) => skill.name.toLowerCase() === key || skill.aliases.some((alias) => alias.toLowerCase() === key)) || null
}

// Skill names found in the text, in the order of the skills list
export function findSkillsInText(text) {
  if (!text || !text.trim()) return []
  return skillsList.filter((skill) => textHasListedSkill(text, skill)).map((skill) => skill.name)
}

// True if the text has this skill (also counts short forms, e.g. "ReactJS" for React)
export function textHasSkill(text, skillName) {
  const skill = findListedSkill(skillName)
  return skill ? textHasListedSkill(text, skill) : containsKeyword(text, skillName)
}

// First short line of the job description, often the job title ("Frontend Developer (0-2 years)")
export function guessJobTitle(text) {
  const firstLine = (text || '').split('\n').map((line) => line.trim()).find(Boolean) || ''
  const title = firstLine.replace(/\(.*?\)/g, '').replace(/^(job title|role|position)\s*:\s*/i, '').trim()
  return title.length <= 60 && title.split(/\s+/).length <= 8 ? title : ''
}

// ---------- The job description saved on a resume ----------
// A resume keeps its job description as { text, title, company, skills }.

// Builds that object from the pasted text (skills are found in the text)
export function buildJobDescription(text, { title = '', company = '' } = {}) {
  const cleanText = (text || '').trim()
  return { text: cleanText, title: title.trim(), company: company.trim(), skills: findSkillsInText(cleanText) }
}

// The job description text of a resume ('' if none)
export function getJobText(resume) {
  return resume?.jobDescription?.text || ''
}

// The skills the resume's job description asks for ([] if none)
export function getJobSkills(resume) {
  return resume?.jobDescription?.skills || []
}
