const SKELETON_ITEMS = 5

export function UserListSkeleton() {
  return (
    <div
      className="users-skeleton"
      role="status"
      aria-live="polite"
      aria-label="Carregando usuários"
    >
      <span className="sr-only">
        Carregando usuários...
      </span>

      {Array.from({
        length: SKELETON_ITEMS,
      }).map((_, index) => (
        <div
          className="user-skeleton-card"
          aria-hidden="true"
          key={index}
        >
          <div className="user-skeleton-main">
            <div className="skeleton-avatar" />

            <div className="skeleton-user-info">
              <div className="skeleton-line skeleton-name" />

              <div className="skeleton-line skeleton-email" />

              <div className="skeleton-line skeleton-id" />
            </div>
          </div>

          <div className="skeleton-actions">
            <div className="skeleton-button" />
            <div className="skeleton-button" />
            <div className="skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  )
}