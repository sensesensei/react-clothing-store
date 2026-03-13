import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  formatPrice,
  getProductHighlights,
  getProductOldPrice,
  normalizeSizes,
} from '../../features/products/lib/productUtils';
import { getProductBySlug } from '../../services/api/productsApi';
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

    const availableSizes = normalizeSizes(product.sizes);

    setSelectedSize(availableSizes[0] || '');
    setActiveImage(product.image_url || '');
  }, [product]);

  if (loading) {
    return <p>Загрузка товара...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  if (!product) {
    return null;
  }

  const galleryImages = product.image_url ? [product.image_url] : [];
  const currentImage = activeImage || product.image_url;
  const currentPrice = formatPrice(product.price);
  const oldPrice = getProductOldPrice(product);
  const productSizes = normalizeSizes(product.sizes);
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

            <div className="product-pricing">
              {currentPrice ? (
                <span className="product-current-price">{currentPrice}</span>
              ) : null}
              {oldPrice ? (
                <span className="product-old-price">{oldPrice}</span>
              ) : null}
            </div>
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

          <button type="button" className="product-buy-button">
            купить
          </button>

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
