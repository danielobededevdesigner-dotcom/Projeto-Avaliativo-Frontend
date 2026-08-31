import { useQuery } from '@tanstack/react-query'

import { getUserById } from '../services/userService'

type UserDetailsModalProps = {
  userId: number
  onClose: () => void
}

export function UserDetailsModal({
  userId,
  onClose,
}: UserDetailsModalProps) {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
  })

  return (
    <div>
      <h2>Detalhes do usuário</h2>

      {isLoading && (
        <p>Carregando usuário...</p>
      )}

      {isError && (
        <div>
          <p>Não foi possível carregar o usuário.</p>

          <button
            type="button"
            onClick={() => refetch()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {user && (
        <div>
          <p>
            <strong>ID:</strong> {user.id}
          </p>

          <p>
            <strong>Nome:</strong> {user.name}
          </p>

          <p>
            <strong>E-mail:</strong> {user.email}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
      >
        Fechar
      </button>
    </div>
  )
}