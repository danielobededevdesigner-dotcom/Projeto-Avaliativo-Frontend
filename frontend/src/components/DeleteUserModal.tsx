import type { User } from '../types/user'

import '../styles/modal.css'

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
    <div
      className="modal-overlay"
      role="presentation"
    >
      <section
        className="modal-card delete-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
      >
        <div className="modal-body delete-modal-content">
          <div className="delete-modal-icon">
            !
          </div>

          <h2 id="delete-user-title">
            Excluir usuário?
          </h2>

          <p className="delete-modal-description">
            Tem certeza de que deseja excluir{' '}
            <strong>{user.name}</strong>?
          </p>

          <p className="delete-modal-warning">
            Esta ação não poderá ser desfeita.
          </p>

          <div className="delete-user-preview">
            <div className="delete-user-avatar">
              {user.name
                .trim()
                .split(' ')
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>

              <span>{user.email}</span>

              <small>
                ID #{user.id}
              </small>
            </div>
          </div>

          {error && (
            <div
              className="modal-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="modal-actions delete-modal-actions">
            <button
              className="modal-button modal-button-secondary"
              type="button"
              disabled={isDeleting}
              onClick={onCancel}
            >
              Cancelar
            </button>

            <button
              className="modal-button modal-button-danger"
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
            >
              {isDeleting
                ? 'Excluindo...'
                : 'Excluir usuário'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}