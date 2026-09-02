import {
  useEffect,
  useRef,
  type MouseEvent,
} from 'react'

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useModalClose(
  onClose: () => void,
  enabled = true,
) {
  const modalRef =
    useRef<HTMLElement>(null)

  const onCloseRef =
    useRef(onClose)

  const enabledRef =
    useRef(enabled)

  /*
   * Mantém os valores mais recentes
   * disponíveis para os eventos.
   */
  onCloseRef.current = onClose
  enabledRef.current = enabled

  useEffect(() => {
    const modalElement =
      modalRef.current

    if (modalElement === null) {
      return
    }

    /*
     * Depois da verificação acima,
     * criamos uma referência explicitamente
     * não nula para usar nas funções internas.
     */
    const modal: HTMLElement =
      modalElement

    /*
     * Guarda o elemento que possuía foco
     * antes do modal ser aberto.
     */
    const previouslyFocusedElement =
      document.activeElement instanceof
      HTMLElement
        ? document.activeElement
        : null

    /*
     * Bloqueia a rolagem da página
     * atrás do modal.
     */
    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    function getFocusableElements() {
      return Array.from(
        modal.querySelectorAll<HTMLElement>(
          FOCUSABLE_ELEMENTS,
        ),
      ).filter(
        (element) =>
          !element.hasAttribute(
            'disabled',
          ),
      )
    }

    /*
     * Coloca o foco dentro do modal
     * quando ele abrir.
     */
    const animationFrameId =
      window.requestAnimationFrame(
        () => {
          if (
            !modal.contains(
              document.activeElement,
            )
          ) {
            const focusableElements =
              getFocusableElements()

            if (
              focusableElements.length >
              0
            ) {
              focusableElements[0].focus()
            } else {
              modal.focus()
            }
          }
        },
      )

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      /*
       * ESC fecha o modal somente
       * quando o fechamento estiver
       * habilitado.
       */
      if (
        event.key === 'Escape' &&
        enabledRef.current
      ) {
        event.preventDefault()

        onCloseRef.current()

        return
      }

      /*
       * A partir daqui tratamos
       * apenas a tecla TAB.
       */
      if (event.key !== 'Tab') {
        return
      }

      const focusableElements =
        getFocusableElements()

      /*
       * Caso o modal não tenha nenhum
       * elemento interativo, mantém o
       * foco no próprio modal.
       */
      if (
        focusableElements.length === 0
      ) {
        event.preventDefault()

        modal.focus()

        return
      }

      const firstElement =
        focusableElements[0]

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ]

      const activeElement =
        document.activeElement

      /*
       * Shift + Tab no primeiro item
       * leva para o último.
       */
      if (
        event.shiftKey &&
        activeElement === firstElement
      ) {
        event.preventDefault()

        lastElement.focus()

        return
      }

      /*
       * Tab no último item
       * leva para o primeiro.
       */
      if (
        !event.shiftKey &&
        activeElement === lastElement
      ) {
        event.preventDefault()

        firstElement.focus()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.cancelAnimationFrame(
        animationFrameId,
      )

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      document.body.style.overflow =
        previousOverflow

      /*
       * Devolve o foco para o elemento
       * utilizado antes de abrir o modal.
       */
      previouslyFocusedElement?.focus()
    }
  }, [])

  function handleBackdropClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (!enabledRef.current) {
      return
    }

    if (
      event.target ===
      event.currentTarget
    ) {
      onCloseRef.current()
    }
  }

  return {
    modalRef,
    handleBackdropClick,
  }
}