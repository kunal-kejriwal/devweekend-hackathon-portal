import { useEffect, useState } from 'react'
import { listSubmissions } from '../api/submissions'
import { listReviews } from '../api/reviews'

export default function Leaderboard() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [tracks, setTracks]   = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, revRes] = await Promise.all([listSubmissions(), listReviews()])
        const subs = subRes.data?.results ?? subRes.data ?? []
        const revs = revRes.data?.results ?? revRes.data ?? []

        const uniqueTracks = [...new Set(subs.map((s) => s.track).filter(Boolean))]
        setTracks(uniqueTracks)

        const ranked = subs
          .map((sub) => {
            const subRevs = revs.filter((r) => r.submission_uuid === sub.uuid)
            const avg = subRevs.length
              ? subRevs.reduce((a, r) => a + Number(r.rating), 0) / subRevs.length
              : null
            return { ...sub, reviewCount: subRevs.length, avgRating: avg }
          })
          .filter((s) => s.reviewCount > 0)
          .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))

        setRows(ranked)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.track === filter)

  const medalIcon = (pos) => {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-1">Rankings based on reviewer scores.</p>
      </div>

      {/* Track filter */}
      {tracks.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            All Tracks
          </button>
          {tracks.map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === t ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="font-medium">No rankings yet</p>
          <p className="text-sm mt-1">Leaderboard populates after reviews are submitted.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((row, idx) => {
            const pos    = idx + 1
            const medal  = medalIcon(pos)
            const isWinner = row.status === 'winner'
            return (
              <div
                key={row.uuid}
                className={`flex items-center gap-4 rounded-2xl p-5 border transition-shadow hover:shadow-sm ${
                  pos === 1 ? 'bg-amber-50 border-amber-200' :
                  pos === 2 ? 'bg-gray-50 border-gray-200' :
                  pos === 3 ? 'bg-orange-50 border-orange-200' :
                  'bg-white border-gray-200'
                }`}
              >
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-400">#{pos}</span>
                  )}
                </div>

                {/* Project info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 truncate">{row.project_name}</span>
                    {isWinner && <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Winner 🏆</span>}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{row.track}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {row.team_name} · {row.team_size} members
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-extrabold text-gray-900">
                    {row.avgRating?.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">{row.reviewCount} review{row.reviewCount !== 1 ? 's' : ''}</div>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {row.repo_url && (
                    <a href={row.repo_url} target="_blank" rel="noreferrer"
                      className="text-xs text-brand-600 hover:underline">Repo →</a>
                  )}
                  {row.demo_url && (
                    <a href={row.demo_url} target="_blank" rel="noreferrer"
                      className="text-xs text-green-600 hover:underline">Demo →</a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
