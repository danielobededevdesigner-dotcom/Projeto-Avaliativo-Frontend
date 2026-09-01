import { api } from './api'

import type {
  LoginData,
  LoginResponse,
} from '../types/auth'

export async function loginRequest(
  data: LoginData,
) {
  const response =
    await api.post<LoginResponse>(
      '/auth/login',
      data,
    )

  return response.data
}

export async function forgotPasswordRequest(
  email: string,
) {
  const response = await api.post<{
    message: string
    resetToken: string
  }>(
    '/auth/forgot-password',
    {
      email,
    },
  )

  return response.data
}

export async function resetPasswordRequest(
  token: string,
  newPassword: string,
) {
  const response = await api.post<{
    message: string
  }>(
    '/auth/reset-password',
    {
      token,
      newPassword,
    },
  )

  return response.data
}