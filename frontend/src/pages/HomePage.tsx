import { useState } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { ChangePasswordModal } from '../components/ChangePasswordModal'
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

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false)

  const [editingUser, setEditingUser] =
    useState<User | null>(null)

  const [deletingUser, setDeletingUser] =
    useState<User | null>(null)

  const [createError, setCreateError] = useState('')
  const [editError, setEditError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const {
    data,
    isLoading,
    isError,
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
        'Não foi possível atualizar o usuário.',
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
        setPage(
          (currentPage) => currentPage - 1,
        )
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

  const totalPages = Math.max(
    1,
    Math.ceil(
      (data?.total ?? 0) / ITEMS_PER_PAGE,
    ),
  )

  return (
    <main>
      <header>
        <h1>Usuários</h1>

        <p>
          Usuário autenticado: ID {userId}
        </p>

        <button
          type="button"
          onClick={() => {
            setCreateError('')
            setIsCreateModalOpen(true)
          }}
        >
          Novo usuário
        </button>

        {userId !== null && (
          <button
            type="button"
            onClick={() =>
              setIsChangePasswordModalOpen(true)
            }
          >
            Alterar minha senha
          </button>
        )}

        <button
          type="button"
          onClick={logout}
        >
          Sair
        </button>
      </header>

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
            <div>
              {data.users.map((user) => (
                <div key={user.id}>
                  <h2>{user.name}</h2>

                  <p>{user.email}</p>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedUserId(user.id)
                    }
                  >
                    Ver detalhes
                  </button>

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
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError('')
                      setDeletingUser(user)
                    }}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>

            <div>
              <p>
                Total de usuários: {data.total}
              </p>

              <p>
                Página {page} de {totalPages}
              </p>

              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  setPage(
                    (currentPage) =>
                      currentPage - 1,
                  )
                }
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage(
                    (currentPage) =>
                      currentPage + 1,
                  )
                }
              >
                Próxima
              </button>
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
            isSubmitting={
              createUserMutation.isPending
            }
            onClose={() => {
              setCreateError('')
              setIsCreateModalOpen(false)
            }}
            onSubmit={async (formData) => {
              setCreateError('')

              await createUserMutation.mutateAsync(
                formData as CreateUserData,
              )
            }}
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
            isSubmitting={
              updateUserMutation.isPending
            }
            onClose={() => {
              setEditError('')
              setEditingUser(null)
            }}
            onSubmit={async (formData) => {
              setEditError('')

              await updateUserMutation.mutateAsync({
                id: editingUser.id,
                data: formData as UpdateUserData,
              })
            }}
          />
        </div>
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          isDeleting={
            deleteUserMutation.isPending
          }
          error={deleteError}
          onCancel={() => {
            setDeleteError('')
            setDeletingUser(null)
          }}
          onConfirm={() =>
            deleteUserMutation.mutate(
              deletingUser.id,
            )
          }
        />
      )}

      {isChangePasswordModalOpen &&
        userId !== null && (
          <ChangePasswordModal
            userId={userId}
            onClose={() =>
              setIsChangePasswordModalOpen(false)
            }
          />
        )}
    </main>
  )
}