import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listSubmissionsSDK } from '../../api/submissions'
import { createReview, listReviewsSDK } from '../../api/reviews'
import { useAuth } from '../../context/AuthContext'

export default function ReviewSubmission() {
  const { uuid } = useParams()
  const location  = useLocation()
  const navigate  = useNavigate()
  const { sdkUser } = useAuth()
  const [sub, setSub]       = useState(location.state?.submission ?? null)
  const [existing, setExisting] = useState(null)
  const [loading, setLoading]   = useState(!sub)
  const [form, setForm]     = useState({ rating: 7, feedback: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!sub) {
          const { data } = await listSubmissionsSDK()
          const arr = data?.results ?? data ?? []
          const found = arr.find((s) => s.uuid === uuid)
          if (!found) { toast.error('Submission not found.'); navigate('/reviewer'); return }
          setSub(found)
        }
        // Check if already reviewed
        const revRes = await listReviewsSDK()
        const all = revRes.data?.results ?? revRes.data ?? []
        const mine = all.find((r) => r.submission_uuid === uuid && r.reviewer_app_user_id === sdkUser?.id)
        if (mine) setExisting(mine)
      } catch {}
      setLoading(false)
    }
    load()
  }, [uuid, sub, sdkUser, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Number(form.rating) < 1 || Number(form.rating) > 10) {
      toast.error('Rating must be between 1 and 10.')
      return
    }
    if (form.feedback.trim().length < 20) {
      toast.error('Please provide at least 20 characters of feedback.')
      return
    }
    setSaving(true)
    try {
      await createReview({
        submission_uuid: uuid,
        rating: Number(form.rating),
        feedback: form.feedback.trim(),
        reviewer_name: sdkUser?.display_name ?? sdkUser?.email,
        reviewer_app_user_id: sdkUser?.id,
      })
      toast.success('Review submitted successfully!')
      navigate('/reviewer')
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to submit review.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate('/reviewer')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </button>

      {/* Submission card */}
      {sub && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{sub.project_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {sub.team_name} · {sub.team_size} members · Track: <strong>{sub.track}</strong>
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex-shrink-0">{sub.track}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{sub.description}</p>
          <div className="flex gap-3 mt-4">
            {sub.repo_url && (
              <a href={sub.repo_url} target="_blank" rel="noreferrer"
                className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50">
                View Repository →
              </a>
            )}
            {sub.demo_url && (
              <a href={sub.demo_url} target="_blank" rel="noreferrer"
                className="text-xs font-medium text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50">
                Live Demo →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Already reviewed */}
      {existing ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-green-800">You've already reviewed this submission</span>
          </div>
          <div className="text-2xl font-bold text-green-700 mb-2">⭐ {existing.rating}/10</div>
          <p className="text-sm text-green-900">{existing.feedback}</p>
        </div>
      ) : (
        /* Review form */
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-5">Submit your review</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating: <span className="text-brand-600 font-bold text-lg">{form.rating}</span>/10
              </label>
              <input
                type="range" min={1} max={10} value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 — Needs work</span>
                <span>10 — Outstanding</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback <span className="text-gray-400 font-normal">(min 20 chars)</span>
              </label>
              <textarea
                value={form.feedback}
                onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                rows={5}
                placeholder="Describe the project's strengths, areas for improvement, technical execution, and innovation…"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">{form.feedback.length} chars</div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
