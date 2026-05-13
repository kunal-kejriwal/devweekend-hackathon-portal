import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sdkUpdateMe } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { sdkUser, logoutSdk } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: sdkUser?.first_name ?? '',
    last_name:  sdkUser?.last_name  ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await sdkUpdateMe(form)
      toast.success('Profile updated!')
    } catch {
      toast.error('Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logoutSdk()
    navigate('/')
  }

  if (!sdkUser) return null

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Profile</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
            {sdkUser.display_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="font-bold text-gray-900">{sdkUser.display_name}</div>
            <div className="text-sm text-gray-500">{sdkUser.email}</div>
            <div className="flex items-center gap-1 mt-1">
              {sdkUser.email_verified ? (
                <span className="text-xs text-green-600 flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="text-xs text-amber-600">Email not verified</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input type="text" value={form.first_name} onChange={set('first_name')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input type="text" value={form.last_name} onChange={set('last_name')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={sdkUser.email} disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input type="text" value={sdkUser.id} disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50 text-gray-400 cursor-not-allowed font-mono" />
            <p className="text-xs text-gray-400 mt-1">Share this with the organizer if they need to assign you a role.</p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <hr className="my-6 border-gray-100" />
        <button onClick={handleLogout}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
