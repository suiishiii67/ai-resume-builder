// Admin page to manage companies (/admin/companies).
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { useToast } from '../../context/ToastContext'
import { saveCompany, deleteCompany } from '../../services/catalogService'
import { SECTION_LABELS } from '../../data/sections'
import PageHeader from '../../components/PageHeader'
import Button from '../../components/Button'
import ConfirmDialog from '../../components/ConfirmDialog'
import DataTable from '../../components/admin/DataTable'
import CompanyForm from '../../components/admin/CompanyForm'

function ManageCompaniesPage() {
  const { companies, setCompanies } = useCatalog()
  const { showToast } = useToast()
  // null = closed, {} = adding, object = editing
  const [editingCompany, setEditingCompany] = useState(null)
  const [companyToDelete, setCompanyToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (company) => {
    setIsSaving(true)
    try {
      setCompanies(await saveCompany(company))
      setEditingCompany(null)
      showToast(`Saved ${company.name}. The wizard and editor now use this profile.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    const { id, name } = companyToDelete
    setCompanyToDelete(null)
    try {
      setCompanies(await deleteCompany(id))
      showToast(`Deleted ${name}.`)
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Company',
      render: (company) => (
        <div>
          <p className="font-semibold">{company.name}</p>
          <p className="text-sm text-ink-faint">{company.type} · {company.industry}</p>
        </div>
      ),
    },
    { key: 'emphasis', label: 'Emphasis', render: (company) => (company.emphasis === 'projects' ? 'Projects' : 'Experience') },
    { key: 'sectionOrder', label: 'Section order', render: (company) => <span className="text-sm">{company.sectionOrder.map((key) => SECTION_LABELS[key]).join(' → ')}</span> },
    { key: 'keywords', label: 'Keywords', render: (company) => <span className="text-sm">{company.keywords.join(', ')}</span> },
  ]

  return (
    <>
      <PageHeader
        title="Manage companies"
        description="Company profiles decide the recommended template, section order, emphasis and keywords."
        actions={<Button onClick={() => setEditingCompany({})}><Plus size={18} aria-hidden="true" /> Add company</Button>}
      />
      <DataTable caption="Companies" columns={columns} rows={companies} onEdit={setEditingCompany} onDelete={setCompanyToDelete} getRowName={(company) => company.name} />

      {editingCompany && (
        <CompanyForm company={editingCompany.id ? editingCompany : null} onSave={handleSave} onCancel={() => setEditingCompany(null)} isSaving={isSaving} />
      )}
      {companyToDelete && (
        <ConfirmDialog
          title="Delete this company?"
          message={`${companyToDelete.name} will be removed from the wizard. Existing resumes keep their target name but fall back to a general format.`}
          confirmLabel="Delete company"
          onConfirm={handleDelete}
          onCancel={() => setCompanyToDelete(null)}
        />
      )}
    </>
  )
}

export default ManageCompaniesPage
