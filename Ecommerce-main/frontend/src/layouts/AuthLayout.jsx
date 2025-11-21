/* MainLayout siempre muestra el Header y el Footer.
Pero la pantalla de inicio de sesión (AuthLanding) no debe mostrarlos */
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="container">
      <Outlet />
    </main>
  );
};

export default AuthLayout;