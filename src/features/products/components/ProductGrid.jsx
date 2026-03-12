import { Link } from 'react-router-dom';
import './ProductGrid.css';

function ProductGrid({ products = [], title = 'Товары' }) {
  return (
    <section className="product-grid-section">
      {title ? <h2>{title}</h2> : null}

      {products.length === 0 ? (
        <p>Товары не найдены</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <Link to={`/catalog/${product.slug}`} className="product-link">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="product-image"
                />
                <h3>{product.title}</h3>
              </Link>

              <p>{product.categories?.name || 'Без категории'}</p>
              <p>{product.price} ₽</p>

              {product.old_price ? <p>{product.old_price} ₽</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductGrid;
