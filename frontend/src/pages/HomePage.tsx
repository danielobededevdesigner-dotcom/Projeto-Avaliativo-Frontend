import axios from 'axios'
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
  getUserById,
  getUsers,
  updateUser,
} from '../services/userService'

import type {
  CreateUserData,
  UpdateUserData,
  User,
} from '../types/user'

import '../styles/dashboard.css'

const ITEMS_PER_PAGE = 5
const ADMIN_USER_ID = 1

function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      fallbackMessage
    )
  }

  return fallbackMessage
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

export function HomePage() {
  const { userId, logout } = useAuth()
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState<number | null>(null)

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false)

  const [
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
  ] = useState(false)

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

  /*
   * Usuário atualmente conectado.
   */
  const {
    data: currentUser,
    isLoading: isCurrentUserLoading,
  } = useQuery({
    queryKey: ['user', userId],

    queryFn: () =>
      getUserById(userId as number),

    enabled: userId !== null,
  })

  /*
   * Lista paginada de usuários.
   */
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'users',
      page,
      ITEMS_PER_PAGE,
    ],

    queryFn: () =>
      getUsers(
        page,
        ITEMS_PER_PAGE,
      ),
  })

  /*
   * Criar usuário.
   */
  const createUserMutation = useMutation({
    mutationFn: createUser,

    onSuccess: async () => {
      setCreateError('')
      setIsCreateModalOpen(false)

      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },

    onError: (error) => {
      setCreateError(
        getApiErrorMessage(
          error,
          'Não foi possível criar o usuário.',
        ),
      )
    },
  })

  /*
   * Atualizar usuário.
   */
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

      /*
       * Atualiza também os dados individuais.
       *
       * Isso garante que, se o usuário editar
       * a própria conta, nome e e-mail sejam
       * atualizados no cabeçalho.
       */
      await queryClient.invalidateQueries({
        queryKey: ['user'],
      })
    },

    onError: (error) => {
      setEditError(
        getApiErrorMessage(
          error,
          'Não foi possível atualizar o usuário.',
        ),
      )
    },
  })

  /*
   * Excluir usuário.
   */
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: async () => {
      setDeleteError('')
      setDeletingUser(null)

      /*
       * Se o usuário removido era o único
       * registro da página atual, voltamos
       * automaticamente uma página.
       */
      const isLastItemOnPage =
        data?.users.length === 1 &&
        page > 1

      if (isLastItemOnPage) {
        setPage(
          (currentPage) =>
            currentPage - 1,
        )
      }

      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },

    onError: (error) => {
      setDeleteError(
        getApiErrorMessage(
          error,
          'Não foi possível excluir o usuário.',
        ),
      )
    },
  })

  const totalPages = Math.max(
    1,
    Math.ceil(
      (data?.total ?? 0) /
        ITEMS_PER_PAGE,
    ),
  )

  const currentUserName =
    currentUser?.name ??
    (userId !== null
      ? `ID #${userId}`
      : 'Usuário')

  const currentUserInitials =
    currentUser?.name
      ? getInitials(currentUser.name)
      : 'U'

  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">
            U
          </div>

          <div>
            <strong>UserFlow</strong>

            <span>
              Gestão de usuários
            </span>
          </div>
        </div>

        <details className="account-dropdown">
          <summary className="account-trigger">
            <div className="account-avatar">
              {currentUserInitials}
            </div>

            <div className="account-trigger-info">
              <span>
                Minha conta
              </span>

              <strong>
                {isCurrentUserLoading
                  ? 'Carregando...'
                  : currentUserName}
              </strong>

              {currentUser?.email && (
                <small>
                  {currentUser.email}
                </small>
              )}
            </div>

            <span className="account-chevron">
              ▾
            </span>
          </summary>

          <div className="account-menu">
            <div className="account-menu-header">
              <span>
                Usuário conectado
              </span>

              <strong>
                {isCurrentUserLoading
                  ? 'Carregando...'
                  : currentUserName}
              </strong>

              {currentUser?.email && (
                <small>
                  {currentUser.email}
                </small>
              )}

              {userId !== null && (
                <div className="account-menu-user-id">
                  ID #{userId}
                </div>
              )}
            </div>

            <div className="account-menu-divider" />

            <button
              className="account-menu-item"
              type="button"
              onClick={() =>
                setIsChangePasswordModalOpen(
                  true,
                )
              }
            >
              <span className="account-menu-icon">
                🔒
              </span>

              <div>
                <strong>
                  Alterar senha
                </strong>

                <small>
                  Atualize sua senha de acesso
                </small>
              </div>
            </button>

            <div className="account-menu-divider" />

            <button
              className="account-menu-item account-menu-logout"
              type="button"
              onClick={logout}
            >
              <span className="account-menu-icon">
                ↪
              </span>

              <div>
                <strong>
                  Sair
                </strong>

                <small>
                  Encerrar sessão
                </small>
              </div>
            </button>
          </div>
        </details>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <span className="dashboard-eyebrow">
              Painel de usuários
            </span>

            <h1>
              Usuários
            </h1>

            <p>
              Visualize e gerencie os
              usuários cadastrados no
              sistema.
            </p>
          </div>

          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setCreateError('')
              setIsCreateModalOpen(true)
            }}
          >
            <span className="button-plus">
              +
            </span>

            Novo usuário
          </button>
        </div>

        <section className="dashboard-stats">
          <article className="stat-card">
            <span className="stat-label">
              Total de usuários
            </span>

            <strong>
              {data?.total ?? 0}
            </strong>

            <small>
              cadastrados no sistema
            </small>
          </article>

          <article className="stat-card">
            <span className="stat-label">
              Página atual
            </span>

            <strong>
              {page}
            </strong>

            <small>
              de {totalPages} página(s)
            </small>
          </article>

          <article className="stat-card">
            <span className="stat-label">
              Exibindo
            </span>

            <strong>
              {data?.users.length ?? 0}
            </strong>

            <small>
              usuários nesta página
            </small>
          </article>
        </section>

        <section className="users-panel">
          <div className="users-panel-header">
            <div>
              <h2>
                Lista de usuários
              </h2>

              <p>
                Gerencie informações,
                visualize detalhes ou
                remova registros.
              </p>
            </div>

            <span className="users-count">
              {data?.total ?? 0}{' '}
              usuário(s)
            </span>
          </div>

          {isLoading && (
            <div className="state-box">
              <div className="loading-spinner" />

              <p>
                Carregando usuários...
              </p>
            </div>
          )}

          {isError && (
            <div className="state-box">
              <strong>
                Não foi possível carregar
                os usuários.
              </strong>

              <p>
                Verifique sua conexão e
                tente novamente.
              </p>

              <button
                className="button button-primary"
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
            data?.users.length === 0 && (
              <div className="state-box">
                <strong>
                  Nenhum usuário encontrado.
                </strong>

                <p>
                  Crie o primeiro usuário
                  para começar.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            data &&
            data.users.length > 0 && (
              <>
                <div className="users-list">
                  {data.users.map(
                    (user) => {
                      /*
                       * CONTA ADMIN PROTEGIDA
                       *
                       * ID #1 = conta principal.
                       *
                       * - O próprio Admin pode
                       *   editar a sua conta.
                       *
                       * - Outros usuários não
                       *   podem editar o Admin.
                       *
                       * - Ninguém pode excluir
                       *   a conta Admin.
                       */

                      const isAdminAccount =
                        user.id ===
                        ADMIN_USER_ID

                      const isLoggedAdmin =
                        userId ===
                        ADMIN_USER_ID

                      const canEditUser =
                        !isAdminAccount ||
                        isLoggedAdmin

                      const canDeleteUser =
                        !isAdminAccount

                      return (
                        <article
                          className="user-card"
                          key={user.id}
                        >
                          <div className="user-main">
                            <div className="user-avatar">
                              {getInitials(
                                user.name,
                              )}
                            </div>

                            <div className="user-info">
                              <div className="user-name-row">
                                <h3>
                                  {user.name}
                                </h3>

                                {user.id ===
                                  userId && (
                                  <span className="current-user-badge">
                                    Você
                                  </span>
                                )}
                              </div>

                              <p>
                                {user.email}
                              </p>

                              <span className="user-id">
                                ID #{user.id}
                              </span>
                            </div>
                          </div>

                          <div className="user-card-actions">
                            <button
                              className="action-button"
                              type="button"
                              onClick={() =>
                                setSelectedUserId(
                                  user.id,
                                )
                              }
                            >
                              Detalhes
                            </button>

                            {canEditUser && (
                              <button
                                className="action-button action-edit"
                                type="button"
                                onClick={() => {
                                  setEditError(
                                    '',
                                  )

                                  setEditingUser(
                                    user,
                                  )
                                }}
                              >
                                Editar
                              </button>
                            )}

                            {canDeleteUser && (
                              <button
                                className="action-button action-delete"
                                type="button"
                                onClick={() => {
                                  setDeleteError(
                                    '',
                                  )

                                  setDeletingUser(
                                    user,
                                  )
                                }}
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </article>
                      )
                    },
                  )}
                </div>

                <div className="pagination">
                  <div className="pagination-info">
                    Página{' '}
                    <strong>
                      {page}
                    </strong>{' '}
                    de{' '}
                    <strong>
                      {totalPages}
                    </strong>
                  </div>

                  <div className="pagination-buttons">
                    <button
                      className="pagination-button"
                      type="button"
                      disabled={
                        page === 1
                      }
                      onClick={() =>
                        setPage(
                          (
                            currentPage,
                          ) =>
                            currentPage -
                            1,
                        )
                      }
                    >
                      ← Anterior
                    </button>

                    <span className="pagination-current">
                      {page}
                    </span>

                    <button
                      className="pagination-button"
                      type="button"
                      disabled={
                        page >=
                        totalPages
                      }
                      onClick={() =>
                        setPage(
                          (
                            currentPage,
                          ) =>
                            currentPage +
                            1,
                        )
                      }
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              </>
            )}
        </section>
      </section>

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
            <p className="page-error">
              {createError}
            </p>
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
            onSubmit={async (
              formData,
            ) => {
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
            <p className="page-error">
              {editError}
            </p>
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
            onSubmit={async (
              formData,
            ) => {
              setEditError('')

              await updateUserMutation.mutateAsync(
                {
                  id: editingUser.id,

                  data:
                    formData as UpdateUserData,
                },
              )
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
              setIsChangePasswordModalOpen(
                false,
              )
            }
          />
        )}
    </main>
  )
}