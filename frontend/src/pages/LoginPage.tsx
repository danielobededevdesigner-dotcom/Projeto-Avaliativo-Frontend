import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { loginRequest } from '../services/authService'
import {
  loginSchema,
  type LoginFormData,
} from '../schemas/loginSchema'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function handleLogin(data: LoginFormData) {
    try {
      setError('')

      const response = await loginRequest(data)

      login(response.token)

      navigate('/')
    } catch {
      setError('E-mail ou senha inválidos.')
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(handleLogin)}>
        {error && <p>{error}</p>}

        <div>
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            placeholder="admin@example.com"
            {...register('email')}
          />

          {errors.email && (
            <p>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Senha</label>

          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            {...register('password')}
          />

          {errors.password && (
            <p>{errors.password.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p>
        Não possui conta?{' '}
        <Link to="/cadastro">
          Cadastre-se
        </Link>
      </p>
    </main>
  )
}