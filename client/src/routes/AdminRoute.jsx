// Only lets admins open admin pages.
// The server checks the admin role too (adminOnly middleware); this only hides the pages.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from '../components/PageLoader'

function AdminRoute() {
  const { user, isAdmin, isAuthLoading } = useAuth()
  const location = useLocation()

  if (isAuthLoading) return <PageLoader message="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default AdminRoute
