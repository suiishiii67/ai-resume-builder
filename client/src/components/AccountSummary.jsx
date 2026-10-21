// Profile page card: photo placeholder, name, email and resume stats.
import { Camera } from 'lucide-react'
import { formatDate } from '../utils/resumeFormat'

function AccountSummary({ user, resumes }) {
  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const checkedResumes = resumes.filter((resume) => typeof resume.atsScore === 'number')
  const averageScore = checkedResumes.length ? Math.round(checkedResumes.reduce((total, resume) => total + resume.atsScore, 0) / checkedResumes.length) : null

  const stats = [
    { label: 'Resumes', value: resumes.length },
    { label: 'ATS checked', value: checkedResumes.length },
    { label: 'Average match estimate', value: averageScore ?? '–' },
  ]

  return (
    <section aria-label="Account summary" className="rounded-lg border border-line bg-paper p-5">
      <div className="flex items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-board font-board text-3xl font-bold" aria-hidden="true">
          {initials}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{user.name}</h2>
          <p className="truncate text-[15px] text-ink-soft">{user.email}</p>
          <p className="mt-0.5 text-sm text-ink-faint">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* TODO (Phase 2): replace mock with real API call to the Express backend (photo upload) */}
      <button type="button" disabled className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3 text-sm font-semibold text-ink-faint" title="Photo upload is planned for Phase 2">
        <Camera size={16} aria-hidden="true" /> Upload photo (Phase 2)
      </button>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-sm text-ink-faint">{stat.label}</dt>
            <dd className="font-board tabular text-3xl font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default AccountSummary
