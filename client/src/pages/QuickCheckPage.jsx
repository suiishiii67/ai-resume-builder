// Quick ATS check (/quick-check): works without logging in.
import PageHeader from '../components/PageHeader'
import QuickCheckPanel from '../components/ats/QuickCheckPanel'

function QuickCheckPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Check my resume's ATS score" description="Upload your resume and paste the job description. No account needed. It's an estimate like Jobscan, and it shows how every point is worked out." />
      <QuickCheckPanel />
    </div>
  )
}

export default QuickCheckPage
