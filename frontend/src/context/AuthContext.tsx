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
  sessionExpired: boolean
  login: (token: string) => void
  logout: () => void
}

type AuthState = {
  token: string | null
  sessionExpired: boolean
}

export const AuthContext =
  createContext<
    AuthContextData | undefined
  >(undefined)

type AuthProviderProps = {
  children: ReactNode
}

function getInitialAuthState(): AuthState {
  const storedToken = getToken()

  if (!storedToken) {
    return {
      token: null,
      sessionExpired: false,
    }
  }

  /*
   * Se o usuário abrir novamente o sistema
   * com um token que já expirou, removemos
   * o token e avisamos o Login.
   */
  if (isTokenExpired(storedToken)) {
    removeToken()

    return {
      token: null,
      sessionExpired: true,
    }
  }

  return {
    token: storedToken,
    sessionExpired: false,
  }
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    authState,
    setAuthState,
  ] = useState<AuthState>(
    getInitialAuthState,
  )

  const login = useCallback(
    (newToken: string) => {
      saveToken(newToken)

      setAuthState({
        token: newToken,
        sessionExpired: false,
      })
    },
    [],
  )

  /*
   * Logout realizado pelo próprio usuário.
   *
   * Não exibimos mensagem de sessão
   * expirada nesse caso.
   */
  const logout = useCallback(() => {
    removeToken()

    setAuthState({
      token: null,
      sessionExpired: false,
    })
  }, [])

  /*
   * Logout causado por token inválido
   * ou expirado.
   */
  const expireSession =
    useCallback(() => {
      removeToken()

      setAuthState({
        token: null,
        sessionExpired: true,
      })
    }, [])

  /*
   * O Axios chama expireSession quando
   * uma requisição autenticada recebe 401.
   */
  useEffect(() => {
    setUnauthorizedHandler(
      expireSession,
    )
  }, [expireSession])

  const value = useMemo(
    () => ({
      token: authState.token,

      userId: authState.token
        ? getUserIdFromToken()
        : null,

      isAuthenticated: Boolean(
        authState.token,
      ),

      sessionExpired:
        authState.sessionExpired,

      login,
      logout,
    }),
    [
      authState,
      login,
      logout,
    ],
  )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}