import { Link } from 'react-router-dom';
import { formatPrice, getProductOldPrice } from '../lib/productUtils';
import { Button, EmptyState, Price } from '../../../shared/ui';
import './ProductGrid.css';

function ProductGrid({ products = [], title = 'Товары' }) {
  return (
    <section className="product-grid-section">
      {title ? <h2>{title}</h2> : null}

      {products.length === 0 ? (
        <EmptyState
          compact
          className="product-grid-empty"
          title="Товары не найдены"
        />
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
                    src={product.imageUrl}
                    alt={product.title}
                    className="product-image"
                  />
                </Link>

                <div className="product-card-body">
                  <Link to={productLink} className="product-title-link">
                    <h3 className="product-title">{product.title}</h3>
                  </Link>

                  <Price
                    className="product-price-group"
                    current={price}
                    currentClassName="product-price"
                    oldPrice={oldPrice}
                    oldPriceClassName="product-old-price"
                  />

                  <Button
                    to={productLink}
                    variant="pill-dark"
                    size="sm"
                    className="product-action"
                  >
                    купить
                  </Button>
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
