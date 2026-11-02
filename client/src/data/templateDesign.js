// Template design settings: the only ATS-safe choices an admin can make (the server allows the same values).
import { DEFAULT_SECTION_ORDER } from './sections'

export const FONT_OPTIONS = [
  { value: 'serif', label: 'Times New Roman (formal serif)', stack: '"Times New Roman", Times, Tinos, serif' },
  { value: 'sans', label: 'Arial (clean sans-serif)', stack: 'Arial, Helvetica, Arimo, sans-serif' },
  { value: 'calibri', label: 'Calibri (standard office font)', stack: 'Calibri, Carlito, "Segoe UI", Arial, sans-serif' },
]

export const HEADING_STYLE_OPTIONS = [
  { value: 'caps-line', label: 'Capitals with a line' },
  { value: 'bold', label: 'Bold, no line' },
]

export const SPACING_OPTIONS = [
  { value: 'compact', label: 'Compact' },
  { value: 'roomy', label: 'Roomy' },
]

export const DEFAULT_DESIGN = {
  font: 'serif',
  accentColor: '#000000',
  headingStyle: 'caps-line',
  spacing: 'compact',
  sectionOrder: DEFAULT_SECTION_ORDER,
}

// Fills in any missing setting, e.g. for a template saved before design settings existed
export function withDesignDefaults(design) {
  return { ...DEFAULT_DESIGN, ...design }
}

// Template id -> its design settings. A deleted or unknown template uses the defaults.
export function getTemplateDesign(templates, templateId) {
  return withDesignDefaults(templates.find((template) => template.id === templateId)?.design)
}

