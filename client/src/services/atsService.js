// The ATS check. The score is worked out in the browser (instant, and the editor shows it live);
// the server keeps a record of each check, with only the result, never the resume text.
import { calculateAtsScore } from '../utils/atsScore'
import { apiRequest } from './api'

export async function analyzeResume({ resume, jobDescription }) {
  return calculateAtsScore(resume, jobDescription)
}

// One record per check. source: 'saved' (a saved resume) or 'quick' (an uploaded resume, works logged out).
// Without login, quick checks are limited per hour, so a failed save never stops the user seeing their report.
export async function saveAtsCheck({ source, resumeId = '', score, jobTitle = '', hasJobDescription, missingSkills = [] }) {
  try {
    const { check } = await apiRequest('POST', '/ats/checks', {
      source,
      resumeId: source === 'saved' ? resumeId : undefined,
      score,
      jobTitle: jobTitle.slice(0, 120),
      hasJobDescription,
      missingSkills: missingSkills.slice(0, 50),
    })
    return check
  } catch {
    return null
  }
}

// Admin only: the latest checks
export async function getAtsChecks() {
  const { checks } = await apiRequest('GET', '/admin/ats-checks')
  return checks
}
