import { useQuery } from '@tanstack/react-query'

import { useModalClose } from '../hooks/useModalClose'
import { getUserById } from '../services/userService'

import '../styles/modal.css'

type UserDetailsModalProps = {
  userId: number
  onClose: () => void
}

function getInitials(name: string) {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function UserDetailsModal({
  userId,
  onClose,
}: UserDetailsModalProps) {
  const { handleBackdropClick } =
    useModalClose(onClose)

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () =>
      getUserById(userId),
  })

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
        aria-labelledby="user-details-title"
      >
        <header className="modal-header">
          <h2 id="user-details-title">
            Detalhes do usuário
          </h2>

          <p>
            Informações do usuário
            selecionado.
          </p>
        </header>

        <div className="modal-body">
          {isLoading && (
            <div className="modal-state">
              <div className="modal-spinner" />

              <p>
                Carregando informações...
              </p>
            </div>
          )}

          {isError && (
            <div className="modal-state">
              <strong>
                Não foi possível carregar
                os detalhes.
              </strong>

              <p>
                Tente novamente.
              </p>

              <button
                className="modal-button modal-button-primary"
                type="button"
                onClick={() =>
                  refetch()
                }
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            user && (
              <>
                <div className="details-profile">
                  <div className="details-avatar">
                    {getInitials(
                      user.name,
                    )}
                  </div>

                  <div>
                    <h3>
                      {user.name}
                    </h3>

                    <span>
                      Usuário #{user.id}
                    </span>
                  </div>
                </div>

                <div className="details-list">
                  <div className="details-item">
                    <span>
                      ID
                    </span>

                    <strong>
                      #{user.id}
                    </strong>
                  </div>

                  <div className="details-item">
                    <span>
                      Nome
                    </span>

                    <strong>
                      {user.name}
                    </strong>
                  </div>

                  <div className="details-item">
                    <span>
                      E-mail
                    </span>

                    <strong>
                      {user.email}
                    </strong>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="modal-button modal-button-primary"
                    type="button"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
        </div>
      </section>
    </div>
  )
}