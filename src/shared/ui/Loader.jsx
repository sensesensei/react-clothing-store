import './State.css';

function Loader({ className = '', compact = false, label = 'Загрузка...' }) {
  const stateClassName = [
    'ui-state',
    compact ? 'ui-state--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stateClassName} role="status" aria-live="polite">
      <span className="ui-state__spinner" aria-hidden="true" />
      <p className="ui-state__title">{label}</p>
    </div>
  );
}

export default Loader;
