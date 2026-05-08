import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PropsWithChildren } from 'react'
import { tokenStorage } from '../../../services/http/tokenStorage'
import { authService } from './authService'
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
} from '../types/auth.types'
import { AuthContext } from './authContext'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<string>
  verifyOtp: (payload: VerifyOtpPayload) => Promise<AuthUser>
  refreshSession: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('checking')

  const persistAuthenticatedSession = useCallback((nextUser: AuthUser, token: string) => {
    tokenStorage.setAccessToken(token)
    setUser(nextUser)
    setStatus('authenticated')
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.refreshToken()
      persistAuthenticatedSession(response.data.user, response.data.accessToken)
      return response.data.user
    } catch {
      tokenStorage.clearAccessToken()
      setUser(null)
      setStatus('unauthenticated')
      return null
    }
  }, [persistAuthenticatedSession])

  useEffect(() => {
    let isMounted = true

    const bootstrapSession = async () => {
      const existingToken = tokenStorage.getAccessToken()

      try {
        if (existingToken) {
          const response = await authService.getCurrentUser()

          if (!isMounted) {
            return
          }

          setUser(response.data.user)
          setStatus('authenticated')
          return
        }

        const refreshedUser = await refreshSession()

        if (!isMounted || refreshedUser) {
          return
        }

        setStatus('unauthenticated')
      } catch {
        if (!isMounted) {
          return
        }

        await refreshSession()
      }
    }

    void bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [refreshSession])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload)
      persistAuthenticatedSession(response.data.user, response.data.accessToken)
      return response.data.user
    },
    [persistAuthenticatedSession],
  )

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    return response.data.email
  }, [])

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload) => {
      const response = await authService.verifyOtp(payload)
      persistAuthenticatedSession(response.data.user, response.data.accessToken)
      return response.data.user
    },
    [persistAuthenticatedSession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      tokenStorage.clearAccessToken()
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      verifyOtp,
      refreshSession,
      logout,
    }),
    [login, logout, refreshSession, register, status, user, verifyOtp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
