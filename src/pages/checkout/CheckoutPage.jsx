import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../features/cart';
import {
  createOrder,
  DELIVERY_METHODS,
  getDeliveryPrice,
  getOrderTotals,
  ORDER_FORM_DEFAULTS,
  validateOrderForm,
} from '../../features/orders';
import { formatPrice } from '../../features/products/lib/productUtils';
import { Button, EmptyState } from '../../shared/ui';
import './CheckoutPage.css';

const FIELD_FOCUS_ORDER = Object.freeze([
  'customerName',
  'email',
  'phone',
  'telegram',
  'city',
  'deliveryMethod',
  'street',
  'house',
  'entrance',
  'floor',
  'apartmentOffice',
  'comment',
  'items',
]);

function getFirstInvalidFieldName(validationErrors = {}) {
  return FIELD_FOCUS_ORDER.find((fieldName) => validationErrors[fieldName]) || null;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const formRef = useRef(null);
  const fieldRefs = useRef({});
  const [formValues, setFormValues] = useState(ORDER_FORM_DEFAULTS);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = getOrderTotals(items, formValues.deliveryMethod);
  const deliveryPrice = getDeliveryPrice(formValues.deliveryMethod);

  function registerFieldRef(name) {
    return (node) => {
      if (node) {
        fieldRefs.current[name] = node;
        return;
      }

      delete fieldRefs.current[name];
    };
  }

  function focusFirstInvalidField(validationErrors) {
    const firstInvalidFieldName = getFirstInvalidFieldName(validationErrors);
    const targetField = firstInvalidFieldName
      ? fieldRefs.current[firstInvalidFieldName]
      : formRef.current;

    if (!targetField) {
      return;
    }

    if (typeof targetField.scrollIntoView === 'function') {
      targetField.scrollIntoView({
        behavior: 'smooth',
        block: targetField === formRef.current ? 'start' : 'center',
      });
    }

    if (typeof targetField.focus === 'function') {
      targetField.focus({ preventScroll: true });
    }
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    const nextValues = {
      ...formValues,
      [name]: value,
    };

    setFormValues(nextValues);

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextValidationErrors = validateOrderForm(nextValues, items);

      if (currentErrors[name] === nextValidationErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };

      if (nextValidationErrors[name]) {
        nextErrors[name] = nextValidationErrors[name];
      } else {
        delete nextErrors[name];
      }

      return nextErrors;
    });

    if (submitError) {
      setSubmitError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateOrderForm(formValues, items);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('');
      focusFirstInvalidField(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const order = await createOrder(formValues, items);
      clearCart();
      navigate(`/checkout/success?order=${order.id}`, { replace: true });
    } catch (error) {
      if (error.validationErrors) {
        setErrors(error.validationErrors);
        focusFirstInvalidField(error.validationErrors);
        return;
      }

      setSubmitError(error.message || 'Не удалось оформить заказ.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="checkout-page checkout-page--empty">
        <EmptyState
          title="Оформлять пока нечего"
          message="Корзина пуста. Добавь товары, и здесь появится форма заказа."
        />

        <div className="checkout-empty-actions">
          <Button to="/catalog" variant="primary" size="md">
            Перейти в каталог
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-page__head">
        <div>
          <h1 className="checkout-page__title">Оформление заказа</h1>
          <p className="checkout-page__subtitle">
            Заполни данные, и мы свяжемся для подтверждения заказа.
          </p>
        </div>

        <Button to="/cart" variant="primary" size="md">
          Вернуться в корзину
        </Button>
      </div>

      <div className="checkout-layout">
        <form
          ref={formRef}
          className="checkout-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <section className="checkout-card">
            <div className="checkout-card__head">
              <h2 className="checkout-card__title">Контакты</h2>
            </div>

            <div className="checkout-grid checkout-grid--contacts">
              <label className="checkout-field">
                <span className="checkout-field__label">Ф. И. О.</span>
                <input
                  ref={registerFieldRef('customerName')}
                  type="text"
                  name="customerName"
                  value={formValues.customerName}
                  onChange={handleFieldChange}
                  className={`checkout-input${errors.customerName ? ' is-invalid' : ''}`}
                  aria-invalid={Boolean(errors.customerName)}
                />
                {errors.customerName ? (
                  <span className="checkout-field__error">{errors.customerName}</span>
                ) : null}
              </label>

              <label className="checkout-field">
                <span className="checkout-field__label">E-mail</span>
                <input
                  ref={registerFieldRef('email')}
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleFieldChange}
                  className={`checkout-input${errors.email ? ' is-invalid' : ''}`}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? (
                  <span className="checkout-field__error">{errors.email}</span>
                ) : null}
              </label>

              <label className="checkout-field">
                <span className="checkout-field__label">Телефон</span>
                <input
                  ref={registerFieldRef('phone')}
                  type="tel"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleFieldChange}
                  className={`checkout-input${errors.phone ? ' is-invalid' : ''}`}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone ? (
                  <span className="checkout-field__error">{errors.phone}</span>
                ) : null}
              </label>

              <label className="checkout-field">
                <span className="checkout-field__label">Telegram</span>
                <input
                  ref={registerFieldRef('telegram')}
                  type="text"
                  name="telegram"
                  value={formValues.telegram}
                  onChange={handleFieldChange}
                  className="checkout-input"
                />
              </label>
            </div>
          </section>

          <section className="checkout-card">
            <div className="checkout-card__head">
              <h2 className="checkout-card__title">Доставка</h2>
            </div>

            <label className="checkout-field checkout-field--full">
              <span className="checkout-field__label">Город</span>
              <input
                ref={registerFieldRef('city')}
                type="text"
                name="city"
                value={formValues.city}
                onChange={handleFieldChange}
                className={`checkout-input${errors.city ? ' is-invalid' : ''}`}
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city ? (
                <span className="checkout-field__error">{errors.city}</span>
              ) : null}
            </label>

            <div className="checkout-delivery-list">
              {DELIVERY_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`checkout-delivery-option${formValues.deliveryMethod === method.value ? ' is-active' : ''}`}
                >
                  <input
                    ref={
                      method.value === DELIVERY_METHODS[0].value
                        ? registerFieldRef('deliveryMethod')
                        : undefined
                    }
                    type="radio"
                    name="deliveryMethod"
                    value={method.value}
                    checked={formValues.deliveryMethod === method.value}
                    onChange={handleFieldChange}
                  />

                  <span className="checkout-delivery-option__content">
                    <span className="checkout-delivery-option__main">
                      <span className="checkout-delivery-option__title">
                        {method.label}
                      </span>
                      {method.details ? (
                        <span className="checkout-delivery-option__details">
                          {method.details}
                        </span>
                      ) : null}
                    </span>
                    <span className="checkout-delivery-option__price">
                      {method.priceLabel}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {errors.deliveryMethod ? (
              <p className="checkout-field__error">{errors.deliveryMethod}</p>
            ) : null}

            <div className="checkout-grid checkout-grid--address">
              <label className="checkout-field checkout-field--span-2">
                <span className="checkout-field__label">Улица</span>
                <input
                  ref={registerFieldRef('street')}
                  type="text"
                  name="street"
                  value={formValues.street}
                  onChange={handleFieldChange}
                  className={`checkout-input${errors.street ? ' is-invalid' : ''}`}
                  aria-invalid={Boolean(errors.street)}
                />
                {errors.street ? (
                  <span className="checkout-field__error">{errors.street}</span>
                ) : null}
              </label>

              <label className="checkout-field">
                <span className="checkout-field__label">Дом</span>
                <input
                  ref={registerFieldRef('house')}
                  type="text"
                  name="house"
                  value={formValues.house}
                  onChange={handleFieldChange}
                  className={`checkout-input${errors.house ? ' is-invalid' : ''}`}
                  aria-invalid={Boolean(errors.house)}
                />
                {errors.house ? (
                  <span className="checkout-field__error">{errors.house}</span>
                ) : null}
              </label>

              <label className="checkout-field">
                <span className="checkout-field__label">Подъезд</span>
                <input
                  ref={registerFieldRef('entrance')}
                  type="text"
                  name="entrance"
                  value={formValues.entrance}
                  onChange={handleFieldChange}
                  className="checkout-input"
                />
              </label>

              <label className="checkout-field">
                <span className="checkout-field__label">Этаж</span>
                <input
                  ref={registerFieldRef('floor')}
                  type="text"
                  name="floor"
                  value={formValues.floor}
                  onChange={handleFieldChange}
                  className="checkout-input"
                />
              </label>

              <label className="checkout-field">
                <span className="checkout-field__label">Квартира / офис</span>
                <input
                  ref={registerFieldRef('apartmentOffice')}
                  type="text"
                  name="apartmentOffice"
                  value={formValues.apartmentOffice}
                  onChange={handleFieldChange}
                  className="checkout-input"
                />
              </label>
            </div>

            <label className="checkout-field checkout-field--full">
              <span className="checkout-field__label">Комментарий</span>
              <textarea
                ref={registerFieldRef('comment')}
                name="comment"
                value={formValues.comment}
                onChange={handleFieldChange}
                className="checkout-input checkout-textarea"
                placeholder="Комментарий к заказу"
                rows={5}
              />
            </label>
          </section>

          {submitError ? (
            <div className="checkout-submit-error" role="alert">
              {submitError}
            </div>
          ) : null}

          <div className="checkout-submit">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформляем...' : 'Оформить заказ'}
            </Button>
          </div>
        </form>

        <aside className="checkout-summary">
          <div className="checkout-card">
            <h2 className="checkout-card__title">Твой заказ</h2>

            <div className="checkout-summary__rows">
              <div className="checkout-summary__row">
                <span>Товары</span>
                <strong>{formatPrice(totals.itemsAmount)}</strong>
              </div>

              <div className="checkout-summary__row">
                <span>Доставка</span>
                <strong>{formatPrice(deliveryPrice)}</strong>
              </div>

              <div className="checkout-summary__row">
                <span>Позиций</span>
                <strong>{items.length}</strong>
              </div>

              <div className="checkout-summary__row">
                <span>Штук</span>
                <strong>{totals.totalItems}</strong>
              </div>

              <div className="checkout-summary__row checkout-summary__row--total">
                <span>К оплате</span>
                <strong>{formatPrice(totals.totalAmount)}</strong>
              </div>
            </div>

            <div className="checkout-summary__items">
              {items.map((item) => (
                <div key={item.id} className="checkout-summary__item">
                  <div className="checkout-summary__item-main">
                    <span className="checkout-summary__item-title">
                      {item.title}
                    </span>
                    <span className="checkout-summary__item-meta">
                      {item.quantity} шт.
                      {item.size ? ` / ${item.size}` : ''}
                    </span>
                  </div>
                  <strong className="checkout-summary__item-price">
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;
