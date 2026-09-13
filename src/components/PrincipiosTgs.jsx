import { useState } from 'react'
import { PRINCIPIOS_TGS } from '../data/principiosTgs.js'
import StrokeText from './StrokeText.jsx'
import PixelSwap from './PixelSwap.jsx'
import './PrincipiosTgs.css'

function pad(n) {
  return String(n).padStart(2, '0')
}

/** Iconos lineales mínimos por principio (stroke). */
const TITLE_ITALIC = ['sistema']

const ICONS = [
  // Frontera
  <path key="1" d="M7 7h10v10H7zM4 4h4M16 4h4M4 20h4M16 20h4M4 4v4M4 16v4M20 4v4M20 16v4" />,
  // Entorno
  <path key="2" d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />,
  // Totalidad
  <path key="3" d="M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM9 12h6M12 9v6" />,
  // Equifinalidad
  <path key="4" d="M5 18V8l7-4 7 4v10M5 12h14M12 4v16" />,
  // Jerarquía
  <path key="5" d="M12 4v4M8 12h8M6 20h4M14 20h4M12 8l-4 4M12 8l4 4M8 12v8M16 12v8" />,
  // Complejidad
  <path key="6" d="M8 8h2v2H8zM14 8h2v2h-2zM8 14h2v2H8zM14 14h2v2h-2zM10 9h4M9 10v4M15 10v4M10 15h4" />,
  // Sinergia
  <path key="7" d="M8 12a4 4 0 1 0 0-.01M16 12a4 4 0 1 0 0-.01M10.5 10.5l3 3M13.5 10.5l-3 3" />,
  // Emergencia
  <path key="8" d="M12 19V9M8 13l4-4 4 4M7 5h10" />,
  // Resiliencia
  <path key="9" d="M5 12a7 7 0 0 1 12.5-4M19 12a7 7 0 0 1-12.5 4M16 5h3v3M8 19H5v-3" />,
  // Adaptabilidad
  <path key="10" d="M5 15c2-6 5-9 7-9s5 3 7 9M5 15h14M9 15v2a3 3 0 0 0 6 0v-2" />,
  // Entropía
  <path key="11" d="M7 5h10l-1 6H8L7 5ZM9 11v4l3 4 3-4v-4M6 20h12" />,
  // Neguentropía
  <path key="12" d="M12 19V9M8 12l4-4 4 4M6 5h12" />,
  // Homeóstasis
  <path key="13" d="M4 12h4l2-5 4 10 2-5h4" />,
  // Equilibrio
  <path key="14" d="M12 4v16M5 10h14M7 10l-2 6h4l-2-6ZM17 10l-2 6h4l-2-6Z" />,
  // Retroalimentación
  <path key="15" d="M18 8a6 6 0 1 0 1.5 5.5M18 8V4m0 4h-4" />,
  // Estructura
  <path key="16" d="M5 19V9l7-4 7 4v10H5ZM9 19v-6h6v6" />,
  // Recursividad
  <path key="17" d="M8 8h8v8H8zM11 11h8v8h-8" />,
  // Complementariedad
  <path key="18" d="M9 12a3 3 0 1 0 0-.01M15 12a3 3 0 1 0 0-.01M4 12h2M18 12h2M12 4v2M12 18v2" />,
  // Multicausalidad
  <path key="19" d="M12 12l-5-7M12 12l5-7M12 12v8M7 5h10M9 20h6" />,
]

function CardFace({ p, icon, isOpen, variant }) {
  return (
    <div className={`principios__face principios__face--${variant}`}>
      <div className="principios__card-meta">
        <span className="principios__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </span>
        <span className="principios__num">{pad(p.n)}</span>
      </div>

      <h3 className="principios__name">{p.nombre}</h3>
      <p className="principios__aplicacion">{p.aplicacion}</p>

      <div className={`principios__ejemplo${isOpen ? ' is-visible' : ''}`}>
        <p>{p.ejemplo}</p>
      </div>
    </div>
  )
}

export default function PrincipiosTgs() {
  const [open, setOpen] = useState(null)

  return (
    <section className="principios" aria-labelledby="principios-heading">
      <header className="principios__header">
        <h2 id="principios-heading" className="principios__title">
          <StrokeText
            text="19 principios del sistema"
            strokeColor="#B497CF"
            fillColor="#FFFFFF"
            strokeWidth={1.4}
            drawDuration={1.6}
            fillDelay={0.2}
            stagger={0.04}
            ease="power2.out"
            trigger="scroll"
            fillMode="wipe"
            fontSize={96}
            fontWeight={500}
            letterSpacing={-3}
            italicWords={TITLE_ITALIC}
            className="principios__stroke"
          />
        </h2>
        <p className="principios__lead">
          Cómo se aplica la teoría general de sistemas al datacenter: cada principio con su
          evidencia concreta en operación.
        </p>
      </header>

      <ul className="principios__grid">
        {PRINCIPIOS_TGS.map((p, i) => {
          const isOpen = open === p.n
          const icon = ICONS[i]
          const faceProps = { p, icon, isOpen }

          return (
            <li key={p.n} className="principios__item">
              <PixelSwap
                className={`principios__card${isOpen ? ' is-open' : ''}`}
                fluid
                firstContent={<CardFace {...faceProps} variant="dark" />}
                secondContent={<CardFace {...faceProps} variant="light" />}
                pixelSize={80}
                maxPixels={36}
                gap={0}
                pixelRadius={0}
                pixelSpin={0}
                pixelScale={0.4}
                duration={480}
                pixelDuration={220}
                pattern="random"
                randomness={0}
                fade={false}
                trigger="hover"
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.n)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setOpen(isOpen ? null : p.n)
                  }
                }}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
