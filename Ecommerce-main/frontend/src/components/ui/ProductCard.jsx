// src/components/ui/ProductCard.jsx
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => (
  <article className="gift-card">
    <figure className="gift-thumb">
      <img src={product.image} alt={product.title} />
    </figure>
    <div className="gift-body">
      <h4 className="gift-title">{product.title}</h4>
      <small className="gift-price">S/. {product.price}</small>

      {/* Enlaza al detalle usando el slug del título */}
      <Link
        className="btn"
        to={`/regalos/${product.id}`}
      >
        Ver detalles
      </Link>
    </div>
  </article>
);

export default ProductCard;
