import { jwtDecode } from 'jwt-decode'
import type { TokenPayload } from '../types/auth'

const TOKEN_KEY = 'token'

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function decodeToken(token: string) {
  return jwtDecode<TokenPayload>(token)
}

export function getUserIdFromToken() {
  const token = getToken()

  if (!token) {
    return null
  }

  try {
    const decoded = decodeToken(token)
    return decoded.id
  } catch {
    return null
  }
}

export function isTokenExpired(token: string) {
  try {
    const decoded = decodeToken(token)

    if (!decoded.exp) {
      return false
    }

    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}