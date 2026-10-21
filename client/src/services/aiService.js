// AI service: every AI button in the site calls these functions.
// Each one asks our backend (/api/ai/*), which calls Google Gemini and keeps the API key secret.
// If the AI is busy or unreachable, the same answer is made by simple written rules instead ("basic mode"),
// so the site never breaks. Every answer has source: 'ai' or 'basic', so the page can show which one it is.
// The rules only rearrange and clean what the user typed; they never add new facts.
import { createId } from '../utils/mockApi'
import { findSkillsInText, textHasSkill, findListedSkill, guessJobTitle } from '../utils/jobDescription'
import { apiRequest, getToken } from './api'

export const BASIC_MODE_MESSAGE = 'AI is busy right now, so basic mode was used.'
// The server tries two models for up to 20 seconds each, so wait a little longer than that
const AI_TIMEOUT_MS = 45000

// ---------- Small text helpers ----------

// Weak openings and the action verb that replaces them
const WEAK_STARTS = [
  [/^(i\s+)?worked on\s+/i, 'Developed '],
  [/^(i\s+)?was responsible for\s+/i, 'Handled '],
  [/^(i\s+)?responsible for\s+/i, 'Handled '],
  [/^(i\s+)?helped (with |in )?/i, 'Supported '],
  [/^(i\s+)?was part of\s+/i, 'Contributed to '],
  [/^(i\s+)?made\s+/i, 'Built '],
  [/^(i\s+)?did\s+/i, 'Completed '],
  [/^i\s+/i, ''],
]

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1)
const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0)

// "worked on the login page." → "Developed the login page"
function cleanBullet(line) {
  let bullet = line.trim().replace(/^[•\-*–·]\s*/, '').replace(/[.;]+$/, '')
  WEAK_STARTS.forEach(([pattern, replacement]) => {
    bullet = bullet.replace(pattern, replacement)
  })
  return capitalise(bullet.trim())
}

// Splits a paragraph into sentences and lines; numbers are never changed
function textToBullets(text) {
  return (text || '')
    .split(/\n|(?<=[a-z0-9%)])\.\s+(?=[A-Za-z])/)
    .map(cleanBullet)
    .filter((bullet) => bullet.length > 2)
}

// "React, Node.js and MongoDB" → "React, Node.js and MongoDB"; one item → itself
function joinWithAnd(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

// Standard skill names ("reactjs" → "React"), without repeats
function standardiseSkills(skills) {
  const names = skills.map((skill) => findListedSkill(skill)?.name || skill.trim()).filter(Boolean)
  return names.filter((name, index) => names.findIndex((other) => other.toLowerCase() === name.toLowerCase()) === index)
}

// User's skills, with the ones the job asks for first
function sortSkillsByJob(skills, jobDescription) {
  const jobSkills = findSkillsInText(jobDescription)
  const inJob = skills.filter((skill) => jobSkills.some((jobSkill) => textHasSkill(skill, jobSkill)))
  return [...inJob, ...skills.filter((skill) => !inJob.includes(skill))]
}

// The project with the most numbers in it (numbers show impact), else the first one
function pickBestProject(projects) {
  const withName = projects.filter((project) => project.name?.trim())
  const numberCount = (project) => (project.bullets || '').match(/\d+/g)?.length || 0
  return [...withName].sort((first, second) => numberCount(second) - numberCount(first))[0] || null
}

// ---------- Summary ----------

// profile: { degree, graduationYear, roleTitle, companyName, skills, projects, experience }
function buildSummary(profile, jobDescription) {
  const thisYear = new Date().getFullYear()
  const year = Number(profile.graduationYear)
  const degree = profile.degree?.trim()
  const role = profile.roleTitle?.trim() || 'entry-level'
  const company = profile.companyName?.trim()

  const sentences = []
  if (degree) {
    const stage = year && year >= thisYear ? `student graduating in ${year}` : year ? `graduate (${year})` : 'graduate'
    sentences.push(`${degree} ${stage}, applying for the ${role} role${company ? ` at ${company}` : ''}.`)
  } else {
    sentences.push(`Applying for the ${role} role${company ? ` at ${company}` : ''}.`)
  }

  const topSkills = sortSkillsByJob(profile.skills || [], jobDescription).slice(0, 5)
  if (topSkills.length) sentences.push(`Skilled in ${joinWithAnd(topSkills)}.`)

  const project = pickBestProject(profile.projects || [])
  if (project) {
    const firstPoint = textToBullets(project.bullets)[0]
    const tech = project.techStack?.trim() ? ` (${project.techStack.trim()})` : ''
    sentences.push(`Key project: ${project.name.trim()}${tech}.`)
    if (firstPoint) sentences.push(`${firstPoint}.`)
  }

  const internship = (profile.experience || []).find((entry) => entry.jobTitle?.trim())
  if (internship) sentences.push(`Worked as ${internship.jobTitle.trim()}${internship.company?.trim() ? ` at ${internship.company.trim()}` : ''}.`)

  // Neutral closing lines (no new facts) until the summary reaches 40 words
  const closingLines = [
    `Looking to apply these skills to real problems${company ? ` at ${company}` : ''} and keep learning.`,
    'Open to feedback and ready to learn the tools the team uses.',
  ]
  let summary = sentences.join(' ')
  closingLines.forEach((line) => {
    if (countWords(summary) < 40) summary = `${summary} ${line}`
  })

  // Keep it under 80 words
  const words = summary.split(/\s+/)
  return words.length > 80 ? `${words.slice(0, 80).join(' ').replace(/[,:;]$/, '')}.` : summary
}

// Resume → the profile used to write a summary
function profileFromResume(resume) {
  const education = resume.education?.[0] || {}
  return {
    degree: education.degree,
    graduationYear: education.endYear,
    roleTitle: resume.roleTitle,
    companyName: resume.companyName,
    skills: resume.skills,
    projects: resume.projects,
    experience: resume.experience,
  }
}

// ---------- Basic mode: the same answers made by written rules ----------

function basicBullets(text) {
  return { bullets: textToBullets(text) }
}

function basicSummary(profile, jobDescription) {
  return { summary: buildSummary(profile, jobDescription) }
}

function basicImprove(section, content) {
  if (section === 'summary') {
    const cleaned = content
      .replace(/\s+/g, ' ')
      .replace(/\bi am\b/gi, '')
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => capitalise(sentence.trim()))
      .filter(Boolean)
      .join(' ')
    return { value: cleaned, note: 'Summary cleaned up: spacing, capital letters and "I am" removed.' }
  }

  if (section === 'skills') {
    const unique = standardiseSkills(content)
    const changed = unique.length !== content.length || unique.some((name, index) => name !== content[index])
    return { value: unique, note: changed ? 'Skill names standardised and repeats removed.' : 'Skills already look clean.' }
  }

  // experience / projects
  const entries = content.map((entry) => ({ ...entry, bullets: textToBullets(entry.bullets).join('\n') }))
  const withoutNumbers = entries.flatMap((entry) => entry.bullets.split('\n')).filter((line) => line && !/\d/.test(line)).length
  return {
    value: entries,
    note: withoutNumbers ? `Bullets now start with action verbs. ${withoutNumbers} still need a number (%, users, time saved).` : 'Bullets now start with action verbs.',
  }
}

function basicJobInsights(jobDescription) {
  return { jobTitle: guessJobTitle(jobDescription), mustHaveSkills: findSkillsInText(jobDescription), niceToHaveSkills: [], experienceLevel: '', keyPoints: [] }
}

// ---------- First draft from the create form ----------

// Builds the resume right away from what the user typed (the wizard's live preview, the landing demo,
// and basic mode for Generate).
// companyName = the company the user typed ('' if none).
export function buildResumeDraft({ basics, company, role, templateId, jobDescription = '', companyName = company.name }) {
  const skills = sortSkillsByJob(standardiseSkills(basics.skills || []), jobDescription)
  const toEntry = (entry, prefix) => ({ ...entry, id: entry.id || createId(prefix), bullets: textToBullets(entry.bullets).join('\n') })
  const experience = (basics.experience || []).filter((entry) => entry.jobTitle?.trim() || entry.company?.trim()).map((entry) => toEntry(entry, 'exp'))
  const projects = (basics.projects || []).filter((entry) => entry.name?.trim()).map((entry) => toEntry(entry, 'proj'))
  const graduationYear = Number(basics.graduationYear) || ''

  return {
    title: [companyName, role.title].filter(Boolean).join(' – '),
    companyId: company.id,
    companyName,
    roleId: role.id,
    roleTitle: role.title,
    templateId,
    sectionOrder: [...company.sectionOrder],
    personal: {
      fullName: basics.fullName,
      email: basics.email,
      phone: basics.phone,
      location: basics.location,
      linkedin: '',
      portfolio: '',
    },
    summary: buildSummary({ ...basics, roleTitle: role.title, companyName, skills, projects, experience }, jobDescription),
    skills,
    experience,
    education: [
      {
        id: createId('edu'),
        degree: basics.degree,
        institution: basics.institution,
        location: '',
        startYear: graduationYear ? String(graduationYear - 4) : '',
        endYear: graduationYear ? String(graduationYear) : '',
        score: basics.score || '',
      },
    ],
    projects,
    certifications: [],
  }
}

// ---------- The AI functions pages call ----------

// Use basic mode when there was no answer, it was too slow, a limit was reached or the AI is down.
// Other errors (400 wrong input, 401 not logged in) are real problems, so the page shows their message.
function shouldUseBasicMode(error) {
  return !error.status || [429, 500, 502, 503, 504].includes(error.status)
}

// Asks the AI once (never retries). makeBasicAnswer() gives the rule-based answer for basic mode.
async function askAiOrBasic(path, body, makeBasicAnswer) {
  // Logged out (e.g. the landing page demo): basic mode, without calling the server
  if (!getToken()) return { ...makeBasicAnswer(), source: 'basic' }
  try {
    const answer = await apiRequest('POST', path, body, { timeoutMs: AI_TIMEOUT_MS })
    return { ...answer, source: 'ai' }
  } catch (error) {
    if (!shouldUseBasicMode(error)) throw error
    return { ...makeBasicAnswer(), source: 'basic' }
  }
}

// Turns the user's sentences into bullet points → { bullets: [...], source }
export function generateBullets(text, jobDescription = '') {
  return askAiOrBasic('/ai/bullets', { text, jobDescription }, () => basicBullets(text))
}

// A 40–80 word summary from the user's own degree, role, skills and best project → { summary, source }
export function writeSummary(profile, jobDescription = '') {
  return askAiOrBasic('/ai/summary', { profile, jobDescription }, () => basicSummary(profile, jobDescription))
}

// Improves one section without adding facts. content = the section's value (summary text, skills list,
// or experience/project entries) → { value, note, source }; value has the same shape as content
export function improveSection(section, content, jobDescription = '') {
  return askAiOrBasic('/ai/improve', { section, content, jobDescription }, () => basicImprove(section, content))
}

// Rewrites the summary for the resume's (new) job title and the job's skills → { summary, source }
export function tailorSummary(resume, jobDescription) {
  return askAiOrBasic('/ai/tailor-summary', { resume, jobDescription }, () => basicSummary(profileFromResume(resume), jobDescription))
}

// The first draft from the create form → the resume draft plus source
export function generateResume(options) {
  return askAiOrBasic('/ai/generate', { options }, () => buildResumeDraft(options))
}

// What a job description asks for → { jobTitle, mustHaveSkills, niceToHaveSkills, experienceLevel, keyPoints, source }
// In basic mode only the skills (from our skills list) and a guessed job title are found.
export function getJobInsights(jobDescription) {
  return askAiOrBasic('/ai/job-insights', { jobDescription }, () => basicJobInsights(jobDescription))
}
