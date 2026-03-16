import {
  createCartItemFromProduct,
  getCartTotals,
  normalizeCartItem,
  normalizeCartQuantity,
} from './cartModel';

describe('cartModel', () => {
  test('normalizeCartQuantity keeps minimum value of one and respects stock limit', () => {
    expect(normalizeCartQuantity(0)).toBe(1);
    expect(normalizeCartQuantity(8, 3)).toBe(3);
    expect(normalizeCartQuantity(2, 10)).toBe(2);
  });

  test('createCartItemFromProduct requires size when product has size options', () => {
    expect(() =>
      createCartItemFromProduct({
        id: 7,
        title: 'Destroy',
        sizes: ['50 ml', '100 ml'],
      })).toThrow('Выбери размер перед добавлением в корзину.');
  });

  test('createCartItemFromProduct creates normalized cart item', () => {
    const item = createCartItemFromProduct(
      {
        id: 11,
        slug: 'destroy',
        title: 'Destroy',
        imageUrl: 'https://example.com/image.jpg',
        price: 9000,
        oldPrice: 11000,
        sizes: ['50 ml'],
        stock: 2,
      },
      {
        quantity: 4,
        size: '50 ml',
      },
    );

    expect(item).toEqual({
      id: '11::50 ml',
      productId: 11,
      slug: 'destroy',
      title: 'Destroy',
      imageUrl: 'https://example.com/image.jpg',
      price: 9000,
      oldPrice: 11000,
      size: '50 ml',
      quantity: 2,
      stock: 2,
    });
  });

  test('getCartTotals aggregates normalized items', () => {
    const totals = getCartTotals([
      normalizeCartItem({ productId: 1, title: 'One', price: 1000, quantity: 2 }),
      normalizeCartItem({ productId: 2, title: 'Two', price: 500, quantity: 3 }),
    ]);

    expect(totals).toEqual({
      uniqueItems: 2,
      totalItems: 5,
      subtotal: 3500,
    });
  });
});
