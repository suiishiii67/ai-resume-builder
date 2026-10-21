// Admin page to manage job roles (/admin/roles).
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { useToast } from '../../context/ToastContext'
import { saveRole, deleteRole } from '../../services/catalogService'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import ConfirmDialog from '../../components/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import RoleForm from '../../components/admin/RoleForm'

function ManageRolesPage() {
  const { roles, setRoles } = useCatalog()
  const { showToast } = useToast()
  // null = closed, {} = adding, object = editing
  const [editingRole, setEditingRole] = useState(null)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (role) => {
    setIsSaving(true)
    try {
      setRoles(await saveRole(role))
      setEditingRole(null)
      showToast(`Saved ${role.title}.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    const { id, title } = roleToDelete
    setRoleToDelete(null)
    try {
      setRoles(await deleteRole(id))
      showToast(`Deleted ${title}.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const columns = [
    { key: 'title', label: 'Role', render: (role) => <p className="font-semibold">{role.title}</p> },
    { key: 'category', label: 'Category' },
    { key: 'requiredSkills', label: 'Required skills', render: (role) => <span className="text-sm">{role.requiredSkills.join(', ')}</span> },
    { key: 'keywords', label: 'Keywords', render: (role) => <span className="text-sm">{role.keywords.join(', ')}</span> },
  ]

  return (
    <>
      <PageHeader
        title="Manage roles"
        description="Each role's skills and keywords shape the AI draft, the keyword panel and the match estimate."
        actions={<Button onClick={() => setEditingRole({})}><Plus size={18} aria-hidden="true" /> Add role</Button>}
      />
      <DataTable caption="Job roles" columns={columns} rows={roles} onEdit={setEditingRole} onDelete={setRoleToDelete} getRowName={(role) => role.title} />

      {editingRole && <RoleForm role={editingRole.id ? editingRole : null} onSave={handleSave} onCancel={() => setEditingRole(null)} isSaving={isSaving} />}
      {roleToDelete && (
        <ConfirmDialog
          title="Delete this role?"
          message={`${roleToDelete.title} will be removed from the wizard. Existing resumes keep their role name.`}
          confirmLabel="Delete role"
          onConfirm={handleDelete}
          onCancel={() => setRoleToDelete(null)}
        />
      )}
    </>
  )
}

export default ManageRolesPage
