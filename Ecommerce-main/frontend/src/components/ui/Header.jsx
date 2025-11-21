// Barra superior + navegación
import { NavLink } from "react-router-dom";

const Header = () => (
  <header className="header">
    <div className="container header__inner">
      <nav>
        <ul className="nav">
          <li>
            <NavLink
              to="/home"
              end
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/regalos"
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
            >
              Regalos
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/carrito"
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
            >
              Carrito
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/comentarios"
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
            >
              Comentarios
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
);

export default Header;