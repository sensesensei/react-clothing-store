import ProductGrid from './ProductGrid';
import courses from '../data/courses';
import './Home.css';

function Home() {
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

export default Home;
