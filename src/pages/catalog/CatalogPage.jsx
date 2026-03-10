import queryString from 'query-string';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import courses from '../../features/products/data/courses';
import ProductGrid from '../../features/products/components/ProductGrid';
import './CatalogPage.css';

const SORT_KEYS = ['title', 'slug', 'id'];

function sortCourses(courses, key) {
  const sortedCourses = [...courses];
  if (!key || !SORT_KEYS.includes(key)) {
    return sortedCourses;
  }
  sortedCourses.sort((a, b) => (a[key] > b[key] ? 1 : -1));
  return sortedCourses;
}

function CatalogPage() {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const navigate = useNavigate();
  const [sortkey, setSortKey] = useState(query.sort);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedCourses, setSortedCourses] = useState(
    sortCourses(courses, sortkey),
  );

  useEffect(() => {
    if (sortkey && !SORT_KEYS.includes(sortkey)) {
      navigate('.');
      setSortKey();
      setSortedCourses([...courses]);
    }
  }, [sortkey, navigate]);

  // Обновляем сортировку и список при изменении параметров в URL
  useEffect(() => {
    const q = queryString.parse(location.search);
    const newSort = q.sort;
    setSortKey(newSort);
    setSortedCourses(sortCourses(courses, newSort));
  }, [location.search]);

  // Фильтруем товары по категории
  const categoryCourses = query.category
    ? sortedCourses.filter(
        (course) =>
          course.category &&
          course.category.toLowerCase() === query.category.toLowerCase(),
      )
    : sortedCourses;

  // Фильтруем товары по поиску (и по категории одновременно)
  const filteredCourses = categoryCourses.filter((course) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchLower) ||
      course.slug.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="catalog-container">
      <div className="search-section">
        <input
          type="text"
          placeholder="Поиск по названию или артикулу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <span className="search-results-count">
            Найдено: {filteredCourses.length}
          </span>
        )}
        {query.category && (
          <span className="category-label">
            Категория: <strong>{query.category}</strong>
          </span>
        )}
      </div>
      <ProductGrid
        products={filteredCourses}
        title={
          query.category
            ? `${query.category}`
            : sortkey
              ? `сортировка по ${sortkey}`
              : 'каталог'
        }
      />
    </div>
  );
}

export default CatalogPage;
