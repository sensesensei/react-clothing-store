import { Outlet, useLocation } from 'react-router-dom';
import Menu from '../components/Menu';
import CategoryMenu from '../components/CategoryMenu';

function MainLayout() {
  const location = useLocation();

  // Показываем CategoryMenu только на главной и каталоге
  const showCategoryMenu =
    location.pathname === '/' || location.pathname === '/catalog';

  return (
    <>
      <Menu />
      {showCategoryMenu && <CategoryMenu />}
      <Outlet />
    </>
  );
}

export default MainLayout;
