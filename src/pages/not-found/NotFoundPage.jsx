import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="page-shell">
      <h1 className="page-shell__title">Страница не найдена</h1>
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
