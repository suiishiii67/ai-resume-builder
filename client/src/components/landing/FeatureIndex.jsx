// Landing page list of the main features.
import { FileUp, ClipboardList, ScanSearch, Target, Columns2, FileDown } from 'lucide-react'

const FEATURES = [
  { icon: FileUp, title: 'Import your resume', text: 'Upload a PDF or Word file, or paste the text. We fill in the fields and you check them before editing.' },
  { icon: ClipboardList, title: 'Built from the job description', text: 'Paste the job post and see the skills it asks for. Your draft uses only your own details, with the matching skills first.' },
  { icon: ScanSearch, title: 'Honest match estimate', text: 'A score out of 100 with matched and missing skills, fixes ranked by impact, and a plain explanation of every point.' },
  { icon: Target, title: 'Tailor for a new job', text: 'Make a copy of any resume for a new job description in a minute. The original stays unchanged.' },
  { icon: Columns2, title: 'Live preview and score', text: 'The A4 page and the match estimate update with every keystroke, so you see what you will send.' },
  { icon: FileDown, title: 'PDF download', text: 'Downloads a text-based PDF that applicant tracking systems can read. Not an image of your resume.' },
]

function FeatureIndex() {
  return (
    <section aria-labelledby="features-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 id="features-title" className="font-board max-w-xl text-4xl leading-tight font-bold">
        Everything for one application, then the next one
      </h2>

      <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4 border-t border-line py-6">
            <Icon size={24} strokeWidth={1.75} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FeatureIndex
