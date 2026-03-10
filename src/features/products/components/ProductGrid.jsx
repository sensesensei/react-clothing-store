import { Link } from 'react-router-dom';
import './ProductGrid.css';

function ProductGrid({ products, title = 'Товары' }) {
  return (
    <div className="product-grid-section">
      {title && <h2>{title}</h2>}
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/catalog/${product.slug}`} className="product-link">
              <h3>{product.title}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
