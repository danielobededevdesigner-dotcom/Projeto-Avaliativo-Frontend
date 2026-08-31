import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import {
  registerSchema,
  type RegisterFormData,
} from '../schemas/registerSchema'
import { createUser } from '../services/userService'

export function RegisterPage() {
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function handleRegister(data: RegisterFormData) {
    try {
      setError('')
      setSuccess('')

      await createUser(data)

      setSuccess('Usuário cadastrado com sucesso.')

      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch {
      setError('Não foi possível realizar o cadastro.')
    }
  }

  return (
    <main>
      <h1>Cadastro</h1>

      <form onSubmit={handleSubmit(handleRegister)}>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}

        <div>
          <label htmlFor="name">Nome</label>

          <input
            id="name"
            type="text"
            placeholder="Seu nome"
            {...register('name')}
          />

          {errors.name && (
            <p>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email">E-mail</label>

          <input
            id="email"
            type="email"
            placeholder="voce@email.com"
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
            type="password"
            placeholder="Sua senha"
            {...register('password')}
          />

          {errors.password && (
            <p>{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p>
        Já possui conta?{' '}
        <Link to="/login">
          Entrar
        </Link>
      </p>
    </main>
  )
}