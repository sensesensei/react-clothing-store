import { Outlet, useLocation } from 'react-router-dom';
import Menu from '../components/navigation/Menu';
import CategoryMenu from '../components/navigation/CategoryMenu';

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
