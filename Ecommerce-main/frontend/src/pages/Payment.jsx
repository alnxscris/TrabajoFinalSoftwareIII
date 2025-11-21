import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { getCart, removeCartItem } from "../services/cart";
import "../styles/pages/payment.css";

export default function Payment() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleConfirm = async () => {
    if (!state?.id_pedido) {
      alert("No se encontró el pedido a confirmar.");
      navigate("/envio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Confirmar pago en el backend
      await api.post("/api/order/confirmar-pago", { id_pedido: state.id_pedido });

      // Limpiar carrito de la BD
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.id_usuario) {
        const { carrito } = await getCart(user.id_usuario);
        await Promise.all(
          carrito.map((item) => removeCartItem(user.id_usuario, item.id_producto))
        );
      }

      alert("¡Gracias! Confirmamos tu pago. Te contactaremos para la entrega.");
      localStorage.removeItem("cart"); // limpiar carrito local
      navigate("/home"); 
    } catch (err) {
      console.error("Error al confirmar pago:", err);
      setError("No se pudo confirmar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="payment-page">
      <h2 className="payment-title">Paga con Yape </h2>

      <div className="qr-card">
        <img src="/images/imagen19.jpg" alt="Código QR para pagar" className="qr-img" />
        <p className="qr-hint">
          Confirma tu pago únicamente después de haber completado la transacción.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <button className="btn btn--primary btn--block" onClick={handleConfirm} disabled={loading}>

      {loading ? "Confirmando..." : "Confirmar pago"}
      </button>
    </section>
  );
}