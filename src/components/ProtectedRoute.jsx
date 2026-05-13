import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, require: required = 'any' }) {
  const { activeMode, isAdmin, isReviewer, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!activeMode) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (required === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (required === 'reviewer' && !isReviewer && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
