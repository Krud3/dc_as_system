import { Link } from 'react-router-dom'
import PixelBlast from '../components/PixelBlast.jsx'
import PrincipiosTgs from '../components/PrincipiosTgs.jsx'
import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home-page">
      <main className="home">
        <div className="home__stage" aria-hidden="true">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#B497CF"
            patternScale={3}
            patternDensity={1.1}
            pixelSizeJitter={0.4}
            enableRipples={false}
            liquid={false}
            speed={0.4}
            edgeFade={0.25}
            transparent
          />
        </div>

        <div className="home__copy">
          <h1 className="home__headline">
            Datacenter como <em>sistema</em>
          </h1>
          <p className="home__lead">
            Una maqueta interactiva de 19 principios de la teoría general de sistemas.
          </p>
          <div className="home__actions">
            <Link className="home__cta" to="/escena">
              Abrir escena
            </Link>
            <a className="home__cta home__cta--ghost" href="#principios">
              Ver principios
            </a>
          </div>
        </div>
      </main>

      <div id="principios">
        <PrincipiosTgs />
      </div>
    </div>
  )
}
