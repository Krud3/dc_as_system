import { Link } from 'react-router-dom'
import PixelBlast from '../components/PixelBlast.jsx'
import './HomePage.css'

export default function HomePage() {
  return (
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
        <p className="home__brand">Datacenter como sistema</p>
        <h1>Explora el datacenter en 3D</h1>
        <p className="home__lead">
          Una maqueta interactiva de 19 principios de la teoría general de sistemas.
        </p>
        <div className="home__actions">
          <Link className="home__cta" to="/escena">
            Abrir escena
          </Link>
        </div>
      </div>
    </main>
  )
}
