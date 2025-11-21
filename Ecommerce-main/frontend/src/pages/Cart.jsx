// src/pages/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProductById } from "../services/inventory";
import { getCart, updateCartItem, removeCartItem, clearCart } from "../services/cart";
import '../styles/pages/cart.css';

const money = (n) => `S/. ${parseFloat(n).toFixed(2).replace(/\.00$/, "")}`;
const SHIPPING_FLAT = 7; // mock

const CartItem = ({ item, onInc, onDec, onRemove }) => (
  <article className="cart-item">
    <figure className="cart-item__media">
      <img src={item.imagen_url} alt={item.nombre_producto} />
    </figure>

    <div className="cart-item__main">
      <h4 className="cart-item__title">{item.nombre_producto}</h4>
    </div>

    <div className="cart-item__price">{money(item.precio_producto)}</div>

    <div className="cart-item__qty">
      <button aria-label="Disminuir" onClick={onDec} disabled={item.cantidad <= 1}>−</button>
      <span aria-live="polite">{item.cantidad}</span>
      <button aria-label="Aumentar" onClick={onInc}>+</button>
    </div>

    <div className="cart-item__total">{money(item.precio_producto * item.cantidad)}</div>

    <button className="cart-item__remove" aria-label="Eliminar" onClick={onRemove}>🗑️</button>
  </article>
);

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Recuperar usuario logueado
  const user = JSON.parse(localStorage.getItem("user"));
  const id_usuario = user?.id_usuario;

  // Subtotal
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio_producto * item.cantidad, 0);
  }, [items]);
  
  // Cargar carrito desde la BD
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { carrito, total } = await getCart(id_usuario);
        setItems(carrito);
        setTotal(total);
      } catch (err) {
        console.error("Error al cargar carrito:", err);
      }
    };
    if (id_usuario) fetchCart();
  }, [id_usuario]);

  const inc = async (idx) => {
    const item = items[idx];
    const nuevaCantidad = item.cantidad + 1;

    try {
    const producto = await getProductById(item.id_producto);
    if (nuevaCantidad > producto.stock) {
      alert("No hay suficiente stock disponible.");
      return;
    }

    await updateCartItem(id_usuario, item.id_producto, nuevaCantidad);
    setItems((prev) =>
      prev.map((i, k) => (k === idx ? { ...i, cantidad: nuevaCantidad } : i))
    );
    setTotal((prev) => prev + item.precio_producto);
  } catch (err) {
    console.error("Error al validar stock:", err);
  }
};

  const dec = async (idx) => {
    const item = items[idx];
    const nuevaCantidad = Math.max(1, item.cantidad - 1);
    await updateCartItem(id_usuario, item.id_producto, nuevaCantidad);
    setItems((prev) =>
      prev.map((i, k) => (k === idx ? { ...i, cantidad: nuevaCantidad } : i))
    );
    setTotal((prev) => prev - item.precio_producto);
  };

  const remove = async (idx) => {
    const item = items[idx];
    await removeCartItem(id_usuario, item.id_producto);
    setItems((prev) => prev.filter((_, k) => k !== idx));
    setTotal((prev) => prev - item.precio_producto * item.cantidad);
  };

  const clear = async () => {
    await clearCart(id_usuario, items);
    setItems([]);
    setTotal(0);
  };

  const handleProceed = () => {
    if (!id_usuario) {
      alert("Debes iniciar sesión para continuar con el pago.");
      return;
    }

    const productos = items.map((i) => ({
      id_producto: i.id_producto,
      cantidad: i.cantidad,
      precio_unitario: i.precio_producto,
      subtotal: i.precio_producto * i.cantidad,
    }));

    navigate("/envio", {
      state: {
        id_usuario,
        productos,
        total,
      },
    });
  };

  if (items.length === 0) {
    return (
      <section className="cart-page cart-empty">
        <h2>Tu carrito está vacío</h2>
        <p>Explora nuestros <Link to="/regalos">regalos</Link> y agrega tus favoritos.</p>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-grid">
        {/* Lista */}
        <div className="cart-list">
          <header className="cart-list__head">
            <h2>Carrito</h2>
            <button className="link-danger" onClick={clear}>Vaciar</button>
          </header>

          <div className="cart-list__items">
            {items.map((it, idx) => (
              <CartItem
                key={`${it.id}-${it.deliveryAt}-${idx}`}
                item={it}
                onInc={() => inc(idx)}
                onDec={() => dec(idx)}
                onRemove={() => remove(idx)}
              />
            ))}
          </div>
        </div>

        {/* Resumen */}
        <aside className="cart-summary">
          <h3>Resumen de compra</h3>
          <dl className="summary-rows">
            <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div><dt>Envío</dt><dd>{money(items.length > 0 ? SHIPPING_FLAT : 0)}</dd></div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{money(subtotal + (items.length > 0 ? SHIPPING_FLAT : 0))}</dd></div>
          </dl>
          
          <button className="btn btn--primary btn--block" onClick={handleProceed}>
          Procede al pago
          </button>
        </aside>
      </div>
    </section>
  );
}