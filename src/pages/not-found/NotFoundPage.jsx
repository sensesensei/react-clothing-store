import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="page-shell">
      <h1 className="page-shell__title">404 Not Found</h1>
      <p className="page-shell__text">
        Такой страницы не существует или она была перемещена.
      </p>
      <Link to="/catalog" className="page-shell__link">
        Перейти в каталог
      </Link>
    </section>
  );
}

export default NotFoundPage;
