import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
  onClose,
  onSubmit,
  isSubmitting,
}: UserFormModalProps) {
  const isCreate = mode === 'create'

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
  }, [user, reset])

  async function submitForm(
    data: FormData,
  ) {
    if (isCreate) {
      await onSubmit({
        name: data.name,
        email: data.email,
        password: data.password ?? '',
      })

      return
    }

    await onSubmit({
      name: data.name,
      email: data.email,
    })
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
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

                <input
                  id="user-password"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  {...register('password')}
                />

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