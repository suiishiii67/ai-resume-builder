// The logged-in user's resumes, stored in MongoDB through the backend (/api/resumes).
// The server only ever returns the user's own resumes, so no userId needs to be sent.
import { apiRequest } from './api'

export async function getResumes() {
  const { resumes } = await apiRequest('GET', '/resumes')
  return resumes
}

export async function getResumeById(resumeId) {
  const { resume } = await apiRequest('GET', `/resumes/${resumeId}`)
  return resume
}

export async function createResume(_userId, resumeData) {
  const { resume } = await apiRequest('POST', '/resumes', resumeData)
  return resume
}

export async function updateResume(resumeId, updates) {
  const { resume } = await apiRequest('PUT', `/resumes/${resumeId}`, updates)
  return resume
}

export async function deleteResume(resumeId) {
  await apiRequest('DELETE', `/resumes/${resumeId}`)
  return true
}

export async function duplicateResume(resumeId) {
  const { resume } = await apiRequest('POST', `/resumes/${resumeId}/duplicate`)
  return resume
}

// Saving a score does not change "last edited". extra = { jobDescription } the resume was checked against.
export async function saveAtsScore(resumeId, score, extra = {}) {
  if (extra.jobDescription) await apiRequest('PUT', `/resumes/${resumeId}`, { jobDescription: extra.jobDescription })
  const { resume } = await apiRequest('PATCH', `/resumes/${resumeId}/ats-score`, { score })
  return resume
}

// Admin only: every user's resumes, with the owner's name and email
export async function getAllResumes() {
  const { resumes } = await apiRequest('GET', '/admin/resumes')
  return resumes
}
