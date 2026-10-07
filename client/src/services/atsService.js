// Runs the ATS check and keeps a record of every check (in the browser for now).
import { calculateAtsScore } from '../utils/atsScore'
import { simulateRequest, createId } from '../utils/mockApi'
import { loadFromStorage, saveToStorage } from '../utils/storage'

const ATS_CHECKS_KEY = 'atsChecks'

export function analyzeResume({ resume, jobDescription }) {
  // TODO (Phase 2): replace mock with real API call to the Express backend
  return simulateRequest(calculateAtsScore(resume, jobDescription), 900)
}

// One record per check. source: 'saved' (a saved resume) or 'quick' (an uploaded resume).
// userId is '' when the user is not logged in.
export function saveAtsCheck({ source, userId = '', resumeId = '', score, jobTitle = '', hasJobDescription }) {
  // TODO (Phase 2): replace mock with real API call to the Express backend
  const record = { id: createId('check'), source, userId, resumeId, score, jobTitle, hasJobDescription, checkedAt: new Date().toISOString() }
  saveToStorage(ATS_CHECKS_KEY, [...loadFromStorage(ATS_CHECKS_KEY, []), record])
  return simulateRequest(record, 100)
}

export function getAtsChecks() {
  // TODO (Phase 2): replace mock with real API call to the Express backend (admin only)
  return simulateRequest(loadFromStorage(ATS_CHECKS_KEY, []), 200)
}
