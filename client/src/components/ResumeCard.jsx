// One resume card on the dashboard.
import { Link } from 'react-router-dom'
import { PencilLine, Copy, FileDown, Trash2 } from 'lucide-react'
import ResumePreview from './templates/ResumePreview'
import StatusStamp from './StatusStamp'
import { getScoreBand } from '../utils/scoreBand'
import { formatDate } from '../utils/resumeFormat'

function ResumeCard({ resume, layout, templateName, onDuplicate, onDownload, onDelete }) {
  const hasScore = typeof resume.atsScore === 'number'

  const actionClasses = 'inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5 hover:text-ink'

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-paper shadow-panel">
      <Link to={`/editor/${resume.id}`} aria-label={`Edit ${resume.title}`} className="relative block h-52 overflow-hidden border-b border-line bg-ground px-6 pt-4">
        <ResumePreview resume={resume} layout={layout} maxScale={0.45} />
        <span className="absolute top-3 right-3">
          {hasScore ? (
            <StatusStamp tone={getScoreBand(resume.atsScore).tone} className="bg-paper">ATS {resume.atsScore}</StatusStamp>
          ) : (
            <StatusStamp className="bg-paper">Not checked</StatusStamp>
          )}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg leading-snug font-bold">{resume.title}</h2>

        <p className="mt-2 self-start rounded-[3px] border-2 border-ink bg-board px-2 py-0.5 text-sm font-semibold">
          <span className="sr-only">Target: </span>
          {[resume.companyName, resume.roleTitle].filter(Boolean).join(' · ') || 'No target yet'}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 text-sm">
          <dt className="text-ink-faint">Template</dt>
          <dt className="text-ink-faint">Last edited</dt>
          <dd className="font-medium">{templateName}</dd>
          <dd className="tabular font-medium">{formatDate(resume.updatedAt)}</dd>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-3">
          <Link to={`/editor/${resume.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-navy px-3 text-sm font-semibold text-white hover:bg-navy-soft">
            <PencilLine size={16} aria-hidden="true" />
            Edit
          </Link>
          <button type="button" onClick={() => onDuplicate(resume)} className={actionClasses}>
            <Copy size={16} aria-hidden="true" />
            Duplicate
          </button>
          <button type="button" onClick={() => onDownload(resume)} className={actionClasses}>
            <FileDown size={16} aria-hidden="true" />
            Download
          </button>
          <button
            type="button"
            onClick={() => onDelete(resume)}
            className="ml-auto inline-flex size-9 items-center justify-center rounded-md text-ink-soft hover:bg-maroon-soft hover:text-maroon"
            aria-label={`Delete ${resume.title}`}
            title="Delete"
          >
            <Trash2 size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default ResumeCard
