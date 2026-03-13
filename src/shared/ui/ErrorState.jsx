import './State.css';

function ErrorState({
  className = '',
  compact = false,
  message = 'Что-то пошло не так.',
  title = 'Ошибка',
}) {
  const stateClassName = [
    'ui-state',
    'ui-state--error',
    compact ? 'ui-state--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stateClassName} role="alert">
      <p className="ui-state__title">{title}</p>
      <p className="ui-state__message">{message}</p>
    </div>
  );
}

export default ErrorState;
