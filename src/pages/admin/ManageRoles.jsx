import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { listAllRoles, setUserRole, updateUserRole, deleteUserRole } from '../../api/roles'

export default function ManageRoles() {
  const [roles, setRoles]     = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ email: '', user_id: '', role: 'reviewer' })
  const [adding, setAdding]   = useState(false)
  const [saving, setSaving]   = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await listAllRoles()
      setRoles(Array.isArray(data) ? data : data?.results ?? [])
    } catch { toast.error('Failed to load roles.') }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.email || !form.user_id) { toast.error('Email and User ID are required.'); return }
    setSaving(true)
    try {
      await setUserRole(form.user_id, form.email, form.role)
      toast.success('Role assigned.')
      setForm({ email: '', user_id: '', role: 'reviewer' })
      setAdding(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to assign role.')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (record, newRole) => {
    try {
      await updateUserRole(record.id ?? record._id, newRole)
      setRoles((r) => r.map((x) => (x.id === record.id ? { ...x, role: newRole } : x)))
      toast.success('Role updated.')
    } catch {
      toast.error('Update failed.')
    }
  }

  const handleRemove = async (record) => {
    if (!confirm(`Remove role for ${record.email}?`)) return
    try {
      await deleteUserRole(record.id ?? record._id)
      setRoles((r) => r.filter((x) => x.id !== record.id))
      toast.success('Role removed — user is now a submitter.')
    } catch {
      toast.error('Remove failed.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Roles</h1>
          <p className="text-sm text-gray-500 mt-1">Assign reviewer access to participants by their User ID.</p>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors"
        >
          {adding ? 'Cancel' : '+ Assign Role'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Assign a role</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com" required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AppUser ID (UUID)</label>
                <input type="text" value={form.user_id} onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="reviewer">Reviewer</option>
                <option value="submitter">Submitter</option>
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Saving…' : 'Assign role'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            Tip: The User ID is visible in the user's profile or in the APIEngine admin. The user's role is checked at every login.
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium">No custom roles assigned</p>
          <p className="text-sm mt-1">All users default to <strong>Submitter</strong> until assigned otherwise.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Email', 'User ID', 'Role', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((r) => (
                <tr key={r.id ?? r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.email}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 truncate max-w-[160px]">{r.user_id}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.role}
                      onChange={(e) => handleRoleChange(r, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-brand-500 cursor-pointer ${
                        r.role === 'reviewer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <option value="reviewer">Reviewer</option>
                      <option value="submitter">Submitter</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleRemove(r)} className="text-xs text-red-600 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
