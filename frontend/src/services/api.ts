import axios from 'axios'

import { getToken } from '../utils/token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  headers: {
    'Content-Type': 'application/json',
  },
})

let unauthorizedHandler:
  | (() => void)
  | null = null

export function setUnauthorizedHandler(
  handler: () => void,
) {
  unauthorizedHandler = handler
}

/*
 * Antes de cada requisição,
 * adiciona o JWT automaticamente
 * quando houver uma sessão ativa.
 */
api.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },
)

/*
 * Se uma requisição autenticada
 * retornar 401, consideramos que a
 * sessão não é mais válida.
 *
 * A existência do token é verificada
 * para não confundir, por exemplo,
 * um login com senha incorreta com
 * uma sessão expirada.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status

    const token = getToken()

    if (
      status === 401 &&
      token
    ) {
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  },
)