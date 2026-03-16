import { useState } from 'react';
import {
  RiArrowLeftLine,
  RiBox3Line,
  RiDashboardLine,
  RiLogoutBoxRLine,
  RiPriceTag3Line,
  RiShoppingBag3Line,
} from 'react-icons/ri';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { Button } from '../shared/ui';
import './AdminLayout.css';

const navigationItems = [
  {
    to: '/admin',
    end: true,
    label: 'Dashboard',
    icon: RiDashboardLine,
  },
  {
    to: '/admin/categories',
    label: 'Категории',
    icon: RiPriceTag3Line,
  },
  {
    to: '/admin/products',
    label: 'Товары',
    icon: RiBox3Line,
  },
  {
    to: '/admin/orders',
    label: 'Заказы',
    icon: RiShoppingBag3Line,
  },
];

function AdminLayout() {
  const { displayName, signOut, user } = useAuth();
  const [signOutError, setSignOutError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      setSignOutError('');
      await signOut();
    } catch (error) {
      setSignOutError(error.message || 'Не удалось выйти из аккаунта.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <p className="admin-sidebar__eyebrow">Parfum</p>
          <h1 className="admin-sidebar__title">Admin panel</h1>
          <p className="admin-sidebar__text">
            Доступ в рабочую зону открыт только для аккаунтов с ролью администратора.
          </p>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Навигация админки">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-sidebar__link${isActive ? ' is-active' : ''}`
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__hint">
            Текущий вход выполнен как {displayName || user?.email || 'администратор'}.
          </p>

          <Button to="/" variant="primary" size="md" className="admin-sidebar__back">
            <RiArrowLeftLine size={16} aria-hidden="true" />
            <span>На витрину</span>
          </Button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar__eyebrow">Back office</p>
            <p className="admin-topbar__title">Управление каталогом и заказами</p>
          </div>

          <div className="admin-topbar__actions">
            <div className="admin-topbar__profile">
              <p className="admin-topbar__label">Авторизован как</p>
              <p className="admin-topbar__email">{displayName || user?.email || 'Администратор'}</p>
            </div>

            <button
              type="button"
              className="admin-topbar__logout"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <RiLogoutBoxRLine size={16} aria-hidden="true" />
              <span>{isSigningOut ? 'Выходим...' : 'Выйти'}</span>
            </button>
          </div>
        </header>

        {signOutError ? (
          <p className="admin-topbar__error" role="alert">
            {signOutError}
          </p>
        ) : null}

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
