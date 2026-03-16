import { useEffect, useMemo, useState } from 'react';
import { RiArrowRightUpLine, RiBox3Line, RiEyeOffLine, RiFolderOpenLine, RiShoppingBag3Line } from 'react-icons/ri';
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
        hint: 'Основа для будущей таблицы товаров.',
        icon: RiBox3Line,
      },
      {
        title: 'Активных товаров',
        value: activeProducts,
        hint: 'Их стоит выводить на витрину.',
        icon: RiFolderOpenLine,
      },
      {
        title: 'Скрытых товаров',
        value: hiddenProducts,
        hint: 'Полезно для черновиков и снятых позиций.',
        icon: RiEyeOffLine,
      },
      {
        title: 'Категорий',
        value: categories.length,
        hint: 'Категории уже используются в навигации каталога.',
        icon: RiShoppingBag3Line,
      },
    ];
  }, [categories.length, products]);

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
          <h2 className="admin-page__title">Админ-доступ и рабочая зона</h2>
          <p className="admin-page__description">
            Back office теперь работает как отдельная защищенная зона: доступ
            открывается через Supabase Auth и роль администратора.
          </p>
        </div>

        <div className="admin-page__actions">
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
              <p className="admin-card__hint">{metric.hint}</p>
            </article>
          );
        })}
      </div>

      <div className="admin-content-grid">
        <article className="admin-card">
          <p className="admin-card__eyebrow">Что уже работает</p>
          <h3 className="admin-card__title">Товары, заказы и access control на месте</h3>
          <p className="admin-card__text">
            В проекте уже есть рабочие экраны товаров и заказов, а доступ к ним
            теперь можно ограничивать через роль `admin` и новые policies в Supabase.
          </p>
        </article>

        <article className="admin-card">
          <p className="admin-card__eyebrow">Контроль доступа</p>
          <h3 className="admin-card__title">Что проверять после выдачи роли</h3>
          <ul className="admin-checklist">
            <li>Вход через email и пароль администратора</li>
            <li>Доступ к `/admin` только для `profiles.role = admin`</li>
            <li>CRUD товаров, заказы и Storage только под админ-ролью</li>
          </ul>
        </article>

        <article className="admin-card admin-card--accent">
          <p className="admin-card__eyebrow">Важно</p>
          <h3 className="admin-card__title">Доступ выдается через Supabase</h3>
          <p className="admin-card__text">
            Новый администратор создается в Supabase Auth, а затем ему назначается
            роль `admin` в таблице `profiles`. Без этой роли админка останется закрытой.
          </p>
        </article>

        <article className="admin-card admin-card--link">
          <p className="admin-card__eyebrow">Быстрый переход</p>
          <h3 className="admin-card__title">Открыть раздел товаров</h3>
          <p className="admin-card__text">
            Здесь быстрее всего проверить, что защита доступа и рабочий CRUD ведут
            себя одинаково стабильно после входа под админом.
          </p>
          <Button to="/admin/products" variant="primary" size="md" className="admin-card__button">
            Перейти
            <RiArrowRightUpLine size={16} aria-hidden="true" />
          </Button>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
