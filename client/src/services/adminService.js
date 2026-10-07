// Numbers for the admin dashboard (mock).
import { getAllUsers } from './authService'
import { getAllResumes } from './resumeService'
import { getCatalog } from './catalogService'

export async function getAdminStats() {
  // TODO (Phase 2): replace mock with real API call to the Express backend
  const [users, resumes, catalog] = await Promise.all([getAllUsers(), getAllResumes(), getCatalog()])

  const checkedResumes = resumes.filter((resume) => typeof resume.atsScore === 'number')
  const averageAtsScore = checkedResumes.length
    ? Math.round(checkedResumes.reduce((total, resume) => total + resume.atsScore, 0) / checkedResumes.length)
    : null

  const resumesPerCompany = {}
  resumes.forEach((resume) => {
    const companyName = resume.companyName || 'No company yet'
    resumesPerCompany[companyName] = (resumesPerCompany[companyName] || 0) + 1
  })

  return {
    totals: {
      users: users.filter((user) => user.role !== 'admin').length,
      resumes: resumes.length,
      templates: catalog.templates.length,
      companies: catalog.companies.length,
      roles: catalog.roles.length,
    },
    averageAtsScore,
    checkedCount: checkedResumes.length,
    resumesPerCompany,
    recentResumes: [...resumes].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt)).slice(0, 5),
    users,
  }
}
