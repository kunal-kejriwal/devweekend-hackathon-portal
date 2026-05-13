import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { devLogin, sdkLogin, devMe } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [mode, setMode]       = useState('user')   // 'user' | 'admin'
  const [email, setEmail]     = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginDev, loginSdk } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? null

  const handleUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await sdkLogin(email, password)
      const role = await loginSdk(data.access, data.refresh, data.user)
      toast.success(`Welcome back, ${data.user.display_name ?? email}!`)
      if (from) return navigate(from, { replace: true })
      navigate(role === 'reviewer' ? '/reviewer' : '/submit')
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        toast.error('Email not verified. Check your inbox.')
        navigate('/verify-email', { state: { email } })
      } else {
        toast.error(err.response?.data?.detail ?? 'Invalid credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await devLogin(username || email, password)
      loginDev(data.access, data.refresh, { username, email })
      // Fetch real profile
      try {
        const prof = await devMe()
        loginDev(data.access, data.refresh, prof.data)
      } catch { /* use basic user */ }
      toast.success('Admin login successful.')
      navigate(from ?? '/admin')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Invalid admin credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to DevWeekend</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back — let's build something great.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button
            onClick={() => setMode('user')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'user' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Participant / Reviewer
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'admin' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Organizer (Admin)
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={mode === 'user' ? handleUser : handleAdmin} className="space-y-4">
            {mode === 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
                <input
                  type="text"
                  value={username || email}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v.includes('@')) { setEmail(v); setUsername('') }
                    else { setUsername(v); setEmail('') }
                  }}
                  placeholder="your APIEngine developer username"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {mode === 'user' && (
                  <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {mode === 'user' && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-600 font-medium hover:underline">
                Create one
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
