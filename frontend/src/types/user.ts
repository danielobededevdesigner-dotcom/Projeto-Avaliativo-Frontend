export type User = {
  id: number
  name: string
  email: string
}

export type CreateUserData = {
  name: string
  email: string
  password: string
}

export type UpdateUserData = {
  name: string
  email: string
}

export type ChangePasswordData = {
  currentPassword: string
  newPassword: string
}

export type UsersResponse = {
  users: User[]
  total: number
  page: number
  limit: number
}