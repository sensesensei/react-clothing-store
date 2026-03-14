import { RiArrowLeftLine, RiBox3Line, RiDashboardLine, RiShoppingBag3Line } from 'react-icons/ri';
import { NavLink, Outlet } from 'react-router-dom';
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
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <p className="admin-sidebar__eyebrow">Parfum</p>
          <h1 className="admin-sidebar__title">Admin panel</h1>
          <p className="admin-sidebar__text">
            Отдельная рабочая зона для управления магазином.
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
            Сейчас это фундамент. Следом подключим CRUD товаров и список заказов.
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
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
