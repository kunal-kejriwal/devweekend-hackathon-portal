import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { devMe, sdkMe } from '../api/auth'
import { getUserRole } from '../api/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Two independent sessions: developer (admin) and SDK (end-user)
  const [devUser, setDevUser]     = useState(null)   // APIEngine developer profile
  const [sdkUser, setSdkUser]     = useState(null)   // AppUser profile
  const [sdkRole, setSdkRole]     = useState(null)   // 'admin'|'reviewer'|'submitter'
  const [loading, setLoading]     = useState(true)

  // activeMode: 'dev' | 'sdk' | null
  const activeMode = devUser ? 'dev' : sdkUser ? 'sdk' : null

  const loadDevSession = useCallback(async () => {
    const token = localStorage.getItem('dev_access')
    if (!token) return false
    try {
      const { data } = await devMe()
      setDevUser(data)
      return true
    } catch {
      localStorage.removeItem('dev_access')
      localStorage.removeItem('dev_refresh')
      return false
    }
  }, [])

  const loadSdkSession = useCallback(async () => {
    const token = localStorage.getItem('sdk_access')
    if (!token) return false
    try {
      const { data } = await sdkMe()
      setSdkUser(data)
      const role = await getUserRole(data.id)
      setSdkRole(role)
      return true
    } catch {
      localStorage.removeItem('sdk_access')
      localStorage.removeItem('sdk_refresh')
      return false
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadDevSession(), loadSdkSession()])
      setLoading(false)
    }
    init()

    const onLogout = () => {
      setDevUser(null)
      setSdkUser(null)
      setSdkRole(null)
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [loadDevSession, loadSdkSession])

  const loginDev = (access, refresh, user) => {
    localStorage.setItem('dev_access', access)
    localStorage.setItem('dev_refresh', refresh)
    setDevUser(user)
  }

  const loginSdk = async (access, refresh, user) => {
    localStorage.setItem('sdk_access', access)
    localStorage.setItem('sdk_refresh', refresh)
    setSdkUser(user)
    const role = await getUserRole(user.id)
    setSdkRole(role)
    return role
  }

  const logoutDev = () => {
    localStorage.removeItem('dev_access')
    localStorage.removeItem('dev_refresh')
    setDevUser(null)
  }

  const logoutSdk = () => {
    localStorage.removeItem('sdk_access')
    localStorage.removeItem('sdk_refresh')
    setSdkUser(null)
    setSdkRole(null)
  }

  const logout = () => {
    logoutDev()
    logoutSdk()
  }

  return (
    <AuthContext.Provider
      value={{
        devUser, sdkUser, sdkRole, activeMode, loading,
        loginDev, loginSdk, logoutDev, logoutSdk, logout,
        isAdmin:    !!devUser,
        isReviewer: sdkRole === 'reviewer',
        isSubmitter: sdkRole === 'submitter' || (!!sdkUser && !sdkRole),
        reloadSdkRole: async () => {
          if (sdkUser) {
            const role = await getUserRole(sdkUser.id)
            setSdkRole(role)
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
