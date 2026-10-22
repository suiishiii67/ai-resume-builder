// Admin form to add or edit a template: its name and design settings, with a live preview.
import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Modal from '../Modal'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import TextArea from '../TextArea'
import SectionOrderEditor from './SectionOrderEditor'
import ResumePreview from '../templates/ResumePreview'
import exampleResume from '../../data/exampleResume'
import { FONT_OPTIONS, HEADING_STYLE_OPTIONS, SPACING_OPTIONS, withDesignDefaults } from '../../data/templateDesign'

const HEX_COLOUR = /^#[0-9a-fA-F]{6}$/

function TemplateForm({ template, onSave, onCancel, isSaving }) {
  const [formValues, setFormValues] = useState({
    name: template?.name || '',
    description: template?.description || '',
    design: withDesignDefaults(template?.design),
  })
  const [errors, setErrors] = useState({})
  const { design } = formValues

  // Typing in a field clears its error
  const handleChange = (event) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: '' })
  }
  const updateDesign = (field, value) => {
    setFormValues({ ...formValues, design: { ...design, [field]: value } })
    setErrors({ ...errors, [field]: '' })
  }
  const handleDesignChange = (event) => updateDesign(event.target.name, event.target.value)

  const handleSubmit = (event) => {
    event.preventDefault()
    const newErrors = {
      name: formValues.name.trim() ? '' : 'Enter the template name.',
      accentColor: HEX_COLOUR.test(design.accentColor) ? '' : 'Use a hex colour like #1e3a8a.',
    }
    setErrors(newErrors)
    if (newErrors.name || newErrors.accentColor) return
    onSave({ ...template, name: formValues.name.trim(), description: formValues.description.trim(), design })
  }

  return (
    <Modal
      title={template ? `Edit ${template.name}` : 'Add template'}
      size="xl"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" form="template-form" loading={isSaving}>Save template</Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <form id="template-form" noValidate onSubmit={handleSubmit} className="grid content-start gap-4">
          <Input id="template-name" name="name" label="Template name" value={formValues.name} onChange={handleChange} error={errors.name} required />
          <TextArea id="template-description" name="description" label="Description" rows={2} value={formValues.description} onChange={handleChange} />

          <p className="flex gap-2.5 rounded-md border border-line bg-ground p-3 text-sm leading-relaxed">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden="true" />
            All templates are single column with real text, no tables and no images, so an ATS can read them.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select id="template-font" name="font" label="Font" value={design.font} onChange={handleDesignChange} options={FONT_OPTIONS} />
            <Input
              id="template-accent"
              name="accentColor"
              label="Accent colour"
              hint="Only for headings and lines. Body text stays black."
              value={design.accentColor}
              onChange={handleDesignChange}
              error={errors.accentColor}
              endAdornment={
                <input
                  type="color"
                  aria-label="Pick the accent colour"
                  value={HEX_COLOUR.test(design.accentColor) ? design.accentColor : '#000000'}
                  onChange={(event) => updateDesign('accentColor', event.target.value)}
                  className="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              }
            />
            <div>
              <Select id="template-heading" name="headingStyle" label="Heading style" value={design.headingStyle} onChange={handleDesignChange} options={HEADING_STYLE_OPTIONS} />
              <p className="mt-1.5 text-sm text-ink-faint">With a line, the name is centred.</p>
            </div>
            <div>
              <Select id="template-spacing" name="spacing" label="Spacing" value={design.spacing} onChange={handleDesignChange} options={SPACING_OPTIONS} />
              <p className="mt-1.5 text-sm text-ink-faint">Compact fits more on one page.</p>
            </div>
          </div>

          <SectionOrderEditor label="Default section order (for new resumes)" value={design.sectionOrder} onChange={(sectionOrder) => updateDesign('sectionOrder', sectionOrder)} />
        </form>

        {/* Live preview: the example resume drawn with the settings above */}
        <div className="md:sticky md:top-0 md:self-start">
          <p className="mb-1.5 text-sm font-semibold">Live preview</p>
          <div className="rounded-md border border-line bg-ground p-3">
            <ResumePreview resume={{ ...exampleResume, sectionOrder: design.sectionOrder }} design={design} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TemplateForm
