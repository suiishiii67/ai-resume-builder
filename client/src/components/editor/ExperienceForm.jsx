// Editor form for work experience.
import EntryListEditor from './EntryListEditor'
import { createId } from '../../utils/mockApi'

const EXPERIENCE_FIELDS = [
  { name: 'jobTitle', label: 'Job title' },
  { name: 'company', label: 'Company' },
  { name: 'startDate', label: 'Start', placeholder: 'e.g. May 2026' },
  { name: 'endDate', label: 'End', placeholder: 'e.g. Jul 2026 or Present' },
  { name: 'location', label: 'Location', placeholder: 'e.g. Remote', wide: true },
  { name: 'bullets', label: 'What you did', type: 'textarea', hint: 'One achievement per line. Start with a verb and add a number where you can.' },
]

function ExperienceForm({ value, onChange, showErrors }) {
  return (
    <EntryListEditor
      sectionKey="experience"
      showErrors={showErrors}
      entries={value}
      onChange={onChange}
      fields={EXPERIENCE_FIELDS}
      entryName="experience"
      getEntryTitle={(entry) => [entry.jobTitle, entry.company].filter(Boolean).join(' · ')}
      createEmptyEntry={() => ({ id: createId('exp'), jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: '' })}
    />
  )
}

export default ExperienceForm
