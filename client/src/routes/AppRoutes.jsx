// All the links in the app and which page each one shows.
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'
import DashboardLayout from '../components/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import TemplatesPage from '../pages/TemplatesPage'
import DashboardPage from '../pages/DashboardPage'
import CreateResumePage from '../pages/CreateResumePage'
import ImportResumePage from '../pages/ImportResumePage'
import ResumeEditorPage from '../pages/ResumeEditorPage'
import AtsCheckerPage from '../pages/AtsCheckerPage'
import ProfilePage from '../pages/ProfilePage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import ManageTemplatesPage from '../pages/admin/ManageTemplatesPage'
import ManageCompaniesPage from '../pages/admin/ManageCompaniesPage'
import ManageRolesPage from '../pages/admin/ManageRolesPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Logged-in pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create" element={<CreateResumePage />} />
          <Route path="/import" element={<ImportResumePage />} />
          <Route path="/editor/:resumeId" element={<ResumeEditorPage />} />
          <Route path="/ats-checker" element={<AtsCheckerPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin pages */}
      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/templates" element={<ManageTemplatesPage />} />
          <Route path="/admin/companies" element={<ManageCompaniesPage />} />
          <Route path="/admin/roles" element={<ManageRolesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
