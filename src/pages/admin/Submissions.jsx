import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { listSubmissions, updateSubmission } from '../../api/submissions'
import { listReviews } from '../../api/reviews'

const STATUS_OPTIONS = ['submitted', 'under_review', 'accepted', 'rejected', 'winner']
const STATUS_COLORS  = {
  submitted:    'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  accepted:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
  winner:       'bg-purple-100 text-purple-700',
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [reviews, setReviews]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('')
  const [selected, setSelected]       = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, revRes] = await Promise.all([listSubmissions(), listReviews()])
        setSubmissions(subRes.data?.results ?? subRes.data)
        setReviews(revRes.data?.results ?? revRes.data)
      } catch { toast.error('Failed to load submissions.') }
      setLoading(false)
    }
    load()
  }, [])

  const getReviewsForSub = (uuid) => reviews.filter((r) => r.submission_uuid === uuid)

  const avgRating = (uuid) => {
    const rs = getReviewsForSub(uuid)
    if (!rs.length) return null
    return (rs.reduce((a, r) => a + Number(r.rating), 0) / rs.length).toFixed(1)
  }

  const handleStatusChange = async (uuid, status) => {
    try {
      await updateSubmission(uuid, { status })
      setSubmissions((s) => s.map((x) => x.uuid === uuid ? { ...x, status } : x))
      toast.success('Status updated.')
    } catch {
      toast.error('Update failed.')
    }
  }

  const filtered = filter
    ? submissions.filter((s) => s.track?.toLowerCase().includes(filter.toLowerCase()) || s.status?.includes(filter))
    : submissions

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-xl font-bold text-gray-900">
          Submissions <span className="text-gray-400 font-normal text-base">({filtered.length})</span>
        </h1>
        <input
          type="text"
          placeholder="Filter by track or status…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-64 px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium">No submissions yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Project', 'Team', 'Track', 'Status', 'Avg Rating', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((sub) => (
                <tr key={sub.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">{sub.project_name}</div>
                    <div className="text-xs text-gray-400 truncate">{sub.submitter_email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-700">{sub.team_name}</div>
                    <div className="text-xs text-gray-400">{sub.team_size} members</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{sub.track}</span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={sub.status ?? 'submitted'}
                      onChange={(e) => handleStatusChange(sub.uuid, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-brand-500 cursor-pointer ${STATUS_COLORS[sub.status] ?? STATUS_COLORS.submitted}`}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {avgRating(sub.uuid) ? (
                      <span className="flex items-center gap-1">
                        ⭐ {avgRating(sub.uuid)}
                        <span className="text-xs font-normal text-gray-400">({getReviewsForSub(sub.uuid).length})</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 font-normal text-xs">No reviews</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelected(selected?.uuid === sub.uuid ? null : sub)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {selected?.uuid === sub.uuid ? 'Close' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">{selected.project_name}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-gray-500">Team:</span> <span className="font-medium">{selected.team_name}</span></div>
            <div><span className="text-gray-500">Track:</span> <span className="font-medium">{selected.track}</span></div>
            <div><span className="text-gray-500">Submitter:</span> <span className="font-medium">{selected.submitter_email}</span></div>
            <div><span className="text-gray-500">Team size:</span> <span className="font-medium">{selected.team_size}</span></div>
          </div>
          <p className="text-sm text-gray-700 mb-4">{selected.description}</p>
          <div className="flex gap-3">
            {selected.repo_url && (
              <a href={selected.repo_url} target="_blank" rel="noreferrer"
                className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50">
                Repository →
              </a>
            )}
            {selected.demo_url && (
              <a href={selected.demo_url} target="_blank" rel="noreferrer"
                className="text-xs font-medium text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50">
                Live Demo →
              </a>
            )}
          </div>

          {getReviewsForSub(selected.uuid).length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Reviews</h3>
              <div className="space-y-2">
                {getReviewsForSub(selected.uuid).map((r) => (
                  <div key={r.uuid} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{r.reviewer_name}</span>
                      <span className="text-sm font-bold text-brand-600">⭐ {r.rating}/10</span>
                    </div>
                    <p className="text-sm text-gray-600">{r.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
