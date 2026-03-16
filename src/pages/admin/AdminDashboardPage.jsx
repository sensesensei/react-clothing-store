import { useEffect, useMemo, useState } from 'react';
import {
  RiArrowRightUpLine,
  RiBox3Line,
  RiEyeOffLine,
  RiFolderOpenLine,
  RiPriceTag3Line,
  RiShoppingBag3Line,
} from 'react-icons/ri';
import { getAdminProducts, getCategories } from '../../features/products/api';
import { Button, ErrorState, Loader } from '../../shared/ui';
import './AdminPage.css';

function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [productsData, categoriesData] = await Promise.all([
          getAdminProducts(),
          getCategories(),
        ]);

        if (!isMounted) {
          return;
        }

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Не удалось загрузить данные админки.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive).length;
    const hiddenProducts = products.length - activeProducts;

    return [
      {
        title: 'Товаров в базе',
        value: products.length,
        icon: RiBox3Line,
      },
      {
        title: 'Активных товаров',
        value: activeProducts,
        icon: RiFolderOpenLine,
      },
      {
        title: 'Скрытых товаров',
        value: hiddenProducts,
        icon: RiEyeOffLine,
      },
      {
        title: 'Категорий',
        value: categories.length,
        icon: RiShoppingBag3Line,
      },
    ];
  }, [categories.length, products]);

  const quickLinks = [
    {
      title: 'Категории',
      to: '/admin/categories',
      icon: RiPriceTag3Line,
    },
    {
      title: 'Товары',
      to: '/admin/products',
      icon: RiBox3Line,
    },
    {
      title: 'Заказы',
      to: '/admin/orders',
      icon: RiShoppingBag3Line,
    },
  ];

  if (loading) {
    return <Loader label="Загрузка dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <section className="admin-page">
      <div className="admin-page__hero">
        <div>
          <p className="admin-page__eyebrow">Stage 2</p>
          <h2 className="admin-page__title">Панель управления магазином</h2>
          <p className="admin-page__description">
            Отсюда можно управлять категориями, товарами и заказами в одной защищенной зоне.
          </p>
        </div>

        <div className="admin-page__actions">
          <Button to="/admin/categories" variant="primary" size="md">
            К категориям
          </Button>
          <Button to="/admin/products" variant="primary" size="md">
            К товарам
          </Button>
          <Button to="/admin/orders" variant="primary" size="md">
            К заказам
          </Button>
        </div>
      </div>

      <div className="admin-metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.title} className="admin-card admin-card--metric">
              <div className="admin-card__icon">
                <Icon size={18} aria-hidden="true" />
              </div>
              <p className="admin-card__label">{metric.title}</p>
              <p className="admin-card__value">{metric.value}</p>
            </article>
          );
        })}
      </div>

      <div className="admin-quick-links">
        {quickLinks.map((link) => {
          const Icon = link.icon;

          return (
            <article key={link.to} className="admin-card admin-card--link">
              <div className="admin-card__icon">
                <Icon size={18} aria-hidden="true" />
              </div>
              <h3 className="admin-card__title">{link.title}</h3>
              <Button to={link.to} variant="primary" size="md" className="admin-card__button">
                Открыть
                <RiArrowRightUpLine size={16} aria-hidden="true" />
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AdminDashboardPage;
