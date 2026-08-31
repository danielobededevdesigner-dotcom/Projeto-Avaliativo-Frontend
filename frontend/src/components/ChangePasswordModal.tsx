import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { changePassword } from '../services/userService'

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Informe a senha atual'),

    newPassword: z
      .string()
      .min(1, 'Informe a nova senha')
      .min(6, 'A nova senha deve ter pelo menos 6 caracteres'),

    confirmPassword: z
      .string()
      .min(1, 'Confirme a nova senha'),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    },
  )

type ChangePasswordFormData = z.infer<
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      changePassword(userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),

    onSuccess: () => {
      reset()
    },
  })

  function onSubmit(data: ChangePasswordFormData) {
    mutation.reset()
    mutation.mutate(data)
  }

  function getErrorMessage() {
    if (!mutation.error) {
      return ''
    }

    if (axios.isAxiosError(mutation.error)) {
      return (
        mutation.error.response?.data?.message ??
        'Não foi possível alterar a senha.'
      )
    }

    return 'Não foi possível alterar a senha.'
  }

  return (
    <div>
      <h2>Alterar senha</h2>

      {mutation.isSuccess ? (
        <>
          <p>Senha alterada com sucesso.</p>

          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="currentPassword">
              Senha atual
            </label>

            <input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
            />

            {errors.currentPassword && (
              <p>{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword">
              Nova senha
            </label>

            <input
              id="newPassword"
              type="password"
              {...register('newPassword')}
            />

            {errors.newPassword && (
              <p>{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword">
              Confirmar nova senha
            </label>

            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
            />

            {errors.confirmPassword && (
              <p>{errors.confirmPassword.message}</p>
            )}
          </div>

          {mutation.isError && (
            <p>{getErrorMessage()}</p>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? 'Alterando...'
              : 'Alterar senha'}
          </button>
        </form>
      )}
    </div>
  )
}