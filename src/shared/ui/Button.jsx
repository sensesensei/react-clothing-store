import { Link } from 'react-router-dom';
import './Button.css';

function getClassName({ variant, size, fullWidth, className }) {
  return [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? 'ui-button--full-width' : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');
}

function Button({
  children,
  className = '',
  fullWidth = false,
  href,
  size = 'md',
  to,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const buttonClassName = getClassName({
    variant,
    size,
    fullWidth,
    className,
  });

  if (to) {
    return (
      <Link to={to} className={buttonClassName} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={buttonClassName} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={buttonClassName} {...props}>
      {children}
    </button>
  );
}

export default Button;
