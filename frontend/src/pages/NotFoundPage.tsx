import { Link } from 'react-router-dom'

import '../styles/not-found.css'

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-aurora not-found-aurora-one" />
      <div className="not-found-aurora not-found-aurora-two" />

      <section className="not-found-card">
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
          Parece que você saiu do caminho.
        </h1>

        <p>
          A página que você tentou acessar
          não existe, foi removida ou o
          endereço informado está incorreto.
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