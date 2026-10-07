// Editor form for education.
import EntryListEditor from './EntryListEditor'
import { createId } from '../../utils/mockApi'

const EDUCATION_FIELDS = [
  { name: 'degree', label: 'Degree', wide: true },
  { name: 'institution', label: 'College / university' },
  { name: 'location', label: 'City' },
  { name: 'startYear', label: 'Start year', placeholder: 'e.g. 2023', inputMode: 'numeric' },
  { name: 'endYear', label: 'End year', placeholder: 'e.g. 2027', inputMode: 'numeric' },
  { name: 'score', label: 'CGPA or percentage', placeholder: 'e.g. CGPA 8.6 / 10 or 78%', wide: true },
]

function EducationForm({ value, onChange, showErrors }) {
  return (
    <EntryListEditor
      sectionKey="education"
      showErrors={showErrors}
      entries={value}
      onChange={onChange}
      fields={EDUCATION_FIELDS}
      entryName="education"
      getEntryTitle={(entry) => entry.degree}
      createEmptyEntry={() => ({ id: createId('edu'), degree: '', institution: '', location: '', startYear: '', endYear: '', score: '' })}
    />
  )
}

export default EducationForm
