// src/pages/Home.jsx
import Carousel from '../components/ui/Carousel'
import Button from '../components/common/Button'
import { Link } from 'react-router-dom'
import '../styles/pages/home.css'

const Home = () => (
  <section className="home-hero">
    <div className="home-grid">
      {/* Izquierda: texto */}
      <div className="home-copy">
        <h1 className="home-title">
          Regalos únicos para<br/>personas únicas
        </h1>
        <p className="home-lead">
          En MiAri Detalles, personalizamos cada regalo para que refleje tus
          sentimientos y haga especial cualquier ocasión.
        </p>
        <div className="home-cta">
          <Button as={Link} to="/regalos">Ver Regalos</Button>
          <Button as={Link} to="/carrito" className="btn--secondary">Ir al Carrito</Button>
        </div>
      </div>

      {/* Derecha: marco rosado + TU carrusel */}
      <div className="home-media">
        <div className="home-media-frame">
          <Carousel /> {/* sin cambios */}
        </div>
      </div>
    </div>
  </section>
)

export default Home
