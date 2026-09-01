import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { z } from 'zod'

import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { resetPasswordRequest } from '../services/authService'

import '../styles/auth.css'

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Informe a nova senha')
      .min(
        6,
        'A senha deve ter pelo menos 6 caracteres',
      ),

    confirmPassword: z
      .string()
      .min(1, 'Confirme a nova senha'),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    },
  )

type ResetPasswordFormData = z.infer<
  typeof resetPasswordSchema
>

export function ResetPasswordPage() {
  useDocumentTitle('Redefinir senha')

  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const token =
    searchParams.get('token')

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(
      resetPasswordSchema,
    ),
  })

  async function onSubmit(
    data: ResetPasswordFormData,
  ) {
    setError('')
    setSuccess('')

    if (!token) {
      setError(
        'Link de recuperação inválido.',
      )

      return
    }

    try {
      await resetPasswordRequest(
        token,
        data.newPassword,
      )

      setSuccess(
        'Senha redefinida com sucesso.',
      )

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            'Não foi possível redefinir a senha.',
        )

        return
      }

      setError(
        'Não foi possível redefinir a senha.',
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
            Crie uma nova senha para
            sua conta.
          </h1>

          <p>
            Escolha uma senha segura
            para recuperar o acesso ao
            sistema.
          </p>

          <div className="auth-brand-badge">
            Token válido por 15 minutos
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-mobile-logo">
              UserFlow
            </span>

            <h2>Redefinir senha</h2>

            <p>
              Digite e confirme sua
              nova senha.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit(
              onSubmit,
            )}
          >
            <div className="form-group">
              <label htmlFor="newPassword">
                Nova senha
              </label>

              <div className="password-field">
                <input
                  id="newPassword"
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  autoFocus
                  {...register(
                    'newPassword',
                  )}
                />

                <button
                  className="password-toggle"
                  type="button"
                  aria-label={
                    showNewPassword
                      ? 'Ocultar nova senha'
                      : 'Mostrar nova senha'
                  }
                  aria-pressed={
                    showNewPassword
                  }
                  onClick={() =>
                    setShowNewPassword(
                      (current) =>
                        !current,
                    )
                  }
                >
                  {showNewPassword
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>
              </div>

              {errors.newPassword && (
                <span className="field-error">
                  {
                    errors.newPassword
                      .message
                  }
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmar senha
              </label>

              <div className="password-field">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  {...register(
                    'confirmPassword',
                  )}
                />

                <button
                  className="password-toggle"
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmação da senha'
                      : 'Mostrar confirmação da senha'
                  }
                  aria-pressed={
                    showConfirmPassword
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current,
                    )
                  }
                >
                  {showConfirmPassword
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>
              </div>

              {errors.confirmPassword && (
                <span className="field-error">
                  {
                    errors
                      .confirmPassword
                      .message
                  }
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

            {success && (
              <div
                className="auth-success"
                role="status"
                aria-live="polite"
              >
                {success}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Redefinindo...'
                : 'Redefinir senha'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login">
              Voltar para o login
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}