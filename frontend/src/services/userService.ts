import { api } from './api'

import type {
  ChangePasswordData,
  CreateUserData,
  UpdateUserData,
  User,
  UsersResponse,
} from '../types/user'

export async function createUser(
  data: CreateUserData,
) {
  const response = await api.post<User>(
    '/users',
    data,
  )

  return response.data
}

export async function getUsers(
  page = 1,
  limit = 5,
): Promise<UsersResponse> {
  const response = await api.get<User[]>(
    '/users',
    {
      params: {
        page,
        limit,
      },
    },
  )

  const total = Number(
    response.headers['x-total-count'] ??
      response.data.length,
  )

  return {
    users: response.data,
    total,
    page,
    limit,
  }
}

export async function getUserById(
  id: number,
) {
  const response = await api.get<User>(
    `/users/${id}`,
  )

  return response.data
}

export async function updateUser(
  id: number,
  data: UpdateUserData,
) {
  const response = await api.put(
    `/users/${id}`,
    data,
  )

  return response.data
}

export async function deleteUser(
  id: number,
) {
  await api.delete(`/users/${id}`)
}

export async function changePassword(
  id: number,
  data: ChangePasswordData,
) {
  const response = await api.patch(
    `/users/${id}/password`,
    data,
  )

  return response.data
}