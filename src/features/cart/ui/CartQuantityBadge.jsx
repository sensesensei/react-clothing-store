import './CartQuantityBadge.css';

function CartQuantityBadge({ count = 0 }) {
  if (!count) {
    return null;
  }

  return (
    <span className="cart-quantity-badge" aria-label={`В корзине ${count}`}>
      {count}
    </span>
  );
}

export default CartQuantityBadge;
