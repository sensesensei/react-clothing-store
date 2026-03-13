import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../shared/ui';
import './CheckoutSuccessPage.css';

function CheckoutSuccessPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order');

  return (
    <section className="checkout-success">
      <div className="checkout-success__card">
        <p className="checkout-success__eyebrow">Заказ оформлен</p>
        <h1 className="checkout-success__title">Спасибо за заказ</h1>

        <p className="checkout-success__text">
          Мы получили твою заявку и свяжемся для подтверждения деталей.
        </p>

        {orderId ? (
          <p className="checkout-success__order">
            Номер заказа: <strong>#{orderId}</strong>
          </p>
        ) : null}

        <div className="checkout-success__actions">
          <Button to="/catalog" variant="primary" size="md">
            вернуться в каталог
          </Button>
          <Link to="/" className="checkout-success__link">
            на главную
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CheckoutSuccessPage;
