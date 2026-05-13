import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { devUser, sdkUser, sdkRole, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const user = devUser ?? sdkUser
  const displayName = devUser
    ? (devUser.username ?? devUser.email)
    : sdkUser?.display_name ?? sdkUser?.email

  const roleBadge = isAdmin
    ? { label: 'Admin', cls: 'bg-purple-100 text-purple-700' }
    : sdkRole === 'reviewer'
    ? { label: 'Reviewer', cls: 'bg-green-100 text-green-700' }
    : { label: 'Submitter', cls: 'bg-blue-100 text-blue-700' }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">DevWeekend</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Home</Link>
            <Link to="/events" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Contests</Link>
            <Link to="/leaderboard" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Leaderboard</Link>

            {user && (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Admin</Link>
                )}
                {sdkRole === 'reviewer' && (
                  <Link to="/reviewer" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">Reviews</Link>
                )}
                {!isAdmin && (
                  <Link to="/submit" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">My Submissions</Link>
                )}
              </>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs">
                    {displayName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">{displayName}</span>
                  <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ${roleBadge.cls}`}>
                    {roleBadge.label}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    {!isAdmin && (
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
