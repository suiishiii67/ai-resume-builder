// Box to choose or drop a resume file (PDF or Word).
import { useState } from 'react'
import { FileUp } from 'lucide-react'
import { MAX_FILE_SIZE_MB } from '../utils/resumeImport'

function ResumeFileInput({ id = 'resume-file', onFile, compact = false }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    onFile(event.dataTransfer.files[0])
  }

  return (
    <>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 text-center ${compact ? 'py-7' : 'py-12'} ${isDragging ? 'border-navy bg-ground' : 'border-line-strong hover:border-ink'}`}
      >
        <span className="grid size-12 place-items-center rounded-md bg-navy text-white">
          <FileUp size={22} aria-hidden="true" />
        </span>
        <span className="text-[16px] font-bold">Choose a file or drop it here</span>
        <span className="text-sm text-ink-faint">PDF or Word (.docx), up to {MAX_FILE_SIZE_MB} MB</span>
      </label>
      <input
        id={id}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={(event) => {
          onFile(event.target.files[0])
          event.target.value = '' // lets the same file be chosen again
        }}
      />
    </>
  )
}

export default ResumeFileInput
