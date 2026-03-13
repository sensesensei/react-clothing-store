import { useEffect, useState } from 'react';
import { getProducts } from '../../features/products/api';
import { ProductGrid } from '../../features/products/ui';
import { EmptyState, ErrorState, Loader } from '../../shared/ui';
import './HomePage.css';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        if (isMounted) {
          setProducts(data);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Не удалось загрузить товары');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-wrapper">
      <div className="home-hero">
        <h1>Добро пожаловать в наш магазин</h1>
        <p>Откройте для себя нашу коллекцию премиум-товаров</p>
      </div>

      {loading ? (
        <Loader label="Загрузка товаров..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Каталог пока пуст"
          message="Товары появятся здесь, как только мы добавим их в витрину."
        />
      ) : (
        <ProductGrid products={products} title="Наш каталог" />
      )}
    </div>
  );
}

export default HomePage;
