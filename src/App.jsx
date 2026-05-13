import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Landing       from './pages/Landing'
import Events        from './pages/Events'
import Leaderboard   from './pages/Leaderboard'

// Auth pages (no Layout wrapper — full-page designs)
import Login         from './pages/auth/Login'
import Signup        from './pages/auth/Signup'
import VerifyEmail   from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Protected pages
import Profile       from './pages/Profile'

// Admin
import AdminDashboard  from './pages/admin/Dashboard'
import ManageEvents    from './pages/admin/ManageEvents'
import AdminSubmissions from './pages/admin/Submissions'
import ManageRoles     from './pages/admin/ManageRoles'

// Reviewer
import ReviewerDashboard  from './pages/reviewer/Dashboard'
import ReviewSubmission   from './pages/reviewer/ReviewSubmission'

// Submitter
import SubmitterDashboard from './pages/submitter/Submit'

// Dashboard redirect: send user to the correct dashboard based on role
import { useAuth } from './context/AuthContext'

function DashboardRedirect() {
  const { isAdmin, sdkRole, activeMode, loading } = useAuth()
  if (loading) return null
  if (!activeMode) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  if (sdkRole === 'reviewer') return <Navigate to="/reviewer" replace />
  return <Navigate to="/submit" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — wrapped in layout */}
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/events" element={<Layout><Events /></Layout>} />
        <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />

        {/* Auth — full-page (no layout) */}
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/verify-email"   element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute require="admin">
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute require="admin">
            <Layout><ManageEvents /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/events/:uuid" element={
          <ProtectedRoute require="admin">
            <Layout><ManageEvents /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/submissions" element={
          <ProtectedRoute require="admin">
            <Layout><AdminSubmissions /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/roles" element={
          <ProtectedRoute require="admin">
            <Layout><ManageRoles /></Layout>
          </ProtectedRoute>
        } />

        {/* Reviewer routes */}
        <Route path="/reviewer" element={
          <ProtectedRoute require="reviewer">
            <Layout><ReviewerDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reviewer/review/:uuid" element={
          <ProtectedRoute require="reviewer">
            <Layout><ReviewSubmission /></Layout>
          </ProtectedRoute>
        } />

        {/* Submitter route */}
        <Route path="/submit" element={
          <ProtectedRoute>
            <Layout><SubmitterDashboard /></Layout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
