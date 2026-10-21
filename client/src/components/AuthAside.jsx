// Navy side panel shown next to the login and signup forms.
import { Check } from 'lucide-react'

const NEXT_STEPS = ['Enter the company and role you are applying for', 'Pick a recommended template', 'Get an AI-written, keyword-ready first draft', 'Check your match estimate and download a PDF']

function AuthAside() {
  return (
    <aside className="on-navy hidden flex-col justify-center bg-navy px-10 py-12 text-navy-ink lg:flex">
      <div className="rounded-md border-[3px] border-ink bg-board px-5 py-4 text-ink">
        <p className="board-text text-3xl leading-tight">Your target company</p>
        <p className="font-board text-xl font-semibold">Your job role</p>
      </div>
      <h2 className="font-board mt-8 text-3xl leading-tight font-bold text-white">Every resume starts with where you’re going</h2>
      <ul className="mt-6 space-y-3 text-[15px]">
        {NEXT_STEPS.map((step) => (
          <li key={step} className="flex gap-2.5">
            <Check size={18} className="mt-0.5 shrink-0 text-board" aria-hidden="true" />
            {step}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default AuthAside
