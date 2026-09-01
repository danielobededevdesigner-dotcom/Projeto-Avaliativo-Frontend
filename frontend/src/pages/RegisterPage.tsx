import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useDocumentTitle } from '../hooks/useDocumentTitle'

import {
  registerSchema,
  type RegisterFormData,
} from '../schemas/registerSchema'

import { createUser } from '../services/userService'

import '../styles/auth.css'

export function RegisterPage() {
  useDocumentTitle('Cadastro')

  const navigate = useNavigate()

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(
      registerSchema,
    ),
  })

  async function onSubmit(
    data: RegisterFormData,
  ) {
    setError('')
    setSuccess('')

    try {
      await createUser(data)

      setSuccess(
        'Conta criada com sucesso! Redirecionando para o login...',
      )

      reset()

      window.setTimeout(() => {
        navigate('/login')
      }, 1800)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message

        setError(
          message ||
            'Não foi possível realizar o cadastro.',
        )

        return
      }

      setError(
        'Não foi possível realizar o cadastro.',
      )
    }
  }

  return (
    <main className="register-auth-page">
      <section className="register-brand">
        <div className="register-aurora register-aurora-one" />
        <div className="register-aurora register-aurora-two" />
        <div className="register-aurora register-aurora-three" />

        <div className="register-glass-layer" />

        <div className="register-brand-content">
          <div className="register-logo">
            UserFlow
          </div>

          <div className="register-brand-copy">
            <h1>
              Comece a gerenciar usuários
              de forma simples.
            </h1>

            <p>
              Crie sua conta e tenha acesso
              a uma experiência moderna para
              gerenciamento, cadastro e
              manutenção de usuários.
            </p>
          </div>

          <div className="register-tech-badge">
            React + TypeScript
          </div>
        </div>
      </section>

      <section className="register-panel">
        <div className="register-card">
          <header className="register-header">
            <span>
              BEM-VINDO AO USERFLOW
            </span>

            <h2>
              Criar conta
            </h2>

            <p>
              Preencha seus dados para
              realizar seu cadastro.
            </p>
          </header>

          {error && (
            <div
              className="register-message register-message-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="register-message register-message-success"
              role="status"
              aria-live="polite"
            >
              <span>✓</span>

              {success}
            </div>
          )}

          <form
            className="register-form"
            onSubmit={handleSubmit(
              onSubmit,
            )}
          >
            <div className="register-field">
              <label htmlFor="name">
                Nome
              </label>

              <input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                autoComplete="name"
                autoFocus
                {...register('name')}
              />

              {errors.name && (
                <span className="register-field-error">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="register-field">
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
                <span className="register-field-error">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="password">
                Senha
              </label>

              <div className="register-password-field">
                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  {...register(
                    'password',
                  )}
                />

                <button
                  className="register-password-toggle"
                  type="button"
                  aria-label={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                  aria-pressed={
                    showPassword
                  }
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

              {errors.password && (
                <span className="register-field-error">
                  {
                    errors.password
                      .message
                  }
                </span>
              )}
            </div>

            <button
              className="register-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Criando conta...'
                : 'Criar conta'}
            </button>
          </form>

          <div className="register-footer">
            <span>
              Já possui uma conta?
            </span>

            <Link to="/login">
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}