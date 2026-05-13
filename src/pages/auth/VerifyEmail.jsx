import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sdkVerifyCode, sdkResendVerification } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { loginSdk } = useAuth()
  const prefillEmail = location.state?.email ?? ''
  const [email, setEmail]   = useState(prefillEmail)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const refs = useRef([])

  useEffect(() => { refs.current[0]?.focus() }, [])

  const handleDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setDigits(paste.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { toast.error('Enter the full 6-digit code.'); return }
    setLoading(true)
    try {
      const { data } = await sdkVerifyCode(email, code)
      const role = await loginSdk(data.access, data.refresh, data.user)
      toast.success('Email verified! Welcome aboard 🎉')
      navigate(role === 'reviewer' ? '/reviewer' : '/submit')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) { toast.error('Enter your email first.'); return }
    setResending(true)
    try {
      await sdkResendVerification(email)
      toast.success('Verification code resent — check your inbox.')
    } catch {
      toast.error('Could not resend. Try again shortly.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-500 mt-1 text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-gray-700">{email || 'your email'}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!prefillEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Verification code</label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (refs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-colors"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Verifying…' : 'Verify email'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Didn't receive it?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-brand-600 font-medium hover:underline disabled:opacity-60"
            >
              {resending ? 'Resending…' : 'Resend code'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
