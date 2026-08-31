import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { setUnauthorizedHandler } from '../services/api'
import {
  getToken,
  getUserIdFromToken,
  isTokenExpired,
  removeToken,
  saveToken,
} from '../utils/token'

type AuthContextData = {
  token: string | null
  userId: number | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextData | undefined>(
  undefined,
)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = getToken()

    if (!storedToken) {
      return null
    }

    if (isTokenExpired(storedToken)) {
      removeToken()
      return null
    }

    return storedToken
  })

  const login = useCallback((newToken: string) => {
    saveToken(newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setToken(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  const value = useMemo(
    () => ({
      token,
      userId: token ? getUserIdFromToken() : null,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, login, logout],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}