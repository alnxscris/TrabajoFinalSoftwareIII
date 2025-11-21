import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import { getInventory } from "../services/inventory";
import "../styles/pages/gifts.css";

const Row = ({ title, items, navigate}) => {
  const scrollerRef = useRef(null);
  const scrollBy = (dir) =>
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section className="gifts-section">
      <header className="gifts-head">
        <h2 className="gifts-title">{title}</h2>
        <div className="gifts-nav">
          <button className="arrow" aria-label="Anterior" onClick={() => scrollBy(-1)}>‹</button>
          <button className="arrow" aria-label="Siguiente" onClick={() => scrollBy(1)}>›</button>
        </div>
      </header>

      <div className="gifts-row" ref={scrollerRef}>
        {items.map((p) => (
          <ProductCard
            key={p.id_producto}
            product={{
              id: p.id_producto,
              title: p.nombre_producto,
              price: p.precio_producto,
              image: p.imagen_url,
              descripcion: p.descripcion_producto,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default function Gifts() {
  const [secciones, setSecciones] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { secciones } = await getInventory();
        setSecciones(secciones);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="gifts-page">
      {secciones.map((seccion, idx) => (
        <Row
          key={idx}
          title={seccion.title} 
          items={seccion.items} 
          navigate={navigate}
        />
      ))}
    </div>
  );
};