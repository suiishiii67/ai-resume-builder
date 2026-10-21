// Admin page to manage templates (/admin/templates).
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { useToast } from '../../context/ToastContext'
import { saveTemplate, deleteTemplate } from '../../services/catalogService'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import ConfirmDialog from '../../components/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import TemplateForm from '../../components/admin/TemplateForm'

function ManageTemplatesPage() {
  const { templates, roles, setTemplates } = useCatalog()
  const { showToast } = useToast()
  // null = closed, {} = adding, object = editing
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateToDelete, setTemplateToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (template) => {
    setIsSaving(true)
    try {
      setTemplates(await saveTemplate(template))
      setEditingTemplate(null)
      showToast(`Saved the ${template.name} template.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
    setIsSaving(false)
  }

  const handleDeleteRequest = (template) => {
    if (templates.length === 1) {
      showToast('Keep at least one template, so users can still build resumes.', 'error')
      return
    }
    setTemplateToDelete(template)
  }

  const handleDelete = async () => {
    const { id, name } = templateToDelete
    setTemplateToDelete(null)
    try {
      setTemplates(await deleteTemplate(id))
      showToast(`Deleted the ${name} template.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const getRoleTitles = (roleIds) => roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.title).filter(Boolean).join(', ')

  const columns = [
    { key: 'name', label: 'Template', render: (template) => <div><p className="font-semibold">{template.name}</p><p className="max-w-xs text-sm text-ink-faint">{template.description}</p></div> },
    { key: 'layout', label: 'Layout', render: (template) => <span className="capitalize">{template.layout}</span> },
    { key: 'companyTypes', label: 'Company types', render: (template) => <span className="text-sm">{template.companyTypes.join(', ')}</span> },
    { key: 'roles', label: 'Roles', render: (template) => <span className="text-sm">{getRoleTitles(template.roles) || '–'}</span> },
  ]

  return (
    <>
      <PageHeader
        title="Manage templates"
        description="Templates reuse one of the three ATS-safe layouts and say which companies and roles they suit."
        actions={<Button onClick={() => setEditingTemplate({})}><Plus size={18} aria-hidden="true" /> Add template</Button>}
      />
      <DataTable caption="Templates" columns={columns} rows={templates} onEdit={setEditingTemplate} onDelete={handleDeleteRequest} getRowName={(template) => template.name} />

      {editingTemplate && <TemplateForm template={editingTemplate.id ? editingTemplate : null} roles={roles} onSave={handleSave} onCancel={() => setEditingTemplate(null)} isSaving={isSaving} />}
      {templateToDelete && (
        <ConfirmDialog
          title="Delete this template?"
          message={`The ${templateToDelete.name} template will disappear from the gallery and wizard. Resumes using it switch to the Classic layout.`}
          confirmLabel="Delete template"
          onConfirm={handleDelete}
          onCancel={() => setTemplateToDelete(null)}
        />
      )}
    </>
  )
}

export default ManageTemplatesPage
