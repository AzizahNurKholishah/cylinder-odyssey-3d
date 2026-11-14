import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { API, tokenStore } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()))

  useEffect(() => {
    if (!tokenStore.get()) return
    API.me()
      .then((d) => setUser(d.profile))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = useCallback(async (code, accessKey) => {
    const d = await API.login(code, accessKey || undefined)
    tokenStore.set(d.token)
    setUser(d.profile)
    return d.profile
  }, [])

  const loginStudent = useCallback(async (name) => {
    const d = await API.loginStudent(name)
    tokenStore.set(d.token)
    setUser(d.profile)
    return d
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, loginStudent, logout }), [user, loading, login, loginStudent, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
