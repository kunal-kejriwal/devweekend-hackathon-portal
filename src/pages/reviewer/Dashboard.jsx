import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSubmissionsSDK } from '../../api/submissions'
import { listReviewsSDK } from '../../api/reviews'
import { useAuth } from '../../context/AuthContext'

export default function ReviewerDashboard() {
  const { sdkUser } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [myReviews, setMyReviews]     = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, revRes] = await Promise.all([
          listSubmissionsSDK({ status: 'under_review' }),
          listReviewsSDK(),
        ])
        setSubmissions(subRes.data?.results ?? subRes.data ?? [])
        const all = revRes.data?.results ?? revRes.data ?? []
        setMyReviews(all.filter((r) => r.reviewer_app_user_id === sdkUser?.id))
      } catch {}
      setLoading(false)
    }
    load()
  }, [sdkUser])

  const reviewedIds = new Set(myReviews.map((r) => r.submission_uuid))
  const pending   = submissions.filter((s) => !reviewedIds.has(s.uuid))
  const completed = myReviews.length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Reviewer Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Hello, {sdkUser?.display_name ?? 'Reviewer'} — here are your review assignments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Reviews', value: loading ? '…' : pending.length, color: 'bg-orange-100 text-orange-700' },
          { label: 'Completed Reviews', value: loading ? '…' : completed, color: 'bg-green-100 text-green-700' },
          { label: 'Total Assigned', value: loading ? '…' : submissions.length, color: 'bg-brand-100 text-brand-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`text-3xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : pending.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900">All caught up!</p>
          <p className="text-sm text-gray-500 mt-1">No pending reviews at the moment.</p>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Pending Reviews ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((sub) => (
              <div key={sub.uuid} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{sub.project_name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {sub.team_name} · {sub.team_size} members · Track: <span className="font-medium">{sub.track}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{sub.description}</p>
                  <div className="flex gap-2 mt-2">
                    {sub.repo_url && (
                      <a href={sub.repo_url} target="_blank" rel="noreferrer"
                        className="text-xs text-brand-600 hover:underline">Repo →</a>
                    )}
                    {sub.demo_url && (
                      <a href={sub.demo_url} target="_blank" rel="noreferrer"
                        className="text-xs text-green-600 hover:underline">Demo →</a>
                    )}
                  </div>
                </div>
                <Link
                  to={`/reviewer/review/${sub.uuid}`}
                  state={{ submission: sub }}
                  className="flex-shrink-0 bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {myReviews.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-gray-900 mb-4">My Completed Reviews</h2>
          <div className="space-y-2">
            {myReviews.map((r) => (
              <div key={r.uuid} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Submission: {r.submission_uuid.slice(0, 8)}…</div>
                  <p className="text-sm text-gray-600 mt-1">{r.feedback}</p>
                </div>
                <div className="text-lg font-bold text-brand-600">⭐ {r.rating}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
