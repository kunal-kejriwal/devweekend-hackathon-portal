import { devClient, sdkClient, NS } from './client'

// User roles stored in JSON DB, slug: user-roles
// Schema: { user_id, email, role: 'reviewer' | 'submitter' }
const SLUG = 'user-roles'
const BASE = `/api/v1/db/${NS}/${SLUG}`

export const getUserRole = async (userId) => {
  try {
    // Read using SDK client (ApiKeyAuth is sufficient for JSON DB reads)
    const { data } = await sdkClient.get(BASE, {
      params: { filter: JSON.stringify({ user_id: userId }) },
    })
    const records = Array.isArray(data) ? data : data.results ?? []
    return records.find((r) => r.user_id === userId)?.role ?? 'submitter'
  } catch {
    return 'submitter'
  }
}

export const listAllRoles = () => devClient.get(BASE)

export const setUserRole = (userId, email, role) =>
  devClient.post(BASE, { user_id: userId, email, role })

export const updateUserRole = (recordId, role) =>
  devClient.patch(`${BASE}/${recordId}`, { role })

export const deleteUserRole = (recordId) =>
  devClient.delete(`${BASE}/${recordId}`)
