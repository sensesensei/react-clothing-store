import { Link } from 'react-router-dom';
import { useCart } from '../../features/cart';
import {
  formatPrice,
  getProductOldPrice,
} from '../../features/products/lib/productUtils';
import { Button, EmptyState, Price } from '../../shared/ui';
import './CartPage.css';

function CartPage() {
  const {
    items,
    subtotal,
    totalItems,
    uniqueItems,
    clearCart,
    decrementItem,
    incrementItem,
    removeItem,
  } = useCart();

  if (items.length === 0) {
    return (
      <section className="cart-page cart-page--empty">
        <EmptyState
          title="Корзина пока пуста"
          message="Добавь товары из каталога, и они появятся здесь."
        />

        <div className="cart-empty-actions">
          <Button to="/catalog" variant="primary" size="md">
            Перейти в каталог
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="cart-page__head">
        <div>
          <h1 className="cart-page__title">Корзина</h1>
          <p className="cart-page__subtitle">
            {totalItems} шт. в корзине, {uniqueItems} позиций
          </p>
        </div>

        <Button to="/catalog" variant="primary" size="md">
          Продолжить покупки
        </Button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const currentPrice = formatPrice(item.price);
            const oldPrice = getProductOldPrice(item);
            const lineTotal = formatPrice(item.price * item.quantity);

            return (
              <article key={item.id} className="cart-item">
                <Link to={`/catalog/${item.slug}`} className="cart-item__media">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="cart-item__image"
                  />
                </Link>

                <div className="cart-item__content">
                  <div className="cart-item__main">
                    <Link to={`/catalog/${item.slug}`} className="cart-item__title">
                      {item.title}
                    </Link>

                    {item.size ? (
                      <p className="cart-item__meta">Размер: {item.size}</p>
                    ) : null}

                    <Price
                      className="cart-item__price"
                      current={currentPrice}
                      oldPrice={oldPrice}
                    />
                  </div>

                  <div className="cart-item__aside">
                    <div className="cart-item__quantity">
                      <button
                        type="button"
                        className="cart-quantity-btn"
                        onClick={() => decrementItem(item.id)}
                        aria-label={`Уменьшить количество ${item.title}`}
                      >
                        -
                      </button>

                      <span className="cart-item__quantity-value">{item.quantity}</span>

                      <button
                        type="button"
                        className="cart-quantity-btn"
                        onClick={() => incrementItem(item.id)}
                        aria-label={`Увеличить количество ${item.title}`}
                      >
                        +
                      </button>
                    </div>

                    <p className="cart-item__line-total">{lineTotal}</p>

                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2 className="cart-summary__title">Итог</h2>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Позиций</span>
              <strong>{uniqueItems}</strong>
            </div>

            <div className="cart-summary__row">
              <span>Товаров</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="cart-summary__row cart-summary__row--total">
              <span>К оплате</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </div>

          <p className="cart-summary__note">
            Все готово к оформлению. На следующем шаге ты заполнишь контактные
            данные и способ доставки.
          </p>

          <div className="cart-summary__actions">
            <Button to="/checkout" variant="primary" size="md" fullWidth>
              Оформить заказ
            </Button>

            <Button to="/catalog" variant="primary" size="md" fullWidth>
              Добавить еще
            </Button>

            <button
              type="button"
              className="cart-summary__clear"
              onClick={clearCart}
            >
              Очистить корзину
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
