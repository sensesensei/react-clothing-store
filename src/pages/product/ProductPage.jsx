import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  formatPrice,
  getProductHighlights,
  getProductOldPrice,
} from '../../features/products/lib/productUtils';
import { getProductBySlug } from '../../services/api/productsApi';
import { Button, ErrorState, Loader, Price } from '../../shared/ui';
import './ProductPage.css';

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError('');

        const data = await getProductBySlug(slug);

        if (!data) {
          navigate('/catalog', { replace: true });
          return;
        }

        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Не удалось загрузить товар');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug, navigate]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedSize(product.sizes[0] || '');
    setActiveImage(product.imageUrl || '');
  }, [product]);

  if (loading) {
    return <Loader label="Загрузка товара..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!product) {
    return null;
  }

  const galleryImages = product.imageUrl ? [product.imageUrl] : [];
  const currentImage = activeImage || product.imageUrl;
  const currentPrice = formatPrice(product.price);
  const oldPrice = getProductOldPrice(product);
  const productSizes = product.sizes;
  const highlights = getProductHighlights(product);

  return (
    <section className="product-page">
      <Link to="/catalog" className="product-back-link">
        ← More products
      </Link>

      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-main-media">
            <img
              src={currentImage}
              alt={product.title}
              className="product-main-image"
            />
          </div>

          {galleryImages.length > 0 ? (
            <div className="product-thumbnails" aria-label="Галерея товара">
              {galleryImages.map((imageUrl, index) => (
                <button
                  key={`${product.id}-${index}`}
                  type="button"
                  className={`product-thumbnail${currentImage === imageUrl ? ' is-active' : ''}`}
                  onClick={() => setActiveImage(imageUrl)}
                  aria-label={`Фото ${index + 1}`}
                >
                  <img src={imageUrl} alt="" className="product-thumbnail-image" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="product-summary">
          <div className="product-summary-head">
            <h1 className="product-heading">{product.title}</h1>

            <Price
              className="product-pricing"
              current={currentPrice}
              currentClassName="product-current-price"
              oldPrice={oldPrice}
              oldPriceClassName="product-old-price"
            />
          </div>

          {productSizes.length > 0 ? (
            <div className="product-size-block">
              <p className="product-size-label">Размер</p>

              <div className="product-size-list">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`product-size-option${selectedSize === size ? ' is-active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <Button
            type="button"
            variant="pill-dark"
            size="xs"
            className="product-buy-button"
          >
            купить
          </Button>

          {highlights.length > 0 ? (
            <ul className="product-highlights">
              {highlights.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}

          <p className="product-shipping-note">
            Отправка в течение 1-3 рабочих дней
          </p>
        </aside>
      </div>
    </section>
  );
}

export default ProductPage;
