import { zodResolver } from '@hookform/resolvers/zod'
import {
  useEffect,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useModalClose } from '../hooks/useModalClose'

import type {
  CreateUserData,
  UpdateUserData,
  User,
} from '../types/user'

import '../styles/modal.css'

const createSchema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome')
    .min(
      2,
      'O nome deve ter pelo menos 2 caracteres',
    ),

  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('Informe um e-mail válido'),

  password: z
    .string()
    .min(1, 'Informe a senha')
    .min(
      6,
      'A senha deve ter pelo menos 6 caracteres',
    ),
})

const editSchema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome')
    .min(
      2,
      'O nome deve ter pelo menos 2 caracteres',
    ),

  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('Informe um e-mail válido'),
})

type FormData = {
  name: string
  email: string
  password?: string
}

type UserFormModalProps = {
  mode: 'create' | 'edit'

  user?: User | null

  error?: string

  onClose: () => void

  onSubmit: (
    data:
      | CreateUserData
      | UpdateUserData,
  ) => Promise<void>

  isSubmitting: boolean
}

export function UserFormModal({
  mode,
  user,
  error = '',
  onClose,
  onSubmit,
  isSubmitting,
}: UserFormModalProps) {
  const isCreate = mode === 'create'

  /*
   * Permite fechar o modal com Esc
   * ou clicando no fundo escuro.
   *
   * Durante o salvamento, o fechamento
   * fica bloqueado para evitar interromper
   * a operação.
   */
  const { handleBackdropClick } =
    useModalClose(
      onClose,
      !isSubmitting,
    )

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(
      isCreate
        ? createSchema
        : editSchema,
    ),

    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    },
  })

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    })

    setShowPassword(false)
  }, [user, reset])

  async function submitForm(
    data: FormData,
  ) {
    try {
      if (isCreate) {
        await onSubmit({
          name: data.name,
          email: data.email,
          password:
            data.password ?? '',
        })

        return
      }

      await onSubmit({
        name: data.name,
        email: data.email,
      })
    } catch {
      /*
       * O erro da API é tratado
       * pelo HomePage e recebido
       * através da prop "error".
       */
    }
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
        aria-labelledby="user-form-title"
      >
        <header className="modal-header">
          <h2 id="user-form-title">
            {isCreate
              ? 'Novo usuário'
              : 'Editar usuário'}
          </h2>

          <p>
            {isCreate
              ? 'Preencha os dados para cadastrar um novo usuário.'
              : 'Atualize as informações do usuário selecionado.'}
          </p>
        </header>

        <div className="modal-body">
          <form
            className="modal-form"
            onSubmit={handleSubmit(
              submitForm,
            )}
          >
            <div className="modal-field">
              <label htmlFor="user-name">
                Nome
              </label>

              <input
                id="user-name"
                type="text"
                placeholder="Nome do usuário"
                autoComplete="name"
                autoFocus
                disabled={isSubmitting}
                {...register('name')}
              />

              {errors.name && (
                <span className="modal-field-error">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="modal-field">
              <label htmlFor="user-email">
                E-mail
              </label>

              <input
                id="user-email"
                type="email"
                placeholder="usuario@email.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register('email')}
              />

              {errors.email && (
                <span className="modal-field-error">
                  {errors.email.message}
                </span>
              )}
            </div>

            {isCreate && (
              <div className="modal-field">
                <label htmlFor="user-password">
                  Senha
                </label>

                <div className="modal-password-field">
                  <input
                    id="user-password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Mínimo de 6 caracteres"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...register(
                      'password',
                    )}
                  />

                  <button
                    className="modal-password-toggle"
                    type="button"
                    disabled={isSubmitting}
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
                  <span className="modal-field-error">
                    {
                      errors.password
                        .message
                    }
                  </span>
                )}
              </div>
            )}

            {error && (
              <div
                className="modal-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="modal-button modal-button-secondary"
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
              >
                Cancelar
              </button>

              <button
                className="modal-button modal-button-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Salvando...'
                  : isCreate
                    ? 'Cadastrar'
                    : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}