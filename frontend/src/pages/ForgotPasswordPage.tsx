import axios from 'axios'
import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { forgotPasswordRequest } from '../services/authService'

import '../styles/auth.css'

export function ForgotPasswordPage() {
  useDocumentTitle('Recuperar senha')

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Informe o e-mail.')
      return
    }

    setIsSubmitting(true)

    try {
      const response =
        await forgotPasswordRequest(email)

      navigate(
        `/redefinir-senha?token=${encodeURIComponent(
          response.resetToken,
        )}`,
      )
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            'Não foi possível iniciar a recuperação.',
        )
      } else {
        setError(
          'Não foi possível iniciar a recuperação.',
        )
      }
    } finally {
      setIsSubmitting(false)
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
            Recupere o acesso à sua conta.
          </h1>

          <p>
            Informe seu e-mail para iniciar
            o processo seguro de redefinição
            da sua senha.
          </p>

          <div className="auth-brand-badge">
            Recuperação segura
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-mobile-logo">
              UserFlow
            </span>

            <h2>Esqueceu sua senha?</h2>

            <p>
              Digite o e-mail cadastrado na
              sua conta.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
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
                autoFocus
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
              />
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
                ? 'Verificando...'
                : 'Continuar'}
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