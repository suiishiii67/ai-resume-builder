// After logging in from a quick check (/continue-import): save the uploaded resume and open the editor.
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useResumes } from '../context/ResumeContext'
import { useToast } from '../context/ToastContext'
import { takePendingResume } from '../utils/pendingResume'
import PageLoader from '../components/PageLoader'

function ContinueImportPage() {
  const { createResume } = useResumes()
  const { showToast } = useToast()
  const navigate = useNavigate()
  // Run once, even if React runs the effect twice in development
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const pendingResume = takePendingResume()
    if (!pendingResume) {
      navigate('/dashboard', { replace: true })
      return
    }
    createResume(pendingResume).then((savedResume) => {
      showToast('Your uploaded resume is saved. Fix the points from your ATS report here.')
      navigate(`/editor/${savedResume.id}`, { replace: true })
    })
  }, [createResume, navigate, showToast])

  return <PageLoader message="Saving your uploaded resume…" />
}

export default ContinueImportPage
