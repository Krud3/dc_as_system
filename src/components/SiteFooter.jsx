import './SiteFooter.css'

const INTEGRANTES = [
  { nombre: 'Julián Ernesto Puyo Mora', codigo: '2226905' },
  { nombre: 'Juan Sebastian Molina Cuéllar', codigo: '2224491' },
  { nombre: 'Javier Andres Lasso Rojas', codigo: '2061149' },
  { nombre: 'Dylan Farkas Quiza', codigo: '2183118' },
]

function scrollToTop() {
  const root = document.getElementById('root')
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior = prefersReduced ? 'auto' : 'smooth'

  if (root) {
    root.scrollTo({ top: 0, behavior })
    return
  }

  window.scrollTo({ top: 0, behavior })
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__cols">
          <div className="site-footer__col">
            <h2 className="site-footer__heading">Asignatura</h2>
            <ul className="site-footer__list">
              <li>Impactos Ambientales (730078C)</li>
              <li>Semestre II-2026</li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__heading">Actividad</h2>
            <ul className="site-footer__list">
              <li>Teoría General de Sistemas (TGS)</li>
              <li>Principios Básicos</li>
              <li>Maqueta Interactiva</li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h2 className="site-footer__heading">Integrantes</h2>
            <ul className="site-footer__list">
              {INTEGRANTES.map(({ nombre, codigo }) => (
                <li key={codigo}>
                  {nombre}
                  <span className="site-footer__code"> — {codigo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__brand" aria-label="Sistema">
            SISTEMA
          </p>
          <div className="site-footer__meta">
            <button
              type="button"
              className="site-footer__top"
              onClick={scrollToTop}
            >
              Volver arriba ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
