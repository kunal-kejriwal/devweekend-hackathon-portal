import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEvents } from '../api/events'
import { format } from 'date-fns'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')  // 'all' | 'live' | 'upcoming' | 'ended'

  useEffect(() => {
    listEvents({ ordering: '-start_datetime' })
      .then(({ data }) => setEvents((data.results ?? data ?? []).filter((e) => e.custom_data?.is_public !== false)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categorize = (ev) => {
    const now   = new Date()
    const start = new Date(ev.start_datetime)
    const end   = new Date(ev.end_datetime)
    if (now >= start && now <= end) return 'live'
    if (now < start) return 'upcoming'
    return 'ended'
  }

  const filtered = filter === 'all' ? events : events.filter((e) => categorize(e) === filter)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">All Contests</h1>
        <p className="text-gray-500 mt-1">Browse all DevWeekend hackathon events.</p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {['all', 'live', 'upcoming', 'ended'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No {filter !== 'all' ? filter : ''} contests found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ev) => {
            const cat = categorize(ev)
            const cd  = ev.custom_data ?? {}
            return (
              <div key={ev.uuid} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        cat === 'live' ? 'bg-green-100 text-green-700' :
                        cat === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cat === 'live' ? '🟢 Live' : cat === 'upcoming' ? 'Upcoming' : 'Ended'}
                      </span>
                      {cd.prize_pool && (
                        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          🏆 {cd.prize_pool}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-xl text-gray-900 mb-1">{ev.subject}</h2>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ev.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <span>
                        📅 {format(new Date(ev.start_datetime), 'MMM d')} – {format(new Date(ev.end_datetime), 'MMM d, yyyy')}
                      </span>
                      {ev.location && <span>📍 {ev.location}</span>}
                      {cd.max_team_size && <span>👥 Max {cd.max_team_size} per team</span>}
                    </div>
                    {cd.tracks?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {cd.tracks.map((t) => (
                          <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {cat === 'live' && (
                    <Link to="/signup"
                      className="flex-shrink-0 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
                      Join Now
                    </Link>
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
