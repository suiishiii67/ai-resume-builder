// Pop-up to change a resume's target company and role.
import { useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import Autocomplete from '../Autocomplete'
import { validateRequiredFields, hasErrors } from '../../utils/validation'
import { resolveCompany, resolveRole } from '../../utils/targetProfile'

function RetargetDialog({ companies, roles, currentTarget, onApply, onClose }) {
  const [target, setTarget] = useState(currentTarget)
  const [useCompanyOrder, setUseCompanyOrder] = useState(true)
  const [errors, setErrors] = useState({})

  const handleApply = () => {
    const targetErrors = validateRequiredFields(target, { companyName: 'a target company', roleTitle: 'a job role' })
    setErrors(targetErrors)
    if (hasErrors(targetErrors)) return

    const company = resolveCompany(companies, target.companyId, target.companyName)
    const role = resolveRole(roles, target.roleId, target.roleTitle)
    onApply({
      companyId: company.id,
      companyName: company.name,
      roleId: role.id,
      roleTitle: role.title,
      title: `${company.name} – ${role.title}`,
      ...(useCompanyOrder && { sectionOrder: [...company.sectionOrder] }),
    })
  }

  return (
    <Modal
      title="Change target"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply new target</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Autocomplete
          id="retarget-company"
          label="Target company"
          required
          listPosition="inline"
          value={target.companyName}
          options={companies.map((company) => ({ id: company.id, label: company.name, meta: company.type }))}
          hint="Pick a company from the list or type any other."
          error={errors.companyName}
          onTextChange={(text) => setTarget({ ...target, companyName: text, companyId: '' })}
          onSelect={(option) => setTarget({ ...target, companyName: option.label, companyId: option.id })}
        />
        <Autocomplete
          id="retarget-role"
          label="Job role"
          required
          listPosition="inline"
          value={target.roleTitle}
          options={roles.map((role) => ({ id: role.id, label: role.title, meta: role.category }))}
          hint="Pick a role or type your own."
          error={errors.roleTitle}
          onTextChange={(text) => setTarget({ ...target, roleTitle: text, roleId: '' })}
          onSelect={(option) => setTarget({ ...target, roleTitle: option.label, roleId: option.id })}
        />
        <label className="flex items-start gap-2.5 text-[15px]">
          <input type="checkbox" checked={useCompanyOrder} onChange={(event) => setUseCompanyOrder(event.target.checked)} className="mt-1 size-4" />
          Also use this company’s recommended section order
        </label>
        <p className="text-sm text-ink-faint">Your content stays the same. Then use the keyword panel and Improve with AI to tailor it.</p>
      </div>
    </Modal>
  )
}

export default RetargetDialog
