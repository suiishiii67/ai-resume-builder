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
import { FONT_OPTIONS, HEADING_STYLE_OPTIONS, SPACING_OPTIONS, withDesignDefaults } from '../../data/templateDesign'

function ManageTemplatesPage() {
  const { templates, setTemplates } = useCatalog()
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

  const getLabel = (options, value) => options.find((option) => option.value === value)?.label.split(' (')[0] || value

  const columns = [
    { key: 'name', label: 'Template', render: (template) => <div><p className="font-semibold">{template.name}</p><p className="max-w-xs text-sm text-ink-faint">{template.description}</p></div> },
    { key: 'design', label: 'Design', render: (template) => <DesignSummary design={withDesignDefaults(template.design)} getLabel={getLabel} /> },
  ]

  return (
    <>
      <PageHeader
        title="Manage templates"
        description="Each template is a set of ATS-safe design settings: font, accent colour, heading style, spacing and section order."
        actions={<Button onClick={() => setEditingTemplate({})}><Plus size={18} aria-hidden="true" /> Add template</Button>}
      />
      <DataTable caption="Templates" columns={columns} rows={templates} onEdit={setEditingTemplate} onDelete={handleDeleteRequest} getRowName={(template) => template.name} />

      {editingTemplate && <TemplateForm template={editingTemplate.id ? editingTemplate : null} onSave={handleSave} onCancel={() => setEditingTemplate(null)} isSaving={isSaving} />}
      {templateToDelete && (
        <ConfirmDialog
          title="Delete this template?"
          message={`The ${templateToDelete.name} template will disappear from the gallery and wizard. Resumes using it switch to the default design.`}
          confirmLabel="Delete template"
          onConfirm={handleDelete}
          onCancel={() => setTemplateToDelete(null)}
        />
      )}
    </>
  )
}

// Font, accent colour swatch, heading style and spacing in one cell
function DesignSummary({ design, getLabel }) {
  return (
    <div className="text-sm">
      <p className="flex items-center gap-2">
        <span className="inline-block size-3.5 rounded-sm border border-line-strong" style={{ backgroundColor: design.accentColor }} aria-hidden="true" />
        {getLabel(FONT_OPTIONS, design.font)} · {design.accentColor}
      </p>
      <p className="text-ink-faint">{getLabel(HEADING_STYLE_OPTIONS, design.headingStyle)} · {getLabel(SPACING_OPTIONS, design.spacing)}</p>
    </div>
  )
}

export default ManageTemplatesPage
