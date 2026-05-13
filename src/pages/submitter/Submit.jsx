import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createSubmission, listSubmissionsSDK, updateSubmission } from '../../api/submissions'
import { listEvents } from '../../api/events'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const STATUS_COLORS = {
  submitted:    'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  accepted:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
  winner:       'bg-purple-100 text-purple-700',
}

export default function SubmitterDashboard() {
  const { sdkUser } = useAuth()
  const navigate     = useNavigate()
  const [view, setView]     = useState('list')   // 'list' | 'new' | 'edit'
  const [events, setEvents] = useState([])
  const [mySubmissions, setMySubmissions] = useState([])
  const [editTarget, setEditTarget]       = useState(null)
  const [loading, setLoading]             = useState(true)

  const [form, setForm] = useState({
    project_name: '', team_name: '', team_size: 1,
    description: '', track: '', repo_url: '', demo_url: '',
    submitter_email: sdkUser?.email ?? '',
    submitter_app_user_id: sdkUser?.id ?? '',
    status: 'submitted',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, evRes] = await Promise.all([listSubmissionsSDK(), listEvents()])
        const all = subRes.data?.results ?? subRes.data ?? []
        setMySubmissions(all.filter((s) => s.submitter_app_user_id === sdkUser?.id || s.submitter_email === sdkUser?.email))
        setEvents(evRes.data?.results ?? evRes.data ?? [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [sdkUser])

  const activeEvent = events.find((e) => {
    const now = new Date()
    return new Date(e.start_datetime) <= now && new Date(e.end_datetime) >= now
  })

  const tracks = activeEvent?.custom_data?.tracks ?? ['Web', 'Mobile', 'AI/ML', 'Open Innovation']

  const resetForm = () => setForm({
    project_name: '', team_name: '', team_size: 1,
    description: '', track: tracks[0] ?? '', repo_url: '', demo_url: '',
    submitter_email: sdkUser?.email ?? '',
    submitter_app_user_id: sdkUser?.id ?? '',
    status: 'submitted',
  })

  const handleNew = () => {
    resetForm()
    setEditTarget(null)
    setView('new')
  }

  const handleEdit = (sub) => {
    setForm({
      project_name: sub.project_name, team_name: sub.team_name,
      team_size: sub.team_size, description: sub.description,
      track: sub.track, repo_url: sub.repo_url ?? '', demo_url: sub.demo_url ?? '',
      submitter_email: sub.submitter_email, submitter_app_user_id: sub.submitter_app_user_id,
      status: sub.status,
    })
    setEditTarget(sub)
    setView('edit')
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.repo_url.startsWith('http')) { toast.error('Repository URL must start with http(s)://'); return }
    const payload = { ...form, team_size: Number(form.team_size) }
    try {
      if (view === 'edit' && editTarget) {
        await updateSubmission(editTarget.uuid, payload)
        setMySubmissions((s) => s.map((x) => x.uuid === editTarget.uuid ? { ...x, ...payload } : x))
        toast.success('Submission updated!')
      } else {
        await createSubmission(payload)
        toast.success('Submission received! Good luck 🎉')
        const { data } = await listSubmissionsSDK()
        const all = data?.results ?? data ?? []
        setMySubmissions(all.filter((s) => s.submitter_app_user_id === sdkUser?.id || s.submitter_email === sdkUser?.email))
      }
      setView('list')
    } catch (err) {
      const d = err.response?.data
      if (typeof d === 'object') {
        const first = Object.values(d)[0]
        toast.error(Array.isArray(first) ? first[0] : String(first))
      } else {
        toast.error('Submission failed. Please try again.')
      }
    }
  }

  const SubmissionForm = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-8">
      <h2 className="font-bold text-gray-900 text-lg mb-6">
        {view === 'edit' ? 'Edit Submission' : 'Submit Your Project'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project name *</label>
          <input type="text" value={form.project_name} onChange={set('project_name')} required
            placeholder="My Awesome Hack"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team name *</label>
            <input type="text" value={form.team_name} onChange={set('team_name')} required
              placeholder="Team Rockstars"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team size *</label>
            <input type="number" min={1} max={activeEvent?.custom_data?.max_team_size ?? 10}
              value={form.team_size} onChange={set('team_size')} required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Track *</label>
          <select value={form.track} onChange={set('track')} required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Select a track…</option>
            {tracks.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={form.description} onChange={set('description')} rows={4} required
            placeholder="Describe your project: what it does, how you built it, and why it matters…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repository URL *</label>
          <input type="url" value={form.repo_url} onChange={set('repo_url')} required
            placeholder="https://github.com/your/project"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL <span className="text-gray-400 font-normal">(optional)</span></label>
          <input type="url" value={form.demo_url} onChange={set('demo_url')}
            placeholder="https://your-demo.vercel.app"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors">
            {view === 'edit' ? 'Update submission' : 'Submit project'}
          </button>
          <button type="button" onClick={() => setView('list')}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Active contest banner */}
      {activeEvent && (
        <div className="bg-brand-600 text-white rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium opacity-75 mb-0.5">ACTIVE CONTEST</div>
            <div className="font-bold text-lg">{activeEvent.subject}</div>
            <div className="text-xs opacity-75 mt-0.5">
              Ends {format(new Date(activeEvent.end_datetime), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
          {activeEvent.custom_data?.prize_pool && (
            <div className="text-right flex-shrink-0">
              <div className="text-xs opacity-75">Prize pool</div>
              <div className="font-bold text-xl">{activeEvent.custom_data.prize_pool}</div>
            </div>
          )}
        </div>
      )}

      {view !== 'list' ? (
        <SubmissionForm />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">My Submissions</h1>
            {activeEvent && (
              <button onClick={handleNew}
                className="bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors">
                + New Submission
              </button>
            )}
          </div>

          {mySubmissions.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium text-gray-600">No submissions yet</p>
              {activeEvent
                ? <button onClick={handleNew} className="mt-3 text-sm text-brand-600 hover:underline">Submit your project →</button>
                : <p className="text-sm text-gray-400 mt-1">No active contest right now. Check back soon!</p>
              }
            </div>
          ) : (
            <div className="space-y-4">
              {mySubmissions.map((sub) => (
                <div key={sub.uuid} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{sub.project_name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.status] ?? STATUS_COLORS.submitted}`}>
                          {(sub.status ?? 'submitted').replace('_', ' ')}
                        </span>
                        {sub.status === 'winner' && <span>🏆</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{sub.team_name} · {sub.track}</p>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{sub.description}</p>
                    </div>
                    {(sub.status === 'submitted' || sub.status === 'under_review') && (
                      <button onClick={() => handleEdit(sub)}
                        className="flex-shrink-0 text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50">
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3 mt-3">
                    {sub.repo_url && (
                      <a href={sub.repo_url} target="_blank" rel="noreferrer"
                        className="text-xs text-brand-600 hover:underline">Repository →</a>
                    )}
                    {sub.demo_url && (
                      <a href={sub.demo_url} target="_blank" rel="noreferrer"
                        className="text-xs text-green-600 hover:underline">Demo →</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
