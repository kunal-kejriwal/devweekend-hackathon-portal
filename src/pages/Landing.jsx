import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEvents } from '../api/events'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

function EventCard({ event }) {
  const now   = new Date()
  const start = new Date(event.start_datetime)
  const end   = new Date(event.end_datetime)
  const isLive     = now >= start && now <= end
  const isUpcoming = now < start
  const cd = event.custom_data ?? {}

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      {cd.banner_image ? (
        <img src={cd.banner_image} alt={event.subject} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <svg className="w-12 h-12 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {isLive ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          ) : isUpcoming ? (
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Upcoming</span>
          ) : (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Ended</span>
          )}
          {cd.prize_pool && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              🏆 {cd.prize_pool}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">{event.subject}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {format(start, 'MMM d')} – {format(end, 'MMM d, yyyy')}
          {event.location && <> · {event.location}</>}
        </div>
        {cd.tracks?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {cd.tracks.slice(0, 4).map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
        {isLive && (
          <Link to="/signup"
            className="block w-full text-center py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
            Register & Submit
          </Link>
        )}
        {isUpcoming && (
          <div className="text-xs text-gray-500 text-center py-2">
            Opens {format(start, 'MMM d, yyyy')}
            {cd.registration_deadline && (
              <> · Reg. deadline {format(new Date(cd.registration_deadline), 'MMM d')}</>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Landing() {
  const { activeMode, isAdmin, sdkRole } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listEvents({ ordering: 'start_datetime' })
      .then(({ data }) => setEvents(data.results ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const publicEvents = events.filter((e) => e.custom_data?.is_public !== false)

  const getDashboardLink = () => {
    if (isAdmin) return '/admin'
    if (sdkRole === 'reviewer') return '/reviewer'
    return '/submit'
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Hackathons · Submission Platform
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            Build. Submit.<br />
            <span className="text-brand-200">Win.</span>
          </h1>
          <p className="text-lg text-brand-100 max-w-xl mx-auto mb-10">
            DevWeekend is where developers compete, create, and get recognized.
            Join a hackathon, submit your project, and climb the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {activeMode ? (
              <Link to={getDashboardLink()}
                className="px-8 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-brand-50 transition-colors">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/signup"
                  className="px-8 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-brand-50 transition-colors">
                  Get started — it's free
                </Link>
                <Link to="/login"
                  className="px-8 py-3 rounded-xl border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign up & join', desc: 'Create an account, verify your email, and register for an active hackathon.' },
              { step: '02', title: 'Build & submit', desc: 'Develop your project and submit it with your repo URL, demo link, and description.' },
              { step: '03', title: 'Get reviewed', desc: 'Expert reviewers evaluate submissions and ratings appear on the public leaderboard.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-extrabold text-brand-100 mb-3">{item.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Hackathon Contests</h2>
              <p className="text-gray-500 mt-1">Join a live contest or see what's coming up.</p>
            </div>
            <Link to="/events" className="text-sm font-medium text-brand-600 hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : publicEvents.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>No contests announced yet — check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicEvents.slice(0, 6).map((ev) => <EventCard key={ev.uuid} event={ev} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!activeMode && (
        <section className="py-20 px-4 bg-brand-600 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to build?</h2>
          <p className="text-brand-100 mb-8 max-w-md mx-auto">
            Create your free account and start competing in DevWeekend hackathons.
          </p>
          <Link to="/signup"
            className="inline-block px-8 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-brand-50 transition-colors">
            Create your account →
          </Link>
        </section>
      )}
    </div>
  )
}
