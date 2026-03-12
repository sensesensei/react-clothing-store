import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProductBySlug } from '../../services/api/productsApi';

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
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

  if (loading) {
    return <p>Загрузка товара...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <h1>{product.title}</h1>
      <h2>{product.categories?.name || 'Без категории'}</h2>
      <h2>{product.price} ₽</h2>
      {product.old_price ? <p>{product.old_price} ₽</p> : null}
      {product.description ? <p>{product.description}</p> : null}
      <Link to="/catalog">Все товары</Link>
    </>
  );
}

export default ProductPage;
