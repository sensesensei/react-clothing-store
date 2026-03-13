import './Price.css';

function Price({
  className = '',
  current,
  currentClassName = '',
  oldPrice,
  oldPriceClassName = '',
}) {
  if (!current && !oldPrice) {
    return null;
  }

  return (
    <div className={['ui-price', className].filter(Boolean).join(' ')}>
      {current ? (
        <span className={['ui-price__current', currentClassName].filter(Boolean).join(' ')}>
          {current}
        </span>
      ) : null}

      {oldPrice ? (
        <span className={['ui-price__old', oldPriceClassName].filter(Boolean).join(' ')}>
          {oldPrice}
        </span>
      ) : null}
    </div>
  );
}

export default Price;
