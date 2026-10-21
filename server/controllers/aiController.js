// AI writing help: bullets, summary, improve a section, tailor a summary, first draft, job insights.
// Each route checks its input, asks Gemini (services/geminiService.js) with a prompt from prompts/,
// checks the SHAPE of the reply, then returns exactly what the frontend's aiService.js expects.
// Nothing here is saved to the database.
const crypto = require('crypto')
const { askGeminiJSON, AiError } = require('../services/geminiService')
const { standardiseSkills, sortSkillsByJob } = require('../utils/skills')
const bulletsPrompt = require('../prompts/bulletsPrompt')
const summaryPrompt = require('../prompts/summaryPrompt')
const improvePrompt = require('../prompts/improvePrompt')
const generatePrompt = require('../prompts/generatePrompt')
const jobInsightsPrompt = require('../prompts/jobInsightsPrompt')

const MAX_TEXT_LENGTH = 6000
const SECTIONS = ['summary', 'skills', 'experience', 'projects']
const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'projects', 'experience', 'education', 'certifications']

// ---------- Small helpers ----------

const isText = (value) => typeof value === 'string'
const isTextList = (value) => Array.isArray(value) && value.every(isText)
const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)

// True if any text inside the value (also inside objects and lists) is longer than the limit
function hasTooLongText(value) {
  if (isText(value)) return value.length > MAX_TEXT_LENGTH
  if (Array.isArray(value)) return value.some(hasTooLongText)
  if (isObject(value)) return Object.values(value).some(hasTooLongText)
  return false
}

// The job description can be sent as text or as the resume's { text, title, company, skills } object
function jobText(jobDescription) {
  if (isText(jobDescription)) return jobDescription
  if (isObject(jobDescription) && isText(jobDescription.text)) return jobDescription.text
  return ''
}

// "• Built a portal." → "Built a portal"
function cleanBullet(bullet) {
  return bullet.trim().replace(/^[•\-*–·]\s*/, '').replace(/[.;]+$/, '').trim()
}

function cleanBullets(bullets) {
  return bullets.map(cleanBullet).filter(Boolean)
}

// A summary must be one paragraph. If the AI still sent bullet lines, join them into sentences.
function toParagraph(text) {
  const lines = text.split('\n').map(cleanBullet).filter(Boolean)
  if (lines.length <= 1) return text.trim()
  return lines.map((line) => (/[.!?]$/.test(line) ? line : `${line}.`)).join(' ')
}

// Used whenever Gemini's reply is not in the shape we asked for
function unexpectedAnswer() {
  return new AiError(502, 'AI returned an unexpected answer')
}

// Sends a 400 and returns true if the request body has a problem
function rejectBadInput(res, message) {
  res.status(400).json({ message })
  return true
}

function checkCommonInput(req, res) {
  if (hasTooLongText(req.body || {})) {
    return rejectBadInput(res, `Each piece of text must be ${MAX_TEXT_LENGTH} characters or fewer.`)
  }
  return false
}

// Same id style as the editor ("exp-m1x2k3-ab12")
function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`
}

// ---------- The AI tasks (also used by scripts/ai-demo.js) ----------
// Each returns { result, model }: result = what the route sends back, model = which Gemini model answered.

async function writeBullets(text, jobDescription) {
  const { data, model } = await askGeminiJSON(bulletsPrompt(text, jobText(jobDescription)))
  if (!isObject(data) || !isTextList(data.bullets) || data.bullets.length === 0) throw unexpectedAnswer()
  return { result: { bullets: cleanBullets(data.bullets) }, model }
}

async function writeSummary(profile, jobDescription) {
  const { data, model } = await askGeminiJSON(summaryPrompt(profile, jobText(jobDescription)))
  if (!isObject(data) || !isText(data.summary) || !data.summary.trim()) throw unexpectedAnswer()
  return { result: { summary: toParagraph(data.summary) }, model }
}

// Resume → the profile used to write a summary (same as the frontend)
function profileFromResume(resume) {
  const education = (resume.education || [])[0] || {}
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

async function improveSection(section, content, jobDescription) {
  const job = jobText(jobDescription)

  // A skills list needs no AI: standard names, no repeats, the job's skills first. It can't add a skill this way.
  if (section === 'skills') {
    const value = sortSkillsByJob(standardiseSkills(content), job)
    const changed = value.length !== content.length || value.some((name, index) => name !== content[index])
    return { result: { value, note: changed ? 'Skill names standardised, repeats removed and job skills put first.' : 'Skills already look clean.' }, model: 'none (plain code)' }
  }

  if (section === 'summary') {
    const { data, model } = await askGeminiJSON(improvePrompt(section, content, job))
    if (!isObject(data) || !isText(data.value) || !data.value.trim() || !isText(data.note)) throw unexpectedAnswer()
    return { result: { value: toParagraph(data.value), note: data.note.trim() }, model }
  }

  // experience / projects: only the bullets go to the AI, with a little context. Titles, companies and
  // dates stay exactly as the user wrote them because the AI never gets the chance to change them.
  const toImprove = content.filter((entry) => isText(entry.bullets) && entry.bullets.trim())
  if (toImprove.length === 0) return { result: { value: content, note: 'There are no bullet points to improve yet.' }, model: 'none' }

  const forPrompt = toImprove.map((entry) => ({
    id: entry.id,
    context: [entry.jobTitle, entry.company, entry.name, entry.techStack].filter(Boolean).join(' | '),
    bullets: entry.bullets,
  }))
  const { data, model } = await askGeminiJSON(improvePrompt(section, forPrompt, job))
  if (!isObject(data) || !Array.isArray(data.entries) || !isText(data.note)) throw unexpectedAnswer()

  const newBullets = new Map()
  for (const entry of data.entries) {
    if (!isObject(entry) || !isText(entry.id) || !isTextList(entry.bullets)) throw unexpectedAnswer()
    newBullets.set(entry.id, cleanBullets(entry.bullets))
  }
  if (toImprove.some((entry) => !newBullets.has(entry.id))) throw unexpectedAnswer()

  // Same entries, same fields, only "bullets" replaced
  const value = content.map((entry) => (newBullets.has(entry.id) ? { ...entry, bullets: newBullets.get(entry.id).join('\n') } : entry))
  return { result: { value, note: data.note.trim() }, model }
}

// Builds the first draft. Plain code does the structure; ONE Gemini request writes the summary and bullets.
async function generateDraft(options) {
  const { basics, company, role, templateId, jobDescription } = options
  const companyName = isText(options.companyName) ? options.companyName : company.name || ''
  const job = jobText(jobDescription)

  const skills = sortSkillsByJob(standardiseSkills(isTextList(basics.skills) ? basics.skills : []), job)
  const experience = (basics.experience || []).filter((entry) => (entry.jobTitle || '').trim() || (entry.company || '').trim())
  const projects = (basics.projects || []).filter((entry) => (entry.name || '').trim())
  const graduationYear = Number(basics.graduationYear) || ''

  // What the AI sees: the user's own facts, with a key for each project and internship
  const profile = {
    degree: basics.degree,
    graduationYear,
    roleTitle: role.title,
    companyName,
    skills,
    projects: projects.map((entry, index) => ({ key: `p${index}`, name: entry.name, techStack: entry.techStack, description: entry.bullets || '' })),
    experience: experience.map((entry, index) => ({ key: `e${index}`, jobTitle: entry.jobTitle, company: entry.company, description: entry.bullets || '' })),
  }
  const { data, model } = await askGeminiJSON(generatePrompt(profile, job))

  // Check the reply: a summary, and bullets for every key we sent
  if (!isObject(data) || !isText(data.summary) || !data.summary.trim()) throw unexpectedAnswer()
  const bulletsByKey = new Map()
  for (const list of [data.projects || [], data.experience || []]) {
    if (!Array.isArray(list)) throw unexpectedAnswer()
    for (const item of list) {
      if (!isObject(item) || !isText(item.key) || !isTextList(item.bullets)) throw unexpectedAnswer()
      bulletsByKey.set(item.key, cleanBullets(item.bullets).join('\n'))
    }
  }
  const allKeys = [...profile.projects, ...profile.experience].filter((item) => item.description.trim()).map((item) => item.key)
  if (allKeys.some((key) => !bulletsByKey.has(key))) throw unexpectedAnswer()

  const toEntry = (entry, prefix, key) => ({ ...entry, id: entry.id || createId(prefix), bullets: bulletsByKey.get(key) || '' })

  // The same draft shape as buildResumeDraft() in the frontend
  const draft = {
    title: [companyName, role.title].filter(Boolean).join(' – '),
    companyId: company.id || '',
    companyName,
    roleId: role.id || '',
    roleTitle: role.title,
    templateId: templateId || 'classic',
    sectionOrder: isTextList(company.sectionOrder) && company.sectionOrder.length ? [...company.sectionOrder] : DEFAULT_SECTION_ORDER,
    personal: {
      fullName: basics.fullName || '',
      email: basics.email || '',
      phone: basics.phone || '',
      location: basics.location || '',
      linkedin: '',
      portfolio: '',
    },
    summary: toParagraph(data.summary),
    skills,
    experience: experience.map((entry, index) => toEntry(entry, 'exp', `e${index}`)),
    education: [
      {
        id: createId('edu'),
        degree: basics.degree || '',
        institution: basics.institution || '',
        location: '',
        startYear: graduationYear ? String(graduationYear - 4) : '',
        endYear: graduationYear ? String(graduationYear) : '',
        score: basics.score || '',
      },
    ],
    projects: projects.map((entry, index) => toEntry(entry, 'proj', `p${index}`)),
    certifications: [],
  }
  return { result: draft, model }
}

async function readJobDescription(jobDescription) {
  const { data, model } = await askGeminiJSON(jobInsightsPrompt(jobDescription))
  const shapeIsRight = isObject(data) && isText(data.jobTitle) && isTextList(data.mustHaveSkills) &&
    isTextList(data.niceToHaveSkills) && isText(data.experienceLevel) && isTextList(data.keyPoints) && data.keyPoints.length > 0
  if (!shapeIsRight) throw unexpectedAnswer()
  return {
    result: {
      jobTitle: data.jobTitle.trim(),
      mustHaveSkills: data.mustHaveSkills.map((skill) => skill.trim()).filter(Boolean),
      niceToHaveSkills: data.niceToHaveSkills.map((skill) => skill.trim()).filter(Boolean),
      experienceLevel: data.experienceLevel.trim(),
      keyPoints: data.keyPoints.map((point) => point.trim()).filter(Boolean).slice(0, 5),
    },
    model,
  }
}

// ---------- Routes ----------

// POST /api/ai/bullets  { text, jobDescription }  →  { bullets }
async function bullets(req, res) {
  if (checkCommonInput(req, res)) return
  const { text, jobDescription } = req.body || {}
  if (!isText(text) || !text.trim()) return rejectBadInput(res, 'Enter some text to turn into bullet points.')

  const { result } = await writeBullets(text, jobDescription)
  res.json(result)
}

// POST /api/ai/summary  { profile, jobDescription }  →  { summary }
async function summary(req, res) {
  if (checkCommonInput(req, res)) return
  const { profile, jobDescription } = req.body || {}
  if (!isObject(profile)) return rejectBadInput(res, 'profile must be an object.')

  const { result } = await writeSummary(profile, jobDescription)
  res.json(result)
}

// POST /api/ai/improve  { section, content, jobDescription }  →  { value, note }
async function improve(req, res) {
  if (checkCommonInput(req, res)) return
  const { section, content, jobDescription } = req.body || {}
  if (!SECTIONS.includes(section)) return rejectBadInput(res, `section must be one of: ${SECTIONS.join(', ')}.`)

  if (section === 'summary' && (!isText(content) || !content.trim())) return rejectBadInput(res, 'Write a summary first.')
  if (section === 'skills' && !isTextList(content)) return rejectBadInput(res, 'Skills must be a list of names.')
  const entriesAreValid = Array.isArray(content) && content.length <= 20 && content.every((entry) => isObject(entry) && isText(entry.id))
  if ((section === 'experience' || section === 'projects') && !entriesAreValid) {
    return rejectBadInput(res, `${section} must be a list of up to 20 entries, each with an id.`)
  }

  const { result } = await improveSection(section, content, jobDescription)
  res.json(result)
}

// POST /api/ai/tailor-summary  { resume, jobDescription }  →  { summary }
async function tailorSummary(req, res) {
  if (checkCommonInput(req, res)) return
  const { resume, jobDescription } = req.body || {}
  if (!isObject(resume)) return rejectBadInput(res, 'resume must be an object.')
  if (!jobText(jobDescription).trim()) return rejectBadInput(res, 'Paste the job description first.')

  const { result } = await writeSummary(profileFromResume(resume), jobDescription)
  res.json(result)
}

// POST /api/ai/generate  { options }  →  the resume draft
async function generate(req, res) {
  if (checkCommonInput(req, res)) return
  const { options } = req.body || {}
  const optionsAreValid = isObject(options) && isObject(options.basics) && isObject(options.company) &&
    isObject(options.role) && isText(options.role.title)
  if (!optionsAreValid) return rejectBadInput(res, 'options must include basics, company and role (with a title).')
  const { experience = [], projects = [] } = options.basics
  if (!Array.isArray(experience) || !Array.isArray(projects) || experience.length > 20 || projects.length > 20) {
    return rejectBadInput(res, 'Experience and projects must be lists of up to 20 entries.')
  }

  const { result } = await generateDraft(options)
  res.json(result)
}

// POST /api/ai/job-insights  { jobDescription }  →  { jobTitle, mustHaveSkills, niceToHaveSkills, experienceLevel, keyPoints }
async function jobInsights(req, res) {
  if (checkCommonInput(req, res)) return
  const job = jobText((req.body || {}).jobDescription)
  if (!job.trim()) return rejectBadInput(res, 'Paste the job description first.')

  const { result } = await readJobDescription(job)
  res.json(result)
}

module.exports = {
  bullets, summary, improve, tailorSummary, generate, jobInsights,
  writeBullets, // used by scripts/ai-demo.js
}
