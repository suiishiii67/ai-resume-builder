// Home page (/).
import { ScanSearch } from 'lucide-react'
import Button from '../components/Button'
import HeroDemo from '../components/landing/HeroDemo'
import FeatureIndex from '../components/landing/FeatureIndex'
import RouteSteps from '../components/landing/RouteSteps'
import AtsTeaser from '../components/landing/AtsTeaser'

function LandingPage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:pt-14">
        <div>
          <h1 className="font-board text-[44px] leading-[1.02] font-bold tracking-[-0.01em] sm:text-[56px]">
            A resume written for the company you’re applying to
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
            Import your resume or fill a short form, paste the job description, and get a resume that uses your own
            details with the skills that job asks for. Then check its ATS score and download the PDF.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button to="/signup" size="lg">
              Build my tailored resume
            </Button>
            <Button to="/quick-check" variant="secondary" size="lg">
              <ScanSearch size={18} aria-hidden="true" /> Check my resume's ATS score
            </Button>
          </div>
          <p className="mt-4 text-sm text-ink-faint">Free to use. The ATS check works without an account.</p>
        </div>

        <HeroDemo />
      </section>

      <FeatureIndex />
      <RouteSteps />
      <AtsTeaser />

      <section className="on-navy bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
          <h2 className="font-board max-w-xl text-4xl leading-tight font-bold text-white">
            Your next application deserves its own resume
          </h2>
          <Button to="/signup" variant="board" size="lg">
            Create my first resume
          </Button>
        </div>
      </section>
    </>
  )
}

export default LandingPage
