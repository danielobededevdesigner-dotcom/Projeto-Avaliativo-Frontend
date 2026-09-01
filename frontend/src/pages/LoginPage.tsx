import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

import {
  loginSchema,
  type LoginFormData,
} from '../schemas/loginSchema'

import { loginRequest } from '../services/authService'

import '../styles/auth.css'

export function LoginPage() {
  useDocumentTitle('Login')

  const navigate = useNavigate()
  const { login } = useAuth()

  const [error, setError] = useState('')
  const [showPassword, setShowPassword] =
    useState(false)

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(
    data: LoginFormData,
  ) {
    setError('')

    try {
      const response =
        await loginRequest(data)

      login(response.token)
      navigate('/')
    } catch {
      setError(
        'E-mail ou senha inválidos.',
      )
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="auth-aurora auth-aurora-one" />
        <div className="auth-aurora auth-aurora-two" />
        <div className="auth-aurora auth-aurora-three" />

        <div className="auth-glass-layer" />

        <div className="auth-brand-content">
          <span className="auth-logo">
            UserFlow
          </span>

          <h1>
            Gerencie usuários de forma
            simples e eficiente.
          </h1>

          <p>
            Uma experiência moderna para
            gerenciamento, cadastro e
            manutenção de usuários.
          </p>

          <div className="auth-brand-badge">
            React + TypeScript
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-mobile-logo">
              UserFlow
            </span>

            <h2>Bem-vindo de volta</h2>

            <p>
              Entre com seus dados para
              acessar o sistema.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="form-group">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register('email')}
              />

              {errors.email && (
                <span className="field-error">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Senha
              </label>

              <div className="password-field">
                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  {...register('password')}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                >
                  {showPassword
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>
              </div>

              <div className="forgot-password-container">
                <Link
                  className="forgot-password-link"
                  to="/recuperar-senha"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              {errors.password && (
                <span className="field-error">
                  {errors.password.message}
                </span>
              )}
            </div>

            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Entrando...'
                : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Ainda não possui uma conta?
            </span>

            <Link to="/cadastro">
              Criar conta
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}