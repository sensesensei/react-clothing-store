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
          <p className="admin-page__eyebrow">Stage 1</p>
          <h2 className="admin-page__title">Фундамент админ-панели</h2>
          <p className="admin-page__description">
            Мы отделили back office от витрины и подготовили базовый shell для
            управления магазином. Следующие шаги уже пойдут внутри этой зоны.
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
          <p className="admin-card__eyebrow">Что уже готово</p>
          <h3 className="admin-card__title">Проектная база под админку есть</h3>
          <p className="admin-card__text">
            В проекте уже подготовлена продуктовая модель с полями `stock`,
            `isActive`, `categoryId`, сериализацией и валидацией. Это хороший
            фундамент для CRUD товаров.
          </p>
        </article>

        <article className="admin-card">
          <p className="admin-card__eyebrow">Следующий спринт</p>
          <h3 className="admin-card__title">Следом: доступ и безопасность</h3>
          <ul className="admin-checklist">
            <li>Авторизация администратора через реальный auth flow</li>
            <li>Защита `/admin` и ограничение доступа по ролям</li>
            <li>RLS и policies для безопасной работы с Supabase</li>
          </ul>
        </article>

        <article className="admin-card admin-card--accent">
          <p className="admin-card__eyebrow">Важно</p>
          <h3 className="admin-card__title">Безопасность вынесем отдельным этапом</h3>
          <p className="admin-card__text">
            Сейчас это UI-фундамент. Перед настоящим прод-доступом добавим
            авторизацию администратора и правила доступа в Supabase.
          </p>
        </article>

        <article className="admin-card admin-card--link">
          <p className="admin-card__eyebrow">Быстрый переход</p>
          <h3 className="admin-card__title">Открыть раздел товаров</h3>
          <p className="admin-card__text">
            Следующий шаг логично начинать именно отсюда: там уже есть доменная
            модель, и это даст самый быстрый прогресс.
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
