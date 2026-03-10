import ProductGrid from '../../features/products/components/ProductGrid';
import courses from '../../features/products/data/courses';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-wrapper">
      <div className="home-hero">
        <h1>Добро пожаловать в наш магазин</h1>
        <p>Откройте для себя нашу коллекцию премиум-товаров</p>
      </div>

      <ProductGrid products={courses} title="Наш каталог" />
    </div>
  );
}

export default HomePage;
