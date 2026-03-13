import './State.css';

function EmptyState({
  className = '',
  compact = false,
  message = '',
  title = 'Ничего не найдено',
}) {
  const stateClassName = [
    'ui-state',
    compact ? 'ui-state--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stateClassName}>
      <p className="ui-state__title">{title}</p>
      {message ? <p className="ui-state__message">{message}</p> : null}
    </div>
  );
}

export default EmptyState;
