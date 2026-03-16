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

function getCatalogEmptyState({ category, categoryLabel, hasProducts }) {
  const currentCategoryLabel = categoryLabel || String(category || '');

  if (!hasProducts) {
    return {
      title: 'Каталог пока пуст',
      message: 'Товары появятся здесь, когда будут добавлены в базу.',
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

  const emptyState = useMemo(() => {
    if (categoryProducts.length > 0) {
      return null;
    }

    return getCatalogEmptyState({
      category,
      categoryLabel,
      hasProducts: products.length > 0,
    });
  }, [category, categoryLabel, categoryProducts.length, products.length]);

  if (loading) {
    return <Loader label="Загрузка товаров..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="catalog-container">
      {emptyState ? (
        <EmptyState title={emptyState.title} message={emptyState.message} />
      ) : (
        <ProductGrid
          products={categoryProducts}
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
