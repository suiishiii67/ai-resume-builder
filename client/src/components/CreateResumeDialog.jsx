// Pop-up with the 3 ways to start a resume: import, fill a form, or start blank.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUp, ListChecks, FilePlus2, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useResumes } from '../context/ResumeContext'
import { createBlankResume } from '../utils/resumeImport'
import Modal from './Modal'
import Spinner from './Spinner'

const optionClasses = 'flex w-full items-center gap-4 rounded-md border border-line-strong bg-paper p-4 text-left hover:border-ink hover:bg-ground/60 disabled:opacity-60'

function CreateOption({ icon, title, description, onClick, isLoading }) {
  return (
    <button type="button" onClick={onClick} disabled={isLoading} className={optionClasses}>
      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-navy text-white">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{description}</span>
      </span>
      {isLoading ? <Spinner size={18} label="Creating" /> : <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-ink-faint" />}
    </button>
  )
}

function CreateResumeDialog({ onClose }) {
  const { user } = useAuth()
  const { createResume } = useResumes()
  const navigate = useNavigate()
  const [isCreatingBlank, setIsCreatingBlank] = useState(false)

  // Empty resume with only the account's name and email filled in
  const handleStartBlank = async () => {
    setIsCreatingBlank(true)
    const blank = createBlankResume()
    const newResume = await createResume({
      ...blank,
      title: 'Untitled resume',
      companyId: '',
      companyName: '',
      roleId: '',
      roleTitle: '',
      personal: { ...blank.personal, fullName: user.name, email: user.email },
      createdVia: 'blank',
    })
    navigate(`/editor/${newResume.id}`)
  }

  return (
    <Modal title="Create a resume" onClose={onClose}>
      <div className="space-y-3">
        <CreateOption
          icon={<FileUp size={20} aria-hidden="true" />}
          title="Import my resume"
          description="Upload a PDF or Word file, or paste the text. We fill in the fields for you to check."
          onClick={() => navigate('/import')}
        />
        <CreateOption
          icon={<ListChecks size={20} aria-hidden="true" />}
          title="Fill a form"
          description="Pick a target company and role, add your details, and get a first draft."
          onClick={() => navigate('/create')}
        />
        <CreateOption
          icon={<FilePlus2 size={20} aria-hidden="true" />}
          title="Start blank"
          description="Open an empty resume in the editor and write everything yourself."
          onClick={handleStartBlank}
          isLoading={isCreatingBlank}
        />
      </div>
    </Modal>
  )
}

export default CreateResumeDialog
