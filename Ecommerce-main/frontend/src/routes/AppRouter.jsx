import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Páginas
import AuthLanding from "../pages/auth/AuthLanding";
import Home from "../pages/Home";
import Gifts from "../pages/Gifts";
import GiftDetails from "../pages/GiftDetails";
import Cart from "../pages/Cart";
import Comments from "../pages/Comments";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Shipping from "../pages/Shipping";
import Payment from "../pages/Payment";


const AppRouter = () => (
  <Routes>
    {/* Rutas sin header/footer */}
    <Route element={<AuthLayout />}>
      <Route path="/" element={<AuthLanding />} />
      <Route path="/inicio-sesion" element={<Login />} />
      <Route path="/registro" element={<Register />} />
    </Route>

    {/* Rutas con header/footer */}
    <Route element={<MainLayout />}>
      <Route path="/home" element={<Home />} />
      <Route path="/regalos" element={<Gifts />} />
      <Route path="/regalos/:id" element={<GiftDetails />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/comentarios" element={<Comments />} />
      <Route path="/envio" element={<Shipping />} />
      <Route path="/pago" element={<Payment />} />
    </Route>
  </Routes>
);

export default AppRouter;