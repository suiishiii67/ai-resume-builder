// Editor form for projects.
import EntryListEditor from './EntryListEditor'
import { createId } from '../../utils/mockApi'

const PROJECT_FIELDS = [
  { name: 'name', label: 'Project name' },
  { name: 'techStack', label: 'Tech stack', placeholder: 'e.g. React, Node.js, MongoDB' },
  { name: 'link', label: 'Link', placeholder: 'github.com/you/project', wide: true },
  { name: 'bullets', label: 'What you built', type: 'textarea', hint: 'One point per line: what it does, your part, and the result.' },
]

function ProjectsForm({ value, onChange, showErrors }) {
  return (
    <EntryListEditor
      sectionKey="projects"
      showErrors={showErrors}
      entries={value}
      onChange={onChange}
      fields={PROJECT_FIELDS}
      entryName="project"
      getEntryTitle={(entry) => entry.name}
      createEmptyEntry={() => ({ id: createId('proj'), name: '', techStack: '', link: '', bullets: '' })}
    />
  )
}

export default ProjectsForm
