import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as AuthApi from '@/api/auth'
import { asApiErrorMessage, getStoredToken, setStoredToken } from '@/api/http'
import type { ApiUser } from '@/api/types'

type AuthContextValue = {
  token: string | null
  user: ApiUser | null
  isBootstrapping: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
  refreshUser: () => Promise<void>
  lastError: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setIsBootstrapping(true)
      setLastError(null)
      const stored = getStoredToken()
      if (!stored) {
        if (!cancelled) {
          setUser(null)
          setToken(null)
          setIsBootstrapping(false)
        }
        return
      }

      try {
        const u = await AuthApi.me()
        if (!cancelled) {
          setToken(stored)
          setUser(u)
        }
      } catch (e) {
        // Token invalide / expiré : on purge et on redirige pour éviter d'afficher une erreur
        if (!cancelled) {
          setStoredToken(null)
          setToken(null)
          setUser(null)
          if (typeof window !== 'undefined' && (e as any)?.response?.status === 401) {
            window.location.replace('/login')
          }
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  async function doLogin(email: string, password: string) {
    setLastError(null)
    try {
      const res = await AuthApi.login({ email, password })
      setStoredToken(res.access_token)
      setToken(res.access_token)
      setUser(res.user)
    } catch (e) {
      setLastError(asApiErrorMessage(e))
      throw e
    }
  }

  async function doRegister(email: string, password: string, name?: string) {
    setLastError(null)
    try {
      const res = await AuthApi.register({ email, password, name })
      setStoredToken(res.access_token)
      setToken(res.access_token)
      setUser(res.user)
    } catch (e) {
      setLastError(asApiErrorMessage(e))
      throw e
    }
  }

  async function doLogout() {
    setLastError(null)
    try {
      // Si ça échoue, on nettoie quand même la session côté front
      await AuthApi.logout().catch(() => undefined)
    } finally {
      setStoredToken(null)
      setToken(null)
      setUser(null)
    }
  }

  function clearSession() {
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }

  async function doRefreshUser() {
    const u = await AuthApi.me()
    setUser(u)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isBootstrapping,
      login: doLogin,
      register: doRegister,
      logout: doLogout,
      clearSession,
      refreshUser: doRefreshUser,
      lastError,
    }),
    [token, user, isBootstrapping, lastError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
