import axios from 'axios'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { DeleteUserModal } from '../components/DeleteUserModal'
import { Toast } from '../components/Toast'
import { UserDetailsModal } from '../components/UserDetailsModal'
import { UserFormModal } from '../components/UserFormModal'
import { UserListSkeleton } from '../components/UserListSkeleton'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

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
  useDocumentTitle('Usuários')

  const accountDropdownRef =
    useRef<HTMLDetailsElement>(null)

  const { userId, logout } = useAuth()

  const queryClient =
    useQueryClient()

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  /*
   * A página atual é obtida
   * diretamente da URL.
   *
   * /         -> página 1
   * /?page=2 -> página 2
   */
  const rawPageParam =
    searchParams.get('page')

  const parsedPage = Number(
    rawPageParam ?? '1',
  )

  const page =
    Number.isInteger(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1

  /*
   * Atualiza a página na URL.
   *
   * A primeira página utiliza "/".
   */
  function goToPage(
    newPage: number,
  ) {
    const safePage = Math.max(
      1,
      newPage,
    )

    if (safePage === 1) {
      setSearchParams({})

      return
    }

    setSearchParams({
      page: String(safePage),
    })
  }

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState<number | null>(
    null,
  )

  const [
    isCreateModalOpen,
    setIsCreateModalOpen,
  ] = useState(false)

  const [
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
  ] = useState(false)

  const [
    editingUser,
    setEditingUser,
  ] = useState<User | null>(null)

  const [
    deletingUser,
    setDeletingUser,
  ] = useState<User | null>(null)

  const [
    createError,
    setCreateError,
  ] = useState('')

  const [
    editError,
    setEditError,
  ] = useState('')

  const [
    deleteError,
    setDeleteError,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  /*
   * MENU MINHA CONTA
   *
   * Fecha o dropdown quando:
   *
   * - o usuário clicar fora;
   * - pressionar Esc.
   *
   * Ao fechar com Esc, o foco
   * retorna para "Minha conta".
   */
  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent,
    ) {
      const dropdown =
        accountDropdownRef.current

      if (
        !dropdown ||
        !dropdown.open
      ) {
        return
      }

      if (
        event.target instanceof Node &&
        !dropdown.contains(
          event.target,
        )
      ) {
        dropdown.open = false
      }
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key !== 'Escape') {
        return
      }

      const dropdown =
        accountDropdownRef.current

      if (
        !dropdown ||
        !dropdown.open
      ) {
        return
      }

      event.preventDefault()

      dropdown.open = false

      dropdown
        .querySelector<HTMLElement>(
          'summary',
        )
        ?.focus()
    }

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    )

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [])

  /*
   * Usuário atualmente conectado.
   */
  const {
    data: currentUser,
    isLoading:
      isCurrentUserLoading,
  } = useQuery({
    queryKey: [
      'user',
      userId,
    ],

    queryFn: () =>
      getUserById(
        userId as number,
      ),

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
  const createUserMutation =
    useMutation({
      mutationFn: createUser,

      onSuccess: async () => {
        setCreateError('')

        setIsCreateModalOpen(
          false,
        )

        setSuccessMessage(
          'Usuário criado com sucesso.',
        )

        await queryClient.invalidateQueries(
          {
            queryKey: [
              'users',
            ],
          },
        )
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
  const updateUserMutation =
    useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: UpdateUserData
      }) =>
        updateUser(
          id,
          data,
        ),

      onSuccess: async () => {
        setEditError('')
        setEditingUser(null)

        setSuccessMessage(
          'Usuário atualizado com sucesso.',
        )

        await queryClient.invalidateQueries(
          {
            queryKey: [
              'users',
            ],
          },
        )

        /*
         * Atualiza também dados
         * individuais.
         */
        await queryClient.invalidateQueries(
          {
            queryKey: [
              'user',
            ],
          },
        )
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
  const deleteUserMutation =
    useMutation({
      mutationFn: deleteUser,

      onSuccess: async () => {
        setDeleteError('')
        setDeletingUser(null)

        setSuccessMessage(
          'Usuário excluído com sucesso.',
        )

        /*
         * Se era o único usuário
         * da página atual, volta
         * automaticamente uma página.
         */
        const isLastItemOnPage =
          data?.users.length ===
            1 &&
          page > 1

        if (
          isLastItemOnPage
        ) {
          goToPage(
            page - 1,
          )
        }

        await queryClient.invalidateQueries(
          {
            queryKey: [
              'users',
            ],
          },
        )
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

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        (data?.total ?? 0) /
          ITEMS_PER_PAGE,
      ),
    )

  /*
   * Corrige parâmetros inválidos:
   *
   * ?page=abc
   * ?page=0
   * ?page=-2
   * ?page=1
   *
   * Todos voltam para "/".
   */
  useEffect(() => {
    if (
      rawPageParam !== null &&
      page === 1
    ) {
      setSearchParams(
        {},
        {
          replace: true,
        },
      )
    }
  }, [
    rawPageParam,
    page,
    setSearchParams,
  ])

  /*
   * Se a página solicitada for
   * maior que a quantidade existente,
   * redireciona para a última válida.
   */
  useEffect(() => {
    if (
      !isLoading &&
      data &&
      page > totalPages
    ) {
      setSearchParams(
        totalPages === 1
          ? {}
          : {
              page: String(
                totalPages,
              ),
            },
        {
          replace: true,
        },
      )
    }
  }, [
    data,
    isLoading,
    page,
    totalPages,
    setSearchParams,
  ])

  const currentUserName =
    currentUser?.name ??
    (userId !== null
      ? `ID #${userId}`
      : 'Usuário')

  const currentUserInitials =
    currentUser?.name
      ? getInitials(
          currentUser.name,
        )
      : 'U'

  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">
            U
          </div>

          <div>
            <strong>
              UserFlow
            </strong>

            <span>
              Gestão de usuários
            </span>
          </div>
        </div>

        <details
          ref={accountDropdownRef}
          className="account-dropdown"
        >
          <summary className="account-trigger">
            <div className="account-avatar">
              {
                currentUserInitials
              }
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
                  {
                    currentUser.email
                  }
                </small>
              )}
            </div>

            <span
              className="account-chevron"
              aria-hidden="true"
            >
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
                  {
                    currentUser.email
                  }
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
              onClick={() => {
                /*
                 * Fecha o dropdown antes
                 * de abrir o modal.
                 */
                if (
                  accountDropdownRef.current
                ) {
                  accountDropdownRef.current.open =
                    false
                }

                setIsChangePasswordModalOpen(
                  true,
                )
              }}
            >
              <span
                className="account-menu-icon"
                aria-hidden="true"
              >
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
              onClick={() => {
                /*
                 * Fecha o menu antes
                 * de encerrar a sessão.
                 */
                if (
                  accountDropdownRef.current
                ) {
                  accountDropdownRef.current.open =
                    false
                }

                logout()
              }}
            >
              <span
                className="account-menu-icon"
                aria-hidden="true"
              >
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

              setIsCreateModalOpen(
                true,
              )
            }}
          >
            <span
              className="button-plus"
              aria-hidden="true"
            >
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
              de {totalPages}{' '}
              página(s)
            </small>
          </article>

          <article className="stat-card">
            <span className="stat-label">
              Exibindo
            </span>

            <strong>
              {data?.users.length ??
                0}
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
  <UserListSkeleton />
)}

          {isError && (
            <div className="state-box">
              <strong>
                Não foi possível
                carregar os usuários.
              </strong>

              <p>
                Verifique sua conexão
                e tente novamente.
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
            data?.users.length ===
              0 && (
              <div className="state-box">
                <strong>
                  Nenhum usuário
                  encontrado.
                </strong>

                <p>
                  Crie o primeiro
                  usuário para começar.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            data &&
            data.users.length >
              0 && (
              <>
                <div className="users-list">
                  {data.users.map(
                    (user) => {
                      /*
                       * CONTA ADMIN
                       * PROTEGIDA
                       *
                       * ID #1 =
                       * conta principal.
                       *
                       * Admin pode editar
                       * sua própria conta.
                       *
                       * Outros usuários
                       * não podem editar
                       * o Admin.
                       *
                       * Ninguém pode
                       * excluir Admin.
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
                          key={
                            user.id
                          }
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
                                  {
                                    user.name
                                  }
                                </h3>

                                {user.id ===
                                  userId && (
                                  <span className="current-user-badge">
                                    Você
                                  </span>
                                )}
                              </div>

                              <p>
                                {
                                  user.email
                                }
                              </p>

                              <span className="user-id">
                                ID #
                                {
                                  user.id
                                }
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
                        goToPage(
                          page - 1,
                        )
                      }
                    >
                      ← Anterior
                    </button>

                    <span
                      className="pagination-current"
                      aria-current="page"
                    >
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
                        goToPage(
                          page + 1,
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

      {selectedUserId !==
        null && (
        <UserDetailsModal
          userId={
            selectedUserId
          }
          onClose={() =>
            setSelectedUserId(
              null,
            )
          }
        />
      )}

      {isCreateModalOpen && (
        <UserFormModal
          mode="create"
          error={createError}
          isSubmitting={
            createUserMutation.isPending
          }
          onClose={() => {
            setCreateError('')

            setIsCreateModalOpen(
              false,
            )
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
      )}

      {editingUser && (
        <UserFormModal
          mode="edit"
          user={editingUser}
          error={editError}
          isSubmitting={
            updateUserMutation.isPending
          }
          onClose={() => {
            setEditError('')

            setEditingUser(
              null,
            )
          }}
          onSubmit={async (
            formData,
          ) => {
            setEditError('')

            await updateUserMutation.mutateAsync(
              {
                id:
                  editingUser.id,

                data:
                  formData as UpdateUserData,
              },
            )
          }}
        />
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

            setDeletingUser(
              null,
            )
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

      {successMessage && (
        <Toast
          message={
            successMessage
          }
          onClose={() =>
            setSuccessMessage('')
          }
        />
      )}
    </main>
  )
}