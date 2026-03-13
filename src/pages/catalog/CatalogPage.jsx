import queryString from 'query-string';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProducts } from '../../features/products/api';
import { ProductGrid } from '../../features/products/ui';
import { EmptyState, ErrorState, Loader } from '../../shared/ui';
import './CatalogPage.css';

const SORT_KEYS = ['title', 'slug', 'id'];

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return typeof value === 'string' ? value : '';
}

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

function getCatalogEmptyState({ category, categoryLabel, hasProducts, searchQuery }) {
  const normalizedSearchQuery = searchQuery.trim();
  const currentCategoryLabel = categoryLabel || String(category || '');

  if (!hasProducts) {
    return {
      title: 'Каталог пока пуст',
      message: 'Товары появятся здесь, когда будут добавлены в базу.',
    };
  }

  if (normalizedSearchQuery && currentCategoryLabel) {
    return {
      title: 'Ничего не найдено',
      message: `По запросу "${normalizedSearchQuery}" в категории "${currentCategoryLabel}" товаров пока нет.`,
    };
  }

  if (normalizedSearchQuery) {
    return {
      title: 'Ничего не найдено',
      message: `По запросу "${normalizedSearchQuery}" мы не нашли ни одного товара.`,
    };
  }

  if (currentCategoryLabel) {
    return {
      title: 'В этой категории пока нет товаров',
      message: `Категория "${currentCategoryLabel}" пока пуста.`,
    };
  }

  return {
    title: 'Ничего не найдено',
    message: 'Попробуй изменить параметры поиска или фильтры.',
  };
}

function CatalogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = queryString.parse(location.search);

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sortKey = getQueryValue(query.sort);
  const category = getQueryValue(query.category);

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

    const categoryValue = category.toLowerCase();

    return sortedProducts.filter((product) => {
      const categorySlug = product.category?.slug?.toLowerCase();
      const categoryName = product.category?.name?.toLowerCase();

      return categorySlug === categoryValue || categoryName === categoryValue;
    });
  }, [sortedProducts, category]);

  const categoryLabel = useMemo(() => {
    if (!category) {
      return '';
    }

    const categoryValue = category.toLowerCase();
    const matchedProduct = products.find((product) => {
      const categorySlug = product.category?.slug?.toLowerCase();
      const categoryName = product.category?.name?.toLowerCase();

      return categorySlug === categoryValue || categoryName === categoryValue;
    });

    return matchedProduct?.category?.name || category;
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    if (!searchLower) {
      return categoryProducts;
    }

    return categoryProducts.filter((product) => {
      const title = product.title?.toLowerCase() || '';
      const slug = product.slug?.toLowerCase() || '';

      return title.includes(searchLower) || slug.includes(searchLower);
    });
  }, [categoryProducts, searchQuery]);

  const emptyState = useMemo(() => {
    if (filteredProducts.length > 0) {
      return null;
    }

    return getCatalogEmptyState({
      category,
      categoryLabel,
      hasProducts: products.length > 0,
      searchQuery,
    });
  }, [category, categoryLabel, filteredProducts.length, products.length, searchQuery]);

  if (loading) {
    return <Loader label="Загрузка товаров..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="catalog-container">
      <div className="search-section">
        <input
          type="text"
          placeholder="Поиск по названию или артикулу..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
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

      {emptyState ? (
        <EmptyState title={emptyState.title} message={emptyState.message} />
      ) : (
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
      )}
    </div>
  );
}

export default CatalogPage;
