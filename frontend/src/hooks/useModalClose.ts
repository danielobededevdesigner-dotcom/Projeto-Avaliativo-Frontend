import {
  useEffect,
  type MouseEvent,
} from 'react'

export function useModalClose(
  onClose: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [enabled, onClose])

  function handleBackdropClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (!enabled) {
      return
    }

    if (
      event.target ===
      event.currentTarget
    ) {
      onClose()
    }
  }

  return {
    handleBackdropClick,
  }
}