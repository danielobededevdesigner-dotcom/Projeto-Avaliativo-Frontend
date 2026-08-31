import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type {
  CreateUserData,
  UpdateUserData,
  User,
} from '../types/user'

const createSchema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome')
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),

  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('Informe um e-mail válido'),

  password: z
    .string()
    .min(1, 'Informe a senha')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

const editSchema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome')
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),

  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('Informe um e-mail válido'),
})

type CreateFormData = z.infer<typeof createSchema>
type EditFormData = z.infer<typeof editSchema>

type UserFormModalProps = {
  mode: 'create' | 'edit'
  user?: User | null
  onClose: () => void
  onSubmit: (
    data: CreateUserData | UpdateUserData,
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
  const schema =
    mode === 'create'
      ? createSchema
      : editSchema

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData | EditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      ...(mode === 'create'
        ? { password: '' }
        : {}),
    },
  })

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      ...(mode === 'create'
        ? { password: '' }
        : {}),
    })
  }, [mode, user, reset])

  async function handleFormSubmit(
    data: CreateFormData | EditFormData,
  ) {
    if (mode === 'create') {
      await onSubmit(
        data as CreateUserData,
      )
      return
    }

    const { name, email } = data

    await onSubmit({
      name,
      email,
    })
  }

  return (
    <div>
      <h2>
        {mode === 'create'
          ? 'Novo usuário'
          : 'Editar usuário'}
      </h2>

      <form
        onSubmit={handleSubmit(
          handleFormSubmit,
        )}
      >
        <div>
          <label htmlFor="user-name">
            Nome
          </label>

          <input
            id="user-name"
            type="text"
            {...register('name')}
          />

          {errors.name && (
            <p>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="user-email">
            E-mail
          </label>

          <input
            id="user-email"
            type="email"
            {...register('email')}
          />

          {errors.email && (
            <p>{errors.email.message}</p>
          )}
        </div>

        {mode === 'create' && (
          <div>
            <label htmlFor="user-password">
              Senha
            </label>

            <input
              id="user-password"
              type="password"
              {...register('password')}
            />

            {'password' in errors &&
              errors.password && (
                <p>
                  {errors.password.message}
                </p>
              )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Salvando...'
            : 'Salvar'}
        </button>
      </form>
    </div>
  )
}