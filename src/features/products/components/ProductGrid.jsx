import { Link } from 'react-router-dom';
import { formatPrice, getProductOldPrice } from '../lib/productUtils';
import './ProductGrid.css';

function ProductGrid({ products = [], title = 'Товары' }) {
  return (
    <section className="product-grid-section">
      {title ? <h2>{title}</h2> : null}

      {products.length === 0 ? (
        <p>Товары не найдены</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => {
            const productLink = `/catalog/${product.slug}`;
            const price = formatPrice(product.price);
            const oldPrice = getProductOldPrice(product);

            return (
              <article key={product.id} className="product-card">
                <Link to={productLink} className="product-image-link">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="product-image"
                  />
                </Link>

                <div className="product-card-body">
                  <Link to={productLink} className="product-title-link">
                    <h3 className="product-title">{product.title}</h3>
                  </Link>

                  <div className="product-price-group">
                    {price ? <span className="product-price">{price}</span> : null}
                    {oldPrice ? (
                      <span className="product-old-price">{oldPrice}</span>
                    ) : null}
                  </div>

                  <Link to={productLink} className="product-action">
                    купить
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProductGrid;
