// Landing page "How it works" steps.
const STEPS = [
  { title: 'Import or fill a form', text: 'Upload your PDF or Word resume, paste its text, or fill a short form with your own skills, projects and internships.' },
  { title: 'Paste the job description', text: 'We find the skills the job asks for. Your summary and skills are tailored to it, using only what you wrote.' },
  { title: 'Check your match estimate', text: 'See matched and missing skills, what to fix first, and exactly how the score is worked out.' },
  { title: 'Download PDF', text: 'Download a clean, text-based PDF that applicant tracking systems can read, and apply.' },
]

function RouteSteps() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 border-y border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 id="how-title" className="font-board text-4xl leading-tight font-bold">
          How it works
        </h2>

        <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[13px] w-[3px] bg-ink md:top-[13px] md:right-[10%] md:bottom-auto md:left-0 md:h-[3px] md:w-auto" />

          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-3">
              <span
                aria-hidden="true"
                className={`relative z-10 grid size-[29px] shrink-0 place-items-center rounded-full border-[3px] border-ink text-sm font-bold tabular ${
                  index === 0 ? 'bg-board' : 'bg-paper'
                }`}
              >
                {index + 1}
              </span>
              <div>
                <h3 className="board-text text-lg leading-tight">{step.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default RouteSteps
