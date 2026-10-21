// Fact check: finds the parts of an AI answer that were NOT in the user's own text, so they can be
// highlighted in yellow and checked before the user clicks Accept.
//
// Four kinds of "facts" are checked:
//   1. Numbers:  12, 30%, 800+, 1,200   → new if those digits are not in the original
//   2. Dates:    years (2026) and month-year (May 2026) → new if not in the original
//   3. Skills:   any skill from our skills list (Docker, TypeScript, Power BI) → new if the original
//                doesn't mention that skill (short forms count: "JS" = JavaScript)
//   4. Names:    capitalised words that look like a company or product (Google, Kubernetes)
//      A capitalised word is NOT flagged when it:
//        - is the first word of a bullet or sentence ("Developed", "Built")
//        - is a common action verb or ordinary English word ("The", "Team", "Sales")
//        - is already in the original text, in any letter case ("acme" → "Acme" is fine)
//
// Examples (original → AI text → highlighted):
//   "made a dashboard for 12 stores" → "Built a Power BI dashboard for 12 stores"   → "Power BI" (new skill)
//   "worked on weekly reports"       → "Prepared 5 weekly reports for the team"     → "5" (new number)
//   "helped with data entry"         → "Supported data entry at Google in May 2026" → "Google", "May 2026"
import { ACTION_VERBS } from './atsScore'
import { findSkillsInText, textHasSkill, findListedSkill } from './jobDescription'

const MONTHS = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?'
const MONTH_YEAR_PATTERN = new RegExp(`\\b(?:${MONTHS})\\.?\\s+\\d{4}\\b`, 'g')
const NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?\s?%?\+?/g
// One or more capitalised words in a row: "Google", "Google Cloud", "Node.js".
// A dot only counts inside a word (Node.js), so a full stop ends the name: "Power BI. Experience" is two parts.
const NAME_PATTERN = /\b[A-Z][A-Za-z0-9+#&-]*(?:\.[A-Za-z0-9+#&-]+)*(?:\s+[A-Z][A-Za-z0-9+#&-]*(?:\.[A-Za-z0-9+#&-]+)*)*/g

// Ordinary words that are often capitalised in a resume but are not names
const COMMON_WORDS = new Set([
  ...ACTION_VERBS,
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'with', 'to', 'of', 'in', 'on', 'at', 'by', 'from', 'as', 'into', 'over',
  'is', 'are', 'was', 'were', 'be', 'has', 'have', 'had', 'this', 'that', 'these', 'those', 'their', 'its', 'our', 'all',
  'skilled', 'experienced', 'strong', 'key', 'project', 'projects', 'team', 'teams', 'student', 'students', 'graduate',
  'fresher', 'intern', 'internship', 'developer', 'engineer', 'analyst', 'designer', 'manager', 'role', 'roles',
  'data', 'sales', 'report', 'reports', 'dashboard', 'dashboards', 'web', 'app', 'apps', 'application', 'website',
  'user', 'users', 'customer', 'customers', 'client', 'clients', 'business', 'company', 'computer', 'science',
  'engineering', 'technology', 'information', 'commerce', 'bachelor', 'master', 'degree', 'university', 'college',
  'summary', 'skills', 'experience', 'education', 'certifications', 'certification', 'profile', 'objective',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
])

// "1,200+" → "1200": compare numbers by their digits only, so "30%" and "30 percent" match
const digitsOf = (text) => text.replace(/[^\d.]/g, '').replace(/\.$/, '')

// True if this position is the start of the text, a line (bullet) or a sentence
function startsSentence(text, index) {
  const before = text.slice(0, index).trimEnd()
  return before === '' || /[\n.!?:•-]$/.test(before) || text.slice(0, index).endsWith('\n')
}

// Every place in the text where one of the skill's names appears: [{ start, end }]
function findSkillPositions(text, skillName) {
  const skill = findListedSkill(skillName)
  const names = skill ? [skill.name, ...skill.aliases] : [skillName]
  const positions = []
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(^|[^A-Za-z0-9+#])(${escaped})(?=$|[^A-Za-z0-9+#])`, skill?.caseSensitive ? 'g' : 'gi')
    for (const match of text.matchAll(pattern)) {
      const start = match.index + match[1].length
      positions.push({ start, end: start + match[2].length })
    }
  }
  return positions
}

// The list of new facts in aiText: [{ start, end, text }], sorted and not overlapping
export function findNewFacts(aiText, originalText) {
  const ai = aiText || ''
  const original = originalText || ''
  const originalLower = original.toLowerCase()
  const originalNumbers = new Set((original.match(NUMBER_PATTERN) || []).map(digitsOf))
  const found = []

  // 1. Skills the original never mentions
  for (const skill of findSkillsInText(ai)) {
    if (!textHasSkill(original, skill)) found.push(...findSkillPositions(ai, skill))
  }

  // 2. Month-year dates not in the original
  for (const match of ai.matchAll(MONTH_YEAR_PATTERN)) {
    if (!originalLower.includes(match[0].toLowerCase())) found.push({ start: match.index, end: match.index + match[0].length })
  }

  // 3. Numbers (and years) whose digits are not in the original
  for (const match of ai.matchAll(NUMBER_PATTERN)) {
    const number = match[0].trimEnd()
    if (!originalNumbers.has(digitsOf(number))) found.push({ start: match.index, end: match.index + number.length })
  }

  // 4. Capitalised words that look like names and are not in the original
  for (const match of ai.matchAll(NAME_PATTERN)) {
    let start = match.index
    let words = match[0].split(/\s+/)
    // Skip the first word of a bullet or sentence ("Developed", "Built")
    if (startsSentence(ai, start)) {
      start += words[0].length + (match[0].slice(words[0].length).match(/^\s+/)?.[0].length || 0)
      words = words.slice(1)
    }
    // Keep only words that are not ordinary words, not skills (step 1 checks those, so "JS" = JavaScript)
    // and not already in the original
    const nameWords = words.filter((word) => {
      const plain = word.replace(/[.,;:]+$/, '')
      return plain.length > 1 && !COMMON_WORDS.has(plain.toLowerCase()) && !findListedSkill(plain) && !originalLower.includes(plain.toLowerCase())
    })
    if (nameWords.length === 0) continue
    // Highlight from the first to the last name word
    const first = ai.indexOf(nameWords[0], start)
    const lastWord = nameWords[nameWords.length - 1]
    const last = ai.indexOf(lastWord, first) + lastWord.replace(/[.,;:]+$/, '').length
    found.push({ start: first, end: last })
  }

  // Sort, and merge parts that overlap (e.g. a skill inside a name like "Power BI")
  const merged = []
  for (const part of found.sort((first, second) => first.start - second.start || second.end - first.end)) {
    const previous = merged[merged.length - 1]
    if (previous && part.start <= previous.end) previous.end = Math.max(previous.end, part.end)
    else merged.push({ ...part })
  }
  return merged.map((part) => ({ ...part, text: ai.slice(part.start, part.end) }))
}

// Splits aiText into pieces for display: [{ text, isNew }]
export function splitByNewFacts(aiText, originalText) {
  const ai = aiText || ''
  const pieces = []
  let position = 0
  for (const fact of findNewFacts(ai, originalText)) {
    if (fact.start > position) pieces.push({ text: ai.slice(position, fact.start), isNew: false })
    pieces.push({ text: fact.text, isNew: true })
    position = fact.end
  }
  if (position < ai.length) pieces.push({ text: ai.slice(position), isNew: false })
  return pieces
}

// Every piece of text in a resume (personal details, summary, skills, entries with their dates and years),
// to compare an AI answer with. The job description is left out on purpose: a skill that only the job
// asks for should still be highlighted.
export function resumeToFactText(resume) {
  const texts = []
  const collect = (value) => {
    if (typeof value === 'string' || typeof value === 'number') texts.push(String(value))
    else if (Array.isArray(value)) value.forEach(collect)
    else if (value && typeof value === 'object') Object.values(value).forEach(collect)
  }
  const { personal, summary, skills, experience, education, projects, certifications, roleTitle, companyName } = resume
  collect([personal, summary, skills, experience, education, projects, certifications, roleTitle, companyName])
  return texts.join('\n')
}
