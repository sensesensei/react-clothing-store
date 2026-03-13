import Button from './Button';
import './State.css';

function NotFoundState({
  actionLabel = 'Вернуться в каталог',
  className = '',
  compact = false,
  message = 'Запрошенная страница или товар сейчас недоступны.',
  title = 'Ничего не найдено',
  to = '/catalog',
}) {
  const stateClassName = [
    'ui-state',
    'ui-state--not-found',
    compact ? 'ui-state--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stateClassName}>
      <p className="ui-state__title">{title}</p>
      {message ? <p className="ui-state__message">{message}</p> : null}
      {actionLabel ? (
        <div className="ui-state__actions">
          <Button to={to} variant="pill-dark" size="sm">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default NotFoundState;
