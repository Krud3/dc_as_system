import { Link } from 'react-router-dom'
import PixelBlast from '../components/PixelBlast.jsx'
import PrincipiosTgs from '../components/PrincipiosTgs.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import SpecularButton from '../components/SpecularButton.jsx'
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
            Una maqueta interactiva de los 19 principios de la teoría general de sistemas.
          </p>
          <div className="home__actions">
            <Link className="home__cta" to="/escena">
              Abrir escena
            </Link>
            <SpecularButton
              className="home__cta-specular"
              size="sm"
              radius={999}
              tint="#ffffff"
              tintOpacity={0}
              blur={0}
              textColor="#f4f7ff"
              lineColor="#ffffff"
              baseColor="#b497cf"
              intensity={1.5}
              shineSize={10}
              shineFade={40}
              thickness={2}
              speed={0.35}
              followMouse
              proximity={250}
              autoAnimate={false}
              onClick={() => {
                document.getElementById('principios')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Ver principios
            </SpecularButton>
          </div>
        </div>
      </main>

      <div id="principios">
        <PrincipiosTgs />
      </div>

      <SiteFooter />
    </div>
  )
}
