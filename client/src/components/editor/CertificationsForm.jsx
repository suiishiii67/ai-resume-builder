// Editor form for certifications.
import EntryListEditor from './EntryListEditor'
import { createId } from '../../utils/mockApi'

const CERTIFICATION_FIELDS = [
  { name: 'name', label: 'Certification', wide: true },
  { name: 'issuer', label: 'Issued by', placeholder: 'e.g. NPTEL' },
  { name: 'year', label: 'Year', placeholder: 'e.g. 2025', inputMode: 'numeric' },
]

function CertificationsForm({ value, onChange, showErrors }) {
  return (
    <EntryListEditor
      sectionKey="certifications"
      showErrors={showErrors}
      entries={value}
      onChange={onChange}
      fields={CERTIFICATION_FIELDS}
      entryName="certification"
      getEntryTitle={(entry) => entry.name}
      createEmptyEntry={() => ({ id: createId('cert'), name: '', issuer: '', year: '' })}
    />
  )
}

export default CertificationsForm
