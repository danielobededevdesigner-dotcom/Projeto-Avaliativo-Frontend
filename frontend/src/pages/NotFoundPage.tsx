import { Link } from 'react-router-dom'

import { useDocumentTitle } from '../hooks/useDocumentTitle'

import '../styles/not-found.css'

export function NotFoundPage() {
  useDocumentTitle(
    'Página não encontrada | UserFlow',
  )

  return (
    <main className="not-found-page">
      <div className="not-found-aurora not-found-aurora-one" />
      <div className="not-found-aurora not-found-aurora-two" />

      <section className="not-found-card">
        <div className="not-found-robot-wrapper">
          <div
            className="robot"
            aria-hidden="true"
          >
            <div className="robot-antenna" />

            <div className="robot-head">
              <div className="robot-eyes">
                <span />
                <span />
              </div>

              <div className="robot-mouth" />
            </div>

            <div className="robot-body">
              <div className="robot-panel" />
            </div>

            <div className="robot-arm robot-arm-left" />
            <div className="robot-arm robot-arm-right" />

            <div className="robot-leg robot-leg-left" />
            <div className="robot-leg robot-leg-right" />
          </div>
        </div>

        <div
          className="not-found-code"
          aria-hidden="true"
        >
          404
        </div>

        <span className="not-found-eyebrow">
          PÁGINA NÃO ENCONTRADA
        </span>

        <h1>
          Ops... parece que até o robô se
          perdeu.
        </h1>

        <p>
          A página que você tentou acessar
          não foi encontrada. Verifique o
          endereço ou volte para a página
          inicial.
        </p>

        <Link
          className="not-found-button"
          to="/"
        >
          Voltar para o início
        </Link>
      </section>
    </main>
  )
}