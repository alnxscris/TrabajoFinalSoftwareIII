import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/inventory";
import { addToCart as addToCartService } from "../services/cart";
import "../styles/pages/giftdetails.css";

export default function GiftDetails() {
  const { id } = useParams(); // viene desde /regalos/:id
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Producto no encontrado:", err);
        navigate("/regalos");
      }
    };
    if (id) fetchProduct();
  }, [id, navigate]);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));
  
  const addToCart = async () => {

  // Verificar que el usuario esté logueado
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.id_usuario) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    navigate("/login");
    return;
  }

  // Enviar al backend
  try {
    setError("");
    
    await addToCartService({
      id_usuario: user.id_usuario,
      id_producto: product.id_producto,
      cantidad: qty,
    });
    
    alert("¡Producto agregado al carrito!");
    navigate("/carrito");

  } catch (err) {
    console.error("Error al agregar al carrito:", err);
    setError("Error al agregar el producto. Intenta de nuevo.");
  }
};

  if (!product) return null;

  return (
    <section className="gift-detail">
      <div className="gift-detail__grid">
        {/* Imagen */}
        <aside className="detail-media">
          <div className="detail-media__frame">
            <img src={product.imagen_url} alt={product.nombre_producto} />
          </div>
        </aside>

        {/* Info */}
        <div className="detail-side">
          <h1 className="detail-title">{product.nombre_producto}</h1>

          <div className="detail-desc">
            <h3>Contiene:</h3>
            <p>{product.descripcion_producto}</p>
          </div>

          <div className="detail-price">S/. {product.precio_producto}</div>

          {/* Cantidad */}
          <div className="qty-stepper">
            <button type="button" onClick={dec} aria-label="Disminuir">-</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" onClick={inc} aria-label="Aumentar">+</button>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <button className="btn" onClick={addToCart}>
          Agregar al carrito
          </button>
        </div>
      </div>
    </section>
  );
}