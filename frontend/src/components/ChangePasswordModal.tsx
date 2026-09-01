import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  useEffect,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useAuth } from '../hooks/useAuth'
import { useModalClose } from '../hooks/useModalClose'
import { changePassword } from '../services/userService'

import '../styles/modal.css'

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(
        1,
        'Informe a senha atual',
      ),

    newPassword: z
      .string()
      .min(
        1,
        'Informe a nova senha',
      )
      .min(
        6,
        'A nova senha deve ter pelo menos 6 caracteres',
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        'Confirme a nova senha',
      ),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message:
        'As senhas não coincidem',
      path: ['confirmPassword'],
    },
  )

type ChangePasswordFormData =
  z.infer<
    typeof changePasswordSchema
  >

type ChangePasswordModalProps = {
  userId: number
  onClose: () => void
}

export function ChangePasswordModal({
  userId,
  onClose,
}: ChangePasswordModalProps) {
  const { logout } = useAuth()

  const [countdown, setCountdown] =
    useState(7)

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false)

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
    reset,
    formState: { errors },
  } =
    useForm<ChangePasswordFormData>({
      resolver: zodResolver(
        changePasswordSchema,
      ),
    })

  const mutation = useMutation({
    mutationFn: (
      data: ChangePasswordFormData,
    ) =>
      changePassword(userId, {
        currentPassword:
          data.currentPassword,

        newPassword:
          data.newPassword,
      }),

    onSuccess: () => {
      reset()
      setCountdown(7)
    },
  })

  /*
   * O modal pode ser fechado somente
   * enquanto nenhuma alteração estiver
   * acontecendo e antes do sucesso.
   *
   * Após alterar a senha, o logout
   * obrigatório não pode ser cancelado.
   */
  const canCloseModal =
    !mutation.isPending &&
    !mutation.isSuccess

  const { handleBackdropClick } =
    useModalClose(
      onClose,
      canCloseModal,
    )

  useEffect(() => {
    if (!mutation.isSuccess) {
      return
    }

    const interval = window.setInterval(
      () => {
        setCountdown((current) => {
          if (current <= 1) {
            window.clearInterval(
              interval,
            )

            logout()

            return 0
          }

          return current - 1
        })
      },
      1000,
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [mutation.isSuccess, logout])

  function onSubmit(
    data: ChangePasswordFormData,
  ) {
    mutation.reset()
    mutation.mutate(data)
  }

  function getErrorMessage() {
    if (!mutation.error) {
      return ''
    }

    if (
      axios.isAxiosError(
        mutation.error,
      )
    ) {
      return (
        mutation.error.response?.data
          ?.message ??
        'Não foi possível alterar a senha.'
      )
    }

    return 'Não foi possível alterar a senha.'
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={
        handleBackdropClick
      }
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <header className="modal-header">
          <h2 id="change-password-title">
            Alterar senha
          </h2>

          <p>
            Para sua segurança, informe
            sua senha atual antes de
            definir uma nova.
          </p>
        </header>

        <div className="modal-body">
          {mutation.isSuccess ? (
            <div className="password-success-content">
              <div
                className="password-success-icon"
                aria-hidden="true"
              >
                ✓
              </div>

              <h3>
                Senha alterada com sucesso!
              </h3>

              <p>
                Sua sessão será encerrada
                para que você entre
                novamente utilizando sua
                nova senha.
              </p>

              <div
                className="logout-countdown"
                aria-live="polite"
              >
                Redirecionando para o login
                em{' '}
                <strong>
                  {countdown}
                </strong>{' '}
                {countdown === 1
                  ? 'segundo'
                  : 'segundos'}...
              </div>

              <div className="countdown-bar">
                <div
                  className="countdown-bar-progress"
                  style={{
                    width: `${
                      (countdown / 7) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <form
              className="modal-form"
              onSubmit={handleSubmit(
                onSubmit,
              )}
            >
              <div className="modal-field">
                <label htmlFor="currentPassword">
                  Senha atual
                </label>

                <div className="modal-password-field">
                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Digite sua senha atual"
                    autoComplete="current-password"
                    autoFocus
                    disabled={
                      mutation.isPending
                    }
                    {...register(
                      'currentPassword',
                    )}
                  />

                  <button
                    className="modal-password-toggle"
                    type="button"
                    disabled={
                      mutation.isPending
                    }
                    aria-label={
                      showCurrentPassword
                        ? 'Ocultar senha atual'
                        : 'Mostrar senha atual'
                    }
                    aria-pressed={
                      showCurrentPassword
                    }
                    onClick={() =>
                      setShowCurrentPassword(
                        (current) =>
                          !current,
                      )
                    }
                  >
                    {showCurrentPassword
                      ? 'Ocultar'
                      : 'Mostrar'}
                  </button>
                </div>

                {errors.currentPassword && (
                  <span className="modal-field-error">
                    {
                      errors
                        .currentPassword
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="modal-field">
                <label htmlFor="newPassword">
                  Nova senha
                </label>

                <div className="modal-password-field">
                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Mínimo de 6 caracteres"
                    autoComplete="new-password"
                    disabled={
                      mutation.isPending
                    }
                    {...register(
                      'newPassword',
                    )}
                  />

                  <button
                    className="modal-password-toggle"
                    type="button"
                    disabled={
                      mutation.isPending
                    }
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
                  <span className="modal-field-error">
                    {
                      errors
                        .newPassword
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="modal-field">
                <label htmlFor="confirmPassword">
                  Confirmar nova senha
                </label>

                <div className="modal-password-field">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Digite novamente"
                    autoComplete="new-password"
                    disabled={
                      mutation.isPending
                    }
                    {...register(
                      'confirmPassword',
                    )}
                  />

                  <button
                    className="modal-password-toggle"
                    type="button"
                    disabled={
                      mutation.isPending
                    }
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
                  <span className="modal-field-error">
                    {
                      errors
                        .confirmPassword
                        .message
                    }
                  </span>
                )}
              </div>

              {mutation.isError && (
                <div
                  className="modal-error"
                  role="alert"
                >
                  {getErrorMessage()}
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="modal-button modal-button-secondary"
                  type="button"
                  onClick={onClose}
                  disabled={
                    mutation.isPending
                  }
                >
                  Cancelar
                </button>

                <button
                  className="modal-button modal-button-primary"
                  type="submit"
                  disabled={
                    mutation.isPending
                  }
                >
                  {mutation.isPending
                    ? 'Alterando...'
                    : 'Alterar senha'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}