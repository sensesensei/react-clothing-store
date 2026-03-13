import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../../features/cart';
import { getProductBySlug } from '../../features/products/api';
import {
  formatPrice,
  getProductHighlights,
  getProductOldPrice,
} from '../../features/products/lib/productUtils';
import {
  Button,
  ErrorState,
  Loader,
  NotFoundState,
  Price,
} from '../../shared/ui';
import './ProductPage.css';

function ProductPage() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [cartFeedback, setCartFeedback] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
        setNotFound(false);
        setProduct(null);
        setCartFeedback({ type: '', text: '' });

        const data = await getProductBySlug(slug);

        if (!isMounted) {
          return;
        }

        if (!data) {
          setNotFound(true);
          return;
        }

        setProduct(data);
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
  }, [slug]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedSize(product.sizes[0] || '');
    setActiveImage(product.imageUrl || '');
  }, [product]);

  useEffect(() => {
    setCartFeedback({ type: '', text: '' });
  }, [selectedSize]);

  function handleAddToCart() {
    if (!product) {
      return;
    }

    try {
      const result = addItem(product, {
        quantity: 1,
        size: selectedSize,
      });

      setCartFeedback({
        type: 'success',
        text:
          result.mode === 'updated'
            ? 'Количество этого товара в корзине увеличено.'
            : 'Товар добавлен в корзину.',
      });
    } catch (err) {
      setCartFeedback({
        type: 'error',
        text: err.message || 'Не удалось добавить товар в корзину.',
      });
    }
  }

  if (loading) {
    return <Loader label="Загрузка товара..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (notFound) {
    return (
      <NotFoundState
        title="Товар не найден"
        message="Возможно, он был удален, временно скрыт или ссылка уже неактуальна."
        actionLabel="В каталог"
      />
    );
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

          <div className="product-cart-actions">
            <Button
              type="button"
              variant="pill-dark"
              size="xs"
              className="product-buy-button"
              onClick={handleAddToCart}
            >
              купить
            </Button>

            {cartFeedback.text ? (
              <p className={`product-cart-feedback is-${cartFeedback.type}`}>
                {cartFeedback.text}
              </p>
            ) : null}
          </div>

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
