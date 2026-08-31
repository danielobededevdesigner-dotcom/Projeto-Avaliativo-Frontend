export type LoginData = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
}

export type TokenPayload = {
  id: number
  email: string
  exp?: number
}