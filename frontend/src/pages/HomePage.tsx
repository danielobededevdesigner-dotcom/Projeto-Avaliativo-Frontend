import { useState } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { DeleteUserModal } from '../components/DeleteUserModal'
import { UserDetailsModal } from '../components/UserDetailsModal'
import { UserFormModal } from '../components/UserFormModal'
import { useAuth } from '../hooks/useAuth'
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../services/userService'
import type {
  CreateUserData,
  UpdateUserData,
  User,
} from '../types/user'

const ITEMS_PER_PAGE = 5

export function HomePage() {
  const { userId, logout } = useAuth()

  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)

  const [selectedUserId, setSelectedUserId] =
    useState<number | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false)

  const [editingUser, setEditingUser] =
    useState<User | null>(null)

  const [deletingUser, setDeletingUser] =
    useState<User | null>(null)

  const [createError, setCreateError] =
    useState('')

  const [editError, setEditError] =
    useState('')

  const [deleteError, setDeleteError] =
    useState('')

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['users', page, ITEMS_PER_PAGE],
    queryFn: () => getUsers(page, ITEMS_PER_PAGE),
  })

  const createUserMutation = useMutation({
    mutationFn: createUser,

    onSuccess: async () => {
      setCreateError('')
      setIsCreateModalOpen(false)

      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },

    onError: () => {
      setCreateError(
        'Não foi possível criar o usuário.',
      )
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateUserData
    }) => updateUser(id, data),

    onSuccess: async () => {
      setEditError('')
      setEditingUser(null)

      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })

      await queryClient.invalidateQueries({
        queryKey: ['user'],
      })
    },

    onError: () => {
      setEditError(
        'Não foi possível editar o usuário.',
      )
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: async () => {
      setDeleteError('')
      setDeletingUser(null)

      const isLastItemOnPage =
        data?.users.length === 1 && page > 1

      if (isLastItemOnPage) {
        setPage((currentPage) => currentPage - 1)
      }

      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },

    onError: () => {
      setDeleteError(
        'Não foi possível excluir o usuário.',
      )
    },
  })

  const totalUsers = data?.total ?? 0

  const totalPages = Math.max(
    1,
    Math.ceil(totalUsers / ITEMS_PER_PAGE),
  )

  function goToPreviousPage() {
    setPage((currentPage) =>
      Math.max(currentPage - 1, 1),
    )
  }

  function goToNextPage() {
    setPage((currentPage) =>
      Math.min(currentPage + 1, totalPages),
    )
  }

  return (
    <main>
      <h1>Usuários</h1>

      <button
        type="button"
        onClick={() => {
          setCreateError('')
          setIsCreateModalOpen(true)
        }}
      >
        Novo usuário
      </button>

      <p>
        Usuário autenticado: {userId}
      </p>

      <button
        type="button"
        onClick={logout}
      >
        Sair
      </button>

      {isLoading && (
        <p>Carregando usuários...</p>
      )}

      {isError && (
        <div>
          <p>
            Não foi possível carregar os usuários.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading &&
        !isError &&
        data?.users.length === 0 && (
          <p>Nenhum usuário encontrado.</p>
        )}

      {!isLoading &&
        !isError &&
        data &&
        data.users.length > 0 && (
          <>
            <ul>
              {data.users.map((user) => (
                <li key={user.id}>
                  {user.name} - {user.email}{' '}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedUserId(user.id)
                    }
                  >
                    Ver detalhes
                  </button>{' '}

                  {user.id === userId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditError('')
                        setEditingUser(user)
                      }}
                    >
                      Editar
                    </button>
                  )}{' '}

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError('')
                      setDeletingUser(user)
                    }}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>

            <div>
              <p>
                Total de usuários: {totalUsers}
              </p>

              <p>
                Página {page} de {totalPages}
              </p>

              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={
                  page === 1 || isFetching
                }
              >
                Anterior
              </button>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={
                  page >= totalPages ||
                  isFetching
                }
              >
                Próxima
              </button>

              {isFetching && (
                <span> Carregando...</span>
              )}
            </div>
          </>
        )}

      {selectedUserId !== null && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() =>
            setSelectedUserId(null)
          }
        />
      )}

      {isCreateModalOpen && (
        <div>
          {createError && (
            <p>{createError}</p>
          )}

          <UserFormModal
            mode="create"
            onClose={() => {
              setCreateError('')
              setIsCreateModalOpen(false)
            }}
            onSubmit={async (data) => {
              await createUserMutation.mutateAsync(
                data as CreateUserData,
              )
            }}
            isSubmitting={
              createUserMutation.isPending
            }
          />
        </div>
      )}

      {editingUser && (
        <div>
          {editError && (
            <p>{editError}</p>
          )}

          <UserFormModal
            mode="edit"
            user={editingUser}
            onClose={() => {
              setEditError('')
              setEditingUser(null)
            }}
            onSubmit={async (data) => {
              await updateUserMutation.mutateAsync({
                id: editingUser.id,
                data: data as UpdateUserData,
              })
            }}
            isSubmitting={
              updateUserMutation.isPending
            }
          />
        </div>
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          error={deleteError}
          isDeleting={
            deleteUserMutation.isPending
          }
          onCancel={() => {
            setDeleteError('')
            setDeletingUser(null)
          }}
          onConfirm={() => {
            deleteUserMutation.mutate(
              deletingUser.id,
            )
          }}
        />
      )}
    </main>
  )
}