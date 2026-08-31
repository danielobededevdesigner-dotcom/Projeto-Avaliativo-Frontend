import { api } from './api'
import type { LoginData, LoginResponse } from '../types/auth'

export async function loginRequest(data: LoginData) {
  const response = await api.post<LoginResponse>('/auth/login', data)

  return response.data
}