import type { User } from '../types/user'

type DeleteUserModalProps = {
  user: User
  isDeleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteUserModal({
  user,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteUserModalProps) {
  return (
    <div>
      <h2>Excluir usuário</h2>

      <p>
        Tem certeza que deseja excluir{' '}
        <strong>{user.name}</strong>?
      </p>

      <p>
        Esta ação não poderá ser desfeita.
      </p>

      {error && (
        <p>{error}</p>
      )}

      <button
        type="button"
        onClick={onCancel}
        disabled={isDeleting}
      >
        Cancelar
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
      >
        {isDeleting
          ? 'Excluindo...'
          : 'Excluir'}
      </button>
    </div>
  )
}