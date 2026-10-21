// Admin form to add or edit a company.
import { useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import TextArea from '../TextArea'
import SectionOrderEditor from './SectionOrderEditor'
import { DEFAULT_SECTION_ORDER } from '../../data/sections'
import { textToList, listToText } from '../../utils/listText'

const COMPANY_TYPES = ['Product-based', 'Service-based', 'Startup', 'Consulting', 'Finance', 'Other'].map((type) => ({ value: type, label: type }))
const EMPHASIS_OPTIONS = [
  { value: 'projects', label: 'Projects before experience' },
  { value: 'experience', label: 'Experience before projects' },
]

function CompanyForm({ company, templates, onSave, onCancel, isSaving }) {
  // Lists are edited as comma-separated text
  const [formValues, setFormValues] = useState({
    name: company?.name || '',
    type: company?.type || 'Product-based',
    industry: company?.industry || '',
    location: company?.location || '',
    preferredTemplate: company?.preferredTemplate || templates[0]?.id,
    emphasis: company?.emphasis || 'projects',
    sectionOrder: company?.sectionOrder || DEFAULT_SECTION_ORDER,
    keywordsText: listToText(company?.keywords),
    focus: company?.focus || '',
    summaryLine: company?.summaryLine || '',
  })
  const [nameError, setNameError] = useState('')

  const handleChange = (event) => setFormValues({ ...formValues, [event.target.name]: event.target.value })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formValues.name.trim()) {
      setNameError('Enter the company name.')
      return
    }
    const { keywordsText, ...rest } = formValues
    onSave({ ...company, ...rest, name: rest.name.trim(), keywords: textToList(keywordsText) })
  }

  return (
    <Modal
      title={company ? `Edit ${company.name}` : 'Add company'}
      size="lg"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" form="company-form" loading={isSaving}>Save company</Button>
        </>
      }
    >
      <form id="company-form" noValidate onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input id="company-name" name="name" label="Company name" value={formValues.name} onChange={handleChange} error={nameError} required />
        <Select id="company-type" name="type" label="Company type" value={formValues.type} onChange={handleChange} options={COMPANY_TYPES} />
        <Input id="company-industry" name="industry" label="Industry" value={formValues.industry} onChange={handleChange} />
        <Input id="company-location" name="location" label="Location" value={formValues.location} onChange={handleChange} />
        <Select id="company-template" name="preferredTemplate" label="Preferred template" value={formValues.preferredTemplate} onChange={handleChange} options={templates.map((template) => ({ value: template.id, label: template.name }))} />
        <Select id="company-emphasis" name="emphasis" label="Emphasis" value={formValues.emphasis} onChange={handleChange} options={EMPHASIS_OPTIONS} />
        <div className="sm:col-span-2">
          <SectionOrderEditor value={formValues.sectionOrder} onChange={(sectionOrder) => setFormValues({ ...formValues, sectionOrder })} />
        </div>
        <TextArea id="company-keywords" name="keywordsText" label="Keywords" rows={2} className="sm:col-span-2" hint="Separate with commas. Used by the keyword panel and the ATS check." value={formValues.keywordsText} onChange={handleChange} />
        <TextArea id="company-focus" name="focus" label="What they look for" rows={2} className="sm:col-span-2" value={formValues.focus} onChange={handleChange} />
        <TextArea id="company-summary-line" name="summaryLine" label="Sentence AI adds to the summary" rows={2} className="sm:col-span-2" value={formValues.summaryLine} onChange={handleChange} />
      </form>
    </Modal>
  )
}

export default CompanyForm
