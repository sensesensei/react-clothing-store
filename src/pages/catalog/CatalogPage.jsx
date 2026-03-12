import queryString from 'query-string';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../../services/api/productsApi';
import ProductGrid from '../../features/products/components/ProductGrid';
import './CatalogPage.css';

const SORT_KEYS = ['title', 'slug', 'id'];

function sortProducts(products, key) {
  const sortedProducts = [...products];

  if (!key || !SORT_KEYS.includes(key)) {
    return sortedProducts;
  }

  sortedProducts.sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue);
    }

    if (aValue === bValue) {
      return 0;
    }

    return aValue > bValue ? 1 : -1;
  });

  return sortedProducts;
}

function CatalogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = queryString.parse(location.search);

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sortKey = query.sort;
  const category = query.category;

  useEffect(() => {
    if (sortKey && !SORT_KEYS.includes(sortKey)) {
      navigate('.', { replace: true });
    }
  }, [sortKey, navigate]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError('');

        const data = await getProducts();

        if (isMounted) {
          setProducts(data);
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

  const sortedProducts = useMemo(() => {
    return sortProducts(products, sortKey);
  }, [products, sortKey]);

  const categoryProducts = useMemo(() => {
    if (!category) {
      return sortedProducts;
    }

    const categoryValue = String(category).toLowerCase();

    return sortedProducts.filter((product) => {
      const categorySlug = product.categories?.slug?.toLowerCase();
      const categoryName = product.categories?.name?.toLowerCase();

      return categorySlug === categoryValue || categoryName === categoryValue;
    });
  }, [sortedProducts, category]);

  const categoryLabel = useMemo(() => {
    if (!category) {
      return '';
    }

    const categoryValue = String(category).toLowerCase();
    const matchedProduct = products.find((product) => {
      const categorySlug = product.categories?.slug?.toLowerCase();
      const categoryName = product.categories?.name?.toLowerCase();

      return categorySlug === categoryValue || categoryName === categoryValue;
    });

    return matchedProduct?.categories?.name || String(category);
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();

    return categoryProducts.filter((product) => {
      const title = product.title?.toLowerCase() || '';
      const slug = product.slug?.toLowerCase() || '';

      return title.includes(searchLower) || slug.includes(searchLower);
    });
  }, [categoryProducts, searchQuery]);

  if (loading) {
    return <p>Загрузка товаров...</p>;
  }

  if (error) {
    return <p>Ошибка: {error}</p>;
  }

  return (
    <div className="catalog-container">
      <div className="search-section">
        <input
          type="text"
          placeholder="Поиск по названию или артикулу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        {searchQuery ? (
          <span className="search-results-count">
            Найдено: {filteredProducts.length}
          </span>
        ) : null}

        {category ? (
          <span className="category-label">
            Категория: <strong>{categoryLabel}</strong>
          </span>
        ) : null}
      </div>

      <ProductGrid
        products={filteredProducts}
        title={
          category
            ? categoryLabel
            : sortKey
              ? `Сортировка по ${sortKey}`
              : 'Каталог'
        }
      />
    </div>
  );
}

export default CatalogPage;
