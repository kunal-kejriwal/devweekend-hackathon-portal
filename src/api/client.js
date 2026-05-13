import axios from 'axios'

const BASE    = 'https://api.theapiengine.com'
export const NS       = import.meta.env.VITE_API_NAMESPACE
const SDK_KEY = import.meta.env.VITE_SDK_API_KEY
const API_KEY = import.meta.env.VITE_API_KEY

// ─── Developer (admin) client ─────────────────────────────────────────────────
// Uses developer JWT (BearerAuth) for management endpoints.
// Falls back to developer API key (ApiKeyAuth) as X-API-Key.
export const devClient = axios.create({
  baseURL: BASE,
  headers: { 'X-API-Key': API_KEY },
})

devClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('dev_access')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

devClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const refresh = localStorage.getItem('dev_refresh')
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${BASE}/accounts/v1/api/auth/token/refresh/`,
            { refresh }
          )
          localStorage.setItem('dev_access', data.access)
          orig.headers['Authorization'] = `Bearer ${data.access}`
          return devClient(orig)
        } catch {
          localStorage.removeItem('dev_access')
          localStorage.removeItem('dev_refresh')
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }
      }
    }
    return Promise.reject(err)
  }
)

// ─── SDK (AppUser) client ─────────────────────────────────────────────────────
// Uses SDK tenant key (X-API-Key) + AppUser JWT (Bearer) after login.
export const sdkClient = axios.create({
  baseURL: BASE,
  headers: { 'X-API-Key': SDK_KEY },
})

sdkClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('sdk_access')
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

sdkClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const refresh = localStorage.getItem('sdk_refresh')
      if (refresh) {
        try {
          const { data } = await axios.post(
            `${BASE}/api/v1/sdk/auth/token/refresh/`,
            { refresh },
            { headers: { 'X-API-Key': SDK_KEY } }
          )
          localStorage.setItem('sdk_access', data.access)
          orig.headers['Authorization'] = `Bearer ${data.access}`
          return sdkClient(orig)
        } catch {
          localStorage.removeItem('sdk_access')
          localStorage.removeItem('sdk_refresh')
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }
      }
    }
    return Promise.reject(err)
  }
)
