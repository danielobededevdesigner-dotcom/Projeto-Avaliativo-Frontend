import { useEffect } from 'react'

export function useDocumentTitle(
  title: string,
) {
  useEffect(() => {
    document.title = `${title} | UserFlow`

    return () => {
      document.title = 'UserFlow'
    }
  }, [title])
}