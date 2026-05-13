import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEvents } from '../../api/events'
import { listSubmissions } from '../../api/submissions'
import { listReviews } from '../../api/reviews'
import { listAllRoles } from '../../api/roles'
import { useAuth } from '../../context/AuthContext'

function StatCard({ label, value, icon, color, to }) {
  const inner = (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow ${to ? 'cursor-pointer' : ''}`}>
      <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value ?? '—'}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const { devUser } = useAuth()
  const [stats, setStats] = useState({ events: 0, submissions: 0, reviews: 0, reviewers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [ev, sub, rev, roles] = await Promise.allSettled([
          listEvents(),
          listSubmissions(),
          listReviews(),
          listAllRoles(),
        ])
        const evData  = ev.value?.data
        const subData = sub.value?.data
        const revData = rev.value?.data
        const rolesData = roles.value?.data

        const rolesArr = Array.isArray(rolesData) ? rolesData : rolesData?.results ?? []
        setStats({
          events:      evData?.count  ?? evData?.results?.length  ?? 0,
          submissions: subData?.count ?? subData?.results?.length ?? 0,
          reviews:     revData?.count ?? revData?.results?.length ?? 0,
          reviewers:   rolesArr.filter((r) => r.role === 'reviewer').length,
        })
      } catch { /* show zeros */ }
      setLoading(false)
    }
    load()
  }, [])

  const name = devUser?.first_name ?? devUser?.username ?? 'Admin'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Here's what's happening with your hackathon.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Contests"
            value={stats.events}
            to="/admin/events"
            color="bg-brand-100 text-brand-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            label="Submissions"
            value={stats.submissions}
            to="/admin/submissions"
            color="bg-orange-100 text-orange-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard
            label="Reviews Submitted"
            value={stats.reviews}
            color="bg-green-100 text-green-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
          />
          <StatCard
            label="Reviewers"
            value={stats.reviewers}
            to="/admin/roles"
            color="bg-purple-100 text-purple-600"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/events/new', label: 'Create Contest', desc: 'Launch a new hackathon event', color: 'bg-brand-600 text-white hover:bg-brand-700' },
          { to: '/admin/submissions', label: 'Review Submissions', desc: 'Manage and update submission statuses', color: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50' },
          { to: '/admin/roles', label: 'Assign Reviewers', desc: 'Grant reviewer access to participants', color: 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`rounded-2xl p-6 transition-colors ${item.color}`}
          >
            <div className="font-semibold text-sm">{item.label}</div>
            <div className="text-xs mt-1 opacity-75">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
