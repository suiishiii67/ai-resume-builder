// Admin dashboard: statistics and user management (/api/admin). Only works for the admin.
import { apiRequest } from './api'

// { totals, averageAtsScore, topMissingSkills, topJobTitles, resumesByCreatedVia, resumesPerCompany,
//   checkedResumes, latestResumes }, worked out by MongoDB on the server
export function getAdminStats() {
  return apiRequest('GET', '/admin/stats')
}

// Every user with their number of resumes
export async function getUsers() {
  const { users } = await apiRequest('GET', '/admin/users')
  return users
}

// Blocks the user, or unblocks them if they are already blocked. Returns the updated user.
export async function toggleBlockUser(userId) {
  const { user } = await apiRequest('PATCH', `/admin/users/${userId}/block`)
  return user
}

// Deletes the user with all their resumes and ATS checks
export async function deleteUser(userId) {
  await apiRequest('DELETE', `/admin/users/${userId}`)
  return true
}
