import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { getCategories } from '../../services/api/productsApi';
import './CategoryMenu.css';

function CategoryMenu() {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const currentCategory = String(query.category || '').toLowerCase();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await getCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="category-menu">
      <div className="category-menu-wrapper">
        <Link
          to="/catalog"
          className={`category-link ${currentCategory ? '' : 'active'}`}
        >
          Все товары
        </Link>

        {categories.map((category) => {
          const categorySlug = category.slug?.toLowerCase() || '';
          const categoryName = category.name?.toLowerCase() || '';
          const isActive =
            currentCategory === categorySlug || currentCategory === categoryName;

          return (
            <Link
              key={category.id}
              to={`/catalog?${queryString.stringify({ category: category.slug || category.name })}`}
              className={`category-link ${isActive ? 'active' : ''}`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryMenu;
