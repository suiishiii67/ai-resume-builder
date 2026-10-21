// Admin overview (/admin): real statistics from MongoDB, and the list of users.
import { useEffect, useState } from 'react'
import { Ban, CircleCheck, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCatalog } from '../../context/CatalogContext'
import { useToast } from '../../context/ToastContext'
import { getAdminStats, getUsers, toggleBlockUser, deleteUser } from '../../services/adminService'
import { formatDate } from '../../utils/resumeFormat'
import PageHeader from '../../components/PageHeader'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import StatusStamp from '../../components/StatusStamp'
import ConfirmDialog from '../../components/ConfirmDialog'
import StatStrip from '../../components/admin/StatStrip'
import CompanyBarList from '../../components/admin/CompanyBarList'
import DataTable from '../../components/admin/DataTable'

// [{ skill: 'Docker', count: 4 }] → { Docker: 4 }, for the bar lists
const toCounts = (rows, nameKey) => Object.fromEntries(rows.map((row) => [row[nameKey], row.count]))

function AdminDashboardPage() {
  const { user: admin } = useAuth()
  const { companies, roles, templates } = useCatalog()
  const { showToast } = useToast()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loadError, setLoadError] = useState('')
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    Promise.all([getAdminStats(), getUsers()])
      .then(([loadedStats, loadedUsers]) => {
        setStats(loadedStats)
        setUsers(loadedUsers)
      })
      .catch((error) => setLoadError(error.message))
  }, [])

  const handleToggleBlock = async (user) => {
    try {
      const updatedUser = await toggleBlockUser(user.id)
      setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, blocked: updatedUser.blocked } : item)))
      showToast(updatedUser.blocked ? `${user.name} is blocked and can no longer log in.` : `${user.name} is unblocked.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleDelete = async () => {
    const { id, name } = userToDelete
    setUserToDelete(null)
    try {
      await deleteUser(id)
      setUsers((current) => current.filter((item) => item.id !== id))
      setStats(await getAdminStats())
      showToast(`Deleted ${name} and all their resumes.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  if (loadError) return <EmptyState title="Could not load the admin overview" description={loadError} />
  if (!stats) return <PageLoader message="Loading admin overview…" />

  const { totals } = stats
  const statItems = [
    { label: 'Users', value: totals.users },
    { label: 'Resumes', value: totals.resumes },
    { label: 'ATS checks', value: totals.atsChecks },
    { label: 'Companies', value: companies.length, to: '/admin/companies', linkLabel: 'Manage companies' },
    { label: 'Roles', value: roles.length, to: '/admin/roles', linkLabel: 'Manage roles' },
    { label: 'Templates', value: templates.length, to: '/admin/templates', linkLabel: 'Manage templates' },
  ]

  const latestColumns = [
    { key: 'title', label: 'Resume', render: (resume) => <span className="font-semibold">{resume.title}</span> },
    { key: 'ownerName', label: 'User', render: (resume) => resume.ownerName || 'Deleted user' },
    { key: 'updatedAt', label: 'Last edited', render: (resume) => <span className="tabular">{formatDate(resume.updatedAt)}</span> },
  ]

  const userColumns = [
    {
      key: 'name',
      label: 'User',
      render: (user) => (
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-ink-faint">{user.email}</p>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (user) => <span className="capitalize">{user.role}</span> },
    { key: 'resumeCount', label: 'Resumes', render: (user) => <span className="tabular">{user.resumeCount}</span> },
    { key: 'createdAt', label: 'Joined', render: (user) => <span className="tabular">{formatDate(user.createdAt)}</span> },
    { key: 'blocked', label: 'Status', render: (user) => (user.blocked ? <StatusStamp tone="maroon">Blocked</StatusStamp> : <StatusStamp tone="signal">Active</StatusStamp>) },
    {
      key: 'actions',
      label: 'Actions',
      // Admins can't be blocked or deleted here (the server refuses it too)
      render: (user) =>
        user.role === 'admin' || user.id === admin.id ? (
          <span className="text-sm text-ink-faint">–</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleToggleBlock(user)}>
              {user.blocked ? <CircleCheck size={15} aria-hidden="true" /> : <Ban size={15} aria-hidden="true" />} {user.blocked ? 'Unblock' : 'Block'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setUserToDelete(user)} aria-label={`Delete ${user.name}`}>
              <Trash2 size={15} aria-hidden="true" /> Delete
            </Button>
          </div>
        ),
    },
  ]

  return (
    <>
      <PageHeader title="Admin overview" description="Real numbers from the database, the users, and the data that drives company and role customisation." />

      <StatStrip stats={statItems} />

      <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="rounded-lg border border-line bg-paper p-5">
          <h2 className="text-xl font-bold">Resumes per target company</h2>
          <p className="mb-4 text-sm text-ink-faint">
            {stats.checkedResumes} of {totals.resumes} resumes ATS-checked{stats.checkedResumes > 0 && `, average score ${stats.averageAtsScore}`}.
          </p>
          {totals.resumes > 0 ? <CompanyBarList counts={stats.resumesPerCompany} /> : <p className="text-[15px] text-ink-soft">No resumes yet.</p>}
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Latest resumes</h2>
          {stats.latestResumes.length > 0 ? <DataTable caption="Latest resumes" columns={latestColumns} rows={stats.latestResumes} /> : <p className="text-[15px] text-ink-soft">No resumes yet.</p>}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-paper p-5">
          <h2 className="text-xl font-bold">Skills most often missing</h2>
          <p className="mb-4 text-sm text-ink-faint">From {totals.atsChecks} ATS checks ({totals.quickChecks} quick checks of uploaded resumes).</p>
          {stats.topMissingSkills.length > 0 ? <CompanyBarList counts={toCounts(stats.topMissingSkills, 'skill')} label="Skills most often missing" /> : <p className="text-[15px] text-ink-soft">No checks with a job description yet.</p>}
        </section>
        <section className="rounded-lg border border-line bg-paper p-5">
          <h2 className="text-xl font-bold">Jobs people check against</h2>
          <p className="mb-4 text-sm text-ink-faint">The job titles in ATS checks, most common first.</p>
          {stats.topJobTitles.length > 0 ? <CompanyBarList counts={toCounts(stats.topJobTitles, 'jobTitle')} label="Most checked job titles" /> : <p className="text-[15px] text-ink-soft">No checks yet.</p>}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-bold">Users</h2>
        <DataTable caption="Users" columns={userColumns} rows={users} />
      </section>

      {userToDelete && (
        <ConfirmDialog
          title={`Delete ${userToDelete.name}?`}
          message={`This deletes the account and all ${userToDelete.resumeCount} of their resumes and ATS check records. It can't be undone.`}
          confirmLabel="Delete user"
          onConfirm={handleDelete}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </>
  )
}

export default AdminDashboardPage
