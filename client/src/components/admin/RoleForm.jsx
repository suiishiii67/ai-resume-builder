// Admin form to add or edit a job role.
import { useState } from 'react'
import Modal from '../Modal'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import TextArea from '../TextArea'
import { textToList, listToText } from '../../utils/listText'

const CATEGORY_OPTIONS = ['Engineering', 'Data', 'Design', 'Management', 'Other'].map((category) => ({ value: category, label: category }))

function RoleForm({ role, onSave, onCancel, isSaving }) {
  const [formValues, setFormValues] = useState({
    title: role?.title || '',
    category: role?.category || 'Engineering',
    skillsText: listToText(role?.requiredSkills),
    keywordsText: listToText(role?.keywords),
    sampleSummary: role?.sampleSummary || '',
    bulletsText: (role?.experienceBullets || []).join('\n'),
  })
  const [errors, setErrors] = useState({})

  const handleChange = (event) => setFormValues({ ...formValues, [event.target.name]: event.target.value })

  const handleSubmit = (event) => {
    event.preventDefault()
    const newErrors = {
      title: formValues.title.trim() ? '' : 'Enter the role title.',
      skillsText: textToList(formValues.skillsText).length ? '' : 'Add at least one required skill.',
    }
    setErrors(newErrors)
    if (newErrors.title || newErrors.skillsText) return

    onSave({
      projects: [],
      certifications: [],
      ...role,
      title: formValues.title.trim(),
      category: formValues.category,
      requiredSkills: textToList(formValues.skillsText),
      keywords: textToList(formValues.keywordsText),
      sampleSummary: formValues.sampleSummary.trim(),
      experienceBullets: formValues.bulletsText.split('\n').map((line) => line.trim()).filter(Boolean),
    })
  }

  return (
    <Modal
      title={role ? `Edit ${role.title}` : 'Add role'}
      size="lg"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" form="role-form" loading={isSaving}>Save role</Button>
        </>
      }
    >
      <form id="role-form" noValidate onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input id="role-title" name="title" label="Role title" value={formValues.title} onChange={handleChange} error={errors.title} required />
        <Select id="role-category" name="category" label="Category" value={formValues.category} onChange={handleChange} options={CATEGORY_OPTIONS} />
        <TextArea id="role-skills" name="skillsText" label="Required skills" rows={2} className="sm:col-span-2" hint="Separate with commas. These count most in the match estimate." value={formValues.skillsText} onChange={handleChange} error={errors.skillsText} />
        <TextArea id="role-keywords" name="keywordsText" label="Keywords" rows={2} className="sm:col-span-2" hint="Separate with commas." value={formValues.keywordsText} onChange={handleChange} />
        <TextArea id="role-summary" name="sampleSummary" label="Sample summary" rows={3} className="sm:col-span-2" hint="Write {company} where the company name should go." value={formValues.sampleSummary} onChange={handleChange} />
        <TextArea id="role-bullets" name="bulletsText" label="Sample experience bullet points" rows={4} className="sm:col-span-2" hint="One bullet point per line." value={formValues.bulletsText} onChange={handleChange} />
      </form>
    </Modal>
  )
}

export default RoleForm
