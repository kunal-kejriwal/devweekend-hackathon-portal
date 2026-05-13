import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listEvents, createEvent, updateEvent, deleteEvent, getEvent } from '../../api/events'
import { format } from 'date-fns'

const DEFAULT_TRACKS = ['Web', 'Mobile', 'AI/ML', 'Blockchain', 'Open Innovation']

function EventForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    custom_data: {
      prize_pool: '',
      tracks: DEFAULT_TRACKS,
      registration_deadline: '',
      max_team_size: 4,
      banner_image: '',
      is_public: true,
    },
    ...initial,
  })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setCustom = (k) => (e) => setForm((f) => ({
    ...f,
    custom_data: { ...f.custom_data, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value },
  }))

  const handleTracksChange = (e) => {
    const tracks = e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
    setForm((f) => ({ ...f, custom_data: { ...f.custom_data, tracks } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(form)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contest name *</label>
        <input type="text" value={form.subject} onChange={set('subject')} required
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="DevWeekend Spring 2026" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={form.description} onChange={set('description')} rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Tell participants what this hackathon is about…" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start date & time *</label>
          <input type="datetime-local" value={form.start_datetime?.slice(0, 16)} required
            onChange={(e) => setForm((f) => ({ ...f, start_datetime: e.target.value + ':00Z' }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End date & time *</label>
          <input type="datetime-local" value={form.end_datetime?.slice(0, 16)} required
            onChange={(e) => setForm((f) => ({ ...f, end_datetime: e.target.value + ':00Z' }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" value={form.location ?? ''} onChange={set('location')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Online / City, Country" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prize pool</label>
          <input type="text" value={form.custom_data.prize_pool} onChange={setCustom('prize_pool')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="₹1,00,000" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration deadline</label>
          <input type="datetime-local" value={form.custom_data.registration_deadline?.slice(0, 16)}
            onChange={(e) => setForm((f) => ({
              ...f,
              custom_data: { ...f.custom_data, registration_deadline: e.target.value + ':00Z' },
            }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max team size</label>
          <input type="number" min={1} max={10} value={form.custom_data.max_team_size} onChange={setCustom('max_team_size')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tracks (comma-separated)</label>
        <input type="text" value={form.custom_data.tracks?.join(', ')} onChange={handleTracksChange}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Web, Mobile, AI/ML, Blockchain" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banner image URL</label>
        <input type="url" value={form.custom_data.banner_image} onChange={setCustom('banner_image')}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="https://…" />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="is_public" checked={form.custom_data.is_public}
          onChange={(e) => setForm((f) => ({ ...f, custom_data: { ...f.custom_data, is_public: e.target.checked } }))}
          className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
        <label htmlFor="is_public" className="text-sm font-medium text-gray-700">Visible on public contest listing</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Saving…' : 'Save contest'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function ManageEvents() {
  const { uuid } = useParams()
  const navigate  = useNavigate()
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // null | 'new' | event object

  useEffect(() => {
    if (uuid === 'new') { setEditing('new'); setLoading(false); return }
    if (uuid) {
      getEvent(uuid).then(({ data }) => { setEditing(data); setLoading(false) }).catch(() => navigate('/admin/events'))
      return
    }
    listEvents().then(({ data }) => {
      setEvents(data.results ?? data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [uuid, navigate])

  const handleSave = async (form) => {
    try {
      if (editing === 'new') {
        await createEvent(form)
        toast.success('Contest created!')
      } else {
        await updateEvent(editing.uuid, form)
        toast.success('Contest updated!')
      }
      navigate('/admin/events')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Save failed.')
      throw err
    }
  }

  const handleDelete = async (ev) => {
    if (!confirm(`Delete "${ev.subject}"? This cannot be undone.`)) return
    try {
      await deleteEvent(ev.uuid)
      setEvents((e) => e.filter((x) => x.uuid !== ev.uuid))
      toast.success('Contest deleted.')
    } catch {
      toast.error('Delete failed.')
    }
  }

  const statusBadge = (ev) => {
    const now = new Date()
    const start = new Date(ev.start_datetime)
    const end   = new Date(ev.end_datetime)
    if (now < start) return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Upcoming</span>
    if (now > end)   return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Ended</span>
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Live</span>
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  )

  if (editing) return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin/events" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {editing === 'new' ? 'Create Contest' : `Edit: ${editing.subject}`}
        </h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <EventForm
          initial={editing === 'new' ? {} : editing}
          onSave={handleSave}
          onCancel={() => navigate('/admin/events')}
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-900">Manage Contests</h1>
        <Link to="/admin/events/new"
          className="bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors">
          + New Contest
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium">No contests yet</p>
          <Link to="/admin/events/new" className="mt-3 inline-block text-sm text-brand-600 hover:underline">Create your first contest →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev.uuid} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 truncate">{ev.subject}</span>
                  {statusBadge(ev)}
                </div>
                <p className="text-xs text-gray-500">
                  {ev.start_datetime ? format(new Date(ev.start_datetime), 'MMM d, yyyy') : '—'} →{' '}
                  {ev.end_datetime   ? format(new Date(ev.end_datetime),   'MMM d, yyyy') : '—'}
                </p>
                {ev.custom_data?.prize_pool && (
                  <p className="text-xs text-green-600 font-medium mt-1">Prize: {ev.custom_data.prize_pool}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/admin/events/${ev.uuid}`}
                  className="text-xs font-medium text-brand-600 hover:underline px-3 py-1.5 border border-brand-200 rounded-lg hover:bg-brand-50">
                  Edit
                </Link>
                <button onClick={() => handleDelete(ev)}
                  className="text-xs font-medium text-red-600 hover:underline px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
