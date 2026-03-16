import {
  DELIVERY_METHODS,
  ORDER_STATUS,
  getOrderTotals,
  normalizeOrderForm,
  serializeOrderForWrite,
  serializeOrderItemsForWrite,
  validateOrderForm,
} from './orderSchema';

describe('orderSchema', () => {
  test('normalizeOrderForm trims values and falls back to default delivery method', () => {
    const normalizedForm = normalizeOrderForm({
      customerName: '  Roman  ',
      phone: '  +7 900 123 45 67 ',
      city: ' Москва ',
      deliveryMethod: 'unknown-method',
      street: ' Тверская ',
      house: ' 10 ',
    });

    expect(normalizedForm).toMatchObject({
      customerName: 'Roman',
      phone: '+7 900 123 45 67',
      city: 'Москва',
      deliveryMethod: DELIVERY_METHODS[0].value,
      street: 'Тверская',
      house: '10',
    });
  });

  test('validateOrderForm returns expected errors for invalid form and empty items', () => {
    expect(
      validateOrderForm(
        {
          customerName: 'A',
          phone: '123',
          email: 'wrong-email',
          city: '',
          street: '',
          house: '',
        },
        [],
      ),
    ).toEqual({
      customerName: 'Укажи Ф.И.О. получателя.',
      phone: 'Укажи корректный номер телефона.',
      email: 'Укажи корректный e-mail.',
      city: 'Укажи город доставки.',
      street: 'Укажи улицу.',
      house: 'Укажи дом.',
      items: 'Корзина пуста.',
    });
  });

  test('getOrderTotals calculates delivery and full total', () => {
    const totals = getOrderTotals(
      [
        { productId: 1, title: 'One', price: 2000, quantity: 2 },
        { productId: 2, title: 'Two', price: 500, quantity: 1 },
      ],
      'worldwide',
    );

    expect(totals).toEqual({
      totalItems: 3,
      itemsAmount: 4500,
      deliveryPrice: 1500,
      totalAmount: 6000,
    });
  });

  test('serializeOrderForWrite uses normalized values and default new status', () => {
    const payload = serializeOrderForWrite(
      {
        customerName: ' Roman ',
        phone: '+7 (900) 123-45-67',
        email: 'roman@example.com',
        city: 'Москва',
        street: 'Тверская',
        house: '10',
        deliveryMethod: 'russian-post',
      },
      [{ productId: 1, title: 'Destroy', price: 4000, quantity: 2 }],
    );

    expect(payload).toMatchObject({
      customer_name: 'Roman',
      phone: '+7 (900) 123-45-67',
      email: 'roman@example.com',
      city: 'Москва',
      street: 'Тверская',
      house: '10',
      delivery_method: 'russian-post',
      delivery_price: 900,
      total_amount: 8900,
      total_items: 2,
      status: ORDER_STATUS.NEW,
    });
  });

  test('serializeOrderItemsForWrite keeps only valid order items', () => {
    expect(
      serializeOrderItemsForWrite(15, [
        { productId: 1, title: 'Destroy', slug: 'destroy', imageUrl: 'img', price: 2000, size: '50 ml', quantity: 2 },
        { productId: null, title: '', price: 1000, quantity: 1 },
      ]),
    ).toEqual([
      {
        order_id: 15,
        product_id: '1',
        product_title: 'Destroy',
        product_slug: 'destroy',
        image_url: 'img',
        price: 2000,
        size: '50 ml',
        quantity: 2,
      },
    ]);
  });
});
