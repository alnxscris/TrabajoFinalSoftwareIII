// Layout base (Header, Footer, <main>), para evitar repetir estructura.
// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const MainLayout = () => (
  <div className="app-root">
    <Header />
    <main className="container">
      <Outlet /> {/* <-- AQUÍ va el contenido de las rutas hijas */}
    </main>
    <Footer />
  </div>
);

export default MainLayout;
