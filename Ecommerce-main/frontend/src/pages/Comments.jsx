import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/pages/comments.css";

const TESTIMONIALS = [
  {
    img: "/images/imagen20.jpg",
    alt: "Clienta celebrando con su box",
    text:
      "El detalle llegó tal cual la foto, muy cuidado y con un aroma riquísimo. Atención amable y rápida. A mi abuelita le encantó",
    author: "Mariana D."
  },
  {
    img: "/images/imagen22.jpg",
    alt: "Clienta con su box de regalo",
    text:
      "¡Amo MiAri Detalles! Encontré el regalo perfecto y personalizado para mi tía. Fue único, hermoso y lleno de significado. ¡Volveré sin duda!",
    author: "Camila P."
  },
  {
    img: "/images/imagen21.jpg",
    alt: "Cliente con box gourmet",
    text:
      "Excelente presentación y puntualidad. El box superó mis expectativas, a mi papá le encantó. 100% recomendado.",
    author: "Luis R."
  },
];

export default function Comments() {
  const items = useMemo(() => TESTIMONIALS, []);
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(null);

  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);
  const goTo = (i) => setIdx(i);

  // Teclado: ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  // Swipe básico
  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    touchStartX.current = null;
  };

  const t = items[idx];

  return (
    <section className="reviews-page">
      <h2 className="reviews-title">Comentarios</h2>

      <div
        className="review-card"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Opiniones de clientes"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          className="review-nav review-nav--prev"
          aria-label="Comentario anterior"
          onClick={prev}
        >
          ‹
        </button>

        <div className="review-grid">
          <figure className="review-media">
            <img src={t.img} alt={t.alt} />
          </figure>

          <div className="review-content">
            <blockquote className="review-text">“{t.text}”</blockquote>
            {t.author && <cite className="review-author">— {t.author}</cite>}
          </div>
        </div>

        <button
          className="review-nav review-nav--next"
          aria-label="Siguiente comentario"
          onClick={next}
        >
          ›
        </button>
      </div>
    </section>
  );
}
