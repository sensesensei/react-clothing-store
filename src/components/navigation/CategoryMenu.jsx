import { Link, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import './CategoryMenu.css';

function CategoryMenu() {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const currentCategory = query.category?.toLowerCase() || null;

  const categories = [
    'верхняя одежда',
    'худи и свитера',
    'рубашки',
    'футболки и лонгсливы',
    'штаны и деним',
    'Сумки',
    'аксессуары',
  ];

  return (
    <div className="category-menu">
      <div className="category-menu-wrapper">
        {categories.map((category) => {
          const isActive = currentCategory === category.toLowerCase();
          return (
            <Link
              key={category}
              to={`/catalog?category=${category.toLowerCase()}`}
              className={`category-link ${isActive ? 'active' : ''}`}
            >
              {category}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryMenu;
