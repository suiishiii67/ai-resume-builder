// Reads a resume file (PDF or Word) and turns its text into resume fields with simple rules.
import { createId } from './mockApi'
import { DEFAULT_SECTION_ORDER } from '../data/sections'

export const MAX_FILE_SIZE_MB = 5
// Less text than this means the file is probably a scanned image
export const MIN_TEXT_LENGTH = 50

// ---------- Step 1: read the text from the file ----------

// The libraries are loaded only when needed, so other pages stay fast
async function readPdfText(file) {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  const pageTexts = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    let pageText = ''
    let lastY = null
    content.items.forEach((item) => {
      const y = item.transform[5]
      // A new line starts when the text moves down the page
      if (lastY !== null && Math.abs(y - lastY) > 2 && !pageText.endsWith('\n')) pageText += '\n'
      pageText += item.str
      if (item.hasEOL) pageText += '\n'
      lastY = y
    })
    pageTexts.push(pageText)
  }
  return pageTexts.join('\n')
}

async function readWordText(file) {
  const { default: mammoth } = await import('mammoth/mammoth.browser')
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return result.value
}

// Returns the file's text, or throws an Error with a message for the user
export async function readResumeFile(file) {
  const name = file.name.toLowerCase()
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) throw new Error(`The file is too big. Use a file under ${MAX_FILE_SIZE_MB} MB.`)
  if (name.endsWith('.doc')) throw new Error('Old .doc files are not supported. Save it as .docx or PDF and try again.')
  if (!name.endsWith('.pdf') && !name.endsWith('.docx')) throw new Error('Choose a PDF (.pdf) or Word (.docx) file.')

  try {
    return name.endsWith('.pdf') ? await readPdfText(file) : await readWordText(file)
  } catch {
    throw new Error('This file could not be read. It may be damaged or password-protected.')
  }
}

// ---------- Step 2: turn the text into resume fields ----------

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const PHONE_PATTERN = /(?:\+?\d{1,3}[\s-]?)?\d{5}[\s-]?\d{5}|(?:\+?\d{1,3}[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{4}/
const LINKEDIN_PATTERN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i
const PORTFOLIO_PATTERN = /(?:https?:\/\/)?(?:www\.)?(?:github\.com|gitlab\.com)\/[A-Za-z0-9_-]+/i
const BULLET_PATTERN = /^[•\-*▪●◦–·]\s*/
const YEAR_PATTERN = /\b(19|20)\d{2}\b/g
// "May 2026 – Jul 2026", "2023 - Present", "05/2024 to 08/2024"
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s+'
const DATE_RANGE_PATTERN = new RegExp(`((?:${MONTH})?(?:\\d{1,2}\\/)?(?:19|20)\\d{2})\\s*(?:-|–|—|to)\\s*((?:${MONTH})?(?:\\d{1,2}\\/)?(?:19|20)\\d{2}|present|current|now)`, 'i')
const SCORE_PATTERN = /(?:cgpa|gpa|sgpa|cpi)\s*:?\s*\d{1,2}(?:\.\d{1,2})?(?:\s*\/\s*\d{1,2})?|\d{1,2}(?:\.\d{1,2})?\s*\/\s*10|\d{2}(?:\.\d{1,2})?\s*%/i
const DEGREE_PATTERN = /\b(b\.?\s?e|b\.?\s?tech|m\.?\s?tech|m\.?\s?e|b\.?\s?sc|m\.?\s?sc|bca|mca|bba|mba|b\.?\s?com|m\.?\s?com|ph\.?d|diploma|bachelor|master|hsc|ssc|12th|10th|class\s+(x|xii|10|12))\b/i

// Heading words for each section (matched at the start of a short line)
const SECTION_HEADINGS = {
  summary: ['summary', 'professional summary', 'objective', 'career objective', 'profile', 'about me'],
  skills: ['skills', 'technical skills', 'key skills', 'core skills', 'core competencies', 'technologies', 'tech stack'],
  experience: ['experience', 'work experience', 'professional experience', 'internship', 'internships', 'employment', 'work history'],
  projects: ['projects', 'academic projects', 'personal projects', 'key projects'],
  education: ['education', 'academic details', 'academics', 'qualifications', 'educational qualification'],
  certifications: ['certifications', 'certification', 'certificates', 'courses', 'licenses'],
}

// Returns the section key if the line is a heading, else ''
function findHeading(line) {
  const text = line.toLowerCase().replace(/[:\-–|]+$/, '').trim()
  if (text.length > 35 || text.split(/\s+/).length > 4) return ''
  const match = Object.entries(SECTION_HEADINGS).find(([, words]) => words.some((word) => text === word || text.startsWith(`${word} `) || text.endsWith(` ${word}`)))
  return match ? match[0] : ''
}

const isBullet = (line) => BULLET_PATTERN.test(line)
const stripBullet = (line) => line.replace(BULLET_PATTERN, '').trim()

// Splits "Frontend Intern – Nimbus Labs" or "Frontend Intern at Nimbus Labs" into two parts
function splitTitleLine(line) {
  const parts = line.split(/\s+(?:-|–|—|\||at|@)\s+/)
  return [parts[0]?.trim() || '', parts.slice(1).join(' ').trim()]
}

// Takes a date range out of a line: { dates: { start, end }, rest }
function takeDates(line) {
  const match = line.match(DATE_RANGE_PATTERN)
  if (!match) return { dates: null, rest: line }
  const end = /present|current|now/i.test(match[2]) ? 'Present' : match[2]
  const rest = line.replace(match[0], '').replace(/[\s|,()–-]+$/, '').replace(/^[\s|,()–-]+/, '').trim()
  return { dates: { start: match[1].trim(), end: end.trim() }, rest }
}

// Groups lines into entries: a plain line after bullet points starts a new entry
function groupEntries(lines) {
  const entries = []
  let current = null
  lines.forEach((line) => {
    if (isBullet(line)) {
      if (!current) current = { header: [], bullets: [] }
      current.bullets.push(stripBullet(line))
    } else if (!current || current.bullets.length > 0) {
      if (current) entries.push(current)
      current = { header: [line], bullets: [] }
    } else {
      current.header.push(line)
    }
  })
  if (current) entries.push(current)
  return entries
}

function parseExperience(lines) {
  return groupEntries(lines).map(({ header, bullets }) => {
    let dates = null
    const headerLines = header
      .map((line) => {
        const result = takeDates(line)
        dates = dates || result.dates
        return result.rest
      })
      .filter(Boolean)
    const [jobTitle, companyFromTitle] = splitTitleLine(headerLines[0] || '')
    return {
      id: createId('exp'),
      jobTitle,
      company: companyFromTitle || headerLines[1] || '',
      location: '',
      startDate: dates?.start || '',
      endDate: dates?.end || '',
      bullets: bullets.join('\n'),
    }
  })
}

function parseProjects(lines) {
  return groupEntries(lines).map(({ header, bullets }) => {
    const headerLines = header.map((line) => takeDates(line).rest).filter(Boolean)
    const [name, techFromTitle] = splitTitleLine(headerLines[0] || '')
    const linkLine = [...headerLines, ...bullets].find((line) => /(github\.com|https?:\/\/)/i.test(line))
    return {
      id: createId('proj'),
      name,
      techStack: techFromTitle.replace(/^(tech(nologies)?|stack)\s*:\s*/i, ''),
      link: linkLine ? linkLine.match(/(?:https?:\/\/)?[\w.-]+\.\w+\/\S+/)?.[0] || '' : '',
      // A second header line is usually a description, so keep it as a bullet
      bullets: [...headerLines.slice(1).filter((line) => line !== linkLine), ...bullets.filter((line) => line !== linkLine)].join('\n'),
    }
  })
}

// A new education entry starts at each line that names a degree
function parseEducation(lines) {
  const entries = []
  lines.map(stripBullet).forEach((line) => {
    if (DEGREE_PATTERN.test(line) || entries.length === 0) entries.push([])
    entries[entries.length - 1].push(line)
  })
  return entries.map((entryLines) => {
    const text = entryLines.join(' ')
    const years = text.match(YEAR_PATTERN) || []
    const degreeLine = entryLines.find((line) => DEGREE_PATTERN.test(line)) || entryLines[0]
    const institutionLine = entryLines.find((line) => line !== degreeLine && /college|university|institute|school|vidyalaya|academy|iit|nit/i.test(line)) || entryLines.find((line) => line !== degreeLine) || ''
    const clean = (line) => line.replace(DATE_RANGE_PATTERN, '').replace(SCORE_PATTERN, '').replace(YEAR_PATTERN, '').replace(/[\s|,()–-]+$/, '').trim()
    return {
      id: createId('edu'),
      degree: clean(degreeLine),
      institution: clean(institutionLine),
      location: '',
      startYear: years.length > 1 ? years[0] : '',
      endYear: years[years.length - 1] || '',
      score: text.match(SCORE_PATTERN)?.[0] || '',
    }
  })
}

function parseCertifications(lines) {
  return lines.map(stripBullet).map((line) => {
    const year = line.match(YEAR_PATTERN)?.[0] || ''
    const [name, issuer] = splitTitleLine(line.replace(year, '').replace(/[\s|,()–-]+$/, '').trim())
    return { id: createId('cert'), name, issuer, year }
  })
}

// "Languages: Java, Python | Tools: Git" → ['Java', 'Python', 'Git']
function parseSkills(lines) {
  const skills = lines
    .map((line) => stripBullet(line).replace(/^[A-Za-z /&]{2,30}:\s*/, ''))
    .flatMap((line) => line.split(/[,|;•]/))
    .map((skill) => skill.trim().replace(/\.$/, ''))
    .filter((skill) => skill && skill.length <= 40)
  return [...new Set(skills)]
}

// Name = first line at the top (the part before any | or •), if it looks like a name
function findName(topLines) {
  const candidates = topLines.map((line) => line.split(/\s*[|•]\s*/)[0].trim())
  return candidates.find((part) => /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(part) && part.split(/\s+/).length <= 5) || ''
}

// Returns a resume object (same shape as the editor uses)
export function parseResumeText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  // Put each line under the heading above it
  const sections = { top: [], summary: [], skills: [], experience: [], projects: [], education: [], certifications: [] }
  let currentSection = 'top'
  lines.forEach((line) => {
    const heading = findHeading(line)
    if (heading) currentSection = heading
    else sections[currentSection].push(line)
  })

  const fullText = lines.join('\n')
  return {
    templateId: 'classic',
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    personal: {
      fullName: findName(sections.top.slice(0, 3)),
      email: fullText.match(EMAIL_PATTERN)?.[0] || '',
      phone: fullText.match(PHONE_PATTERN)?.[0]?.trim() || '',
      location: '',
      linkedin: fullText.match(LINKEDIN_PATTERN)?.[0] || '',
      portfolio: fullText.match(PORTFOLIO_PATTERN)?.[0] || '',
    },
    summary: sections.summary.map(stripBullet).join(' '),
    skills: parseSkills(sections.skills),
    experience: parseExperience(sections.experience),
    projects: parseProjects(sections.projects),
    education: parseEducation(sections.education),
    certifications: parseCertifications(sections.certifications),
  }
}

// How much was found, for the review screen
export function countImportedFields(resume) {
  return {
    skills: resume.skills.length,
    experience: resume.experience.length,
    projects: resume.projects.length,
    education: resume.education.length,
    certifications: resume.certifications.length,
  }
}

// An empty resume, used by "Start blank"
export function createBlankResume() {
  return {
    templateId: 'classic',
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
    summary: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
  }
}
