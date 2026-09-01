import { useEffect } from 'react'

import '../styles/toast.css'

type ToastProps = {
  message: string
  onClose: () => void
}

export function Toast({
  message,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(
      onClose,
      3500,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [onClose])

  return (
    <div
      className="toast-container"
      role="status"
      aria-live="polite"
    >
      <div className="toast-success-icon">
        ✓
      </div>

      <div className="toast-content">
        <strong>Sucesso</strong>

        <span>{message}</span>
      </div>

      <button
        className="toast-close"
        type="button"
        aria-label="Fechar notificação"
        onClick={onClose}
      >
        ×
      </button>

      <div className="toast-progress" />
    </div>
  )
}