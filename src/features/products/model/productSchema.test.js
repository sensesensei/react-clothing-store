import {
  normalizeProductModel,
  normalizeProductSizes,
  serializeProductForWrite,
  validateProductModel,
} from './productSchema';

describe('productSchema', () => {
  test('normalizeProductSizes parses comma-separated string', () => {
    expect(normalizeProductSizes('50 ml, 100 ml, travel')).toEqual([
      '50 ml',
      '100 ml',
      'travel',
    ]);
  });

  test('normalizeProductModel trims strings and normalizes numeric fields', () => {
    expect(
      normalizeProductModel({
        id: '8',
        title: ' Destroy ',
        slug: ' destroy ',
        price: '9000',
        oldPrice: '11000',
        imageUrl: ' https://example.com/image.jpg ',
        sizes: '50 ml, 100 ml',
        categoryId: '4',
        stock: '7',
        isActive: 'false',
      }),
    ).toMatchObject({
      id: 8,
      title: 'Destroy',
      slug: 'destroy',
      price: 9000,
      oldPrice: 11000,
      imageUrl: 'https://example.com/image.jpg',
      sizes: ['50 ml', '100 ml'],
      categoryId: 4,
      stock: 7,
      isActive: false,
    });
  });

  test('validateProductModel returns expected field errors', () => {
    expect(
      validateProductModel({
        title: '',
        slug: '',
        price: 0,
        imageUrl: '',
      }),
    ).toEqual({
      title: 'Укажи название товара.',
      slug: 'Укажи slug товара.',
      price: 'Цена должна быть больше нуля.',
      imageUrl: 'Добавь основное изображение.',
    });
  });

  test('validateProductModel checks that old price is greater than current price', () => {
    expect(
      validateProductModel({
        title: 'Destroy',
        slug: 'destroy',
        price: 9000,
        oldPrice: 8000,
        imageUrl: 'https://example.com/image.jpg',
      }),
    ).toEqual({
      oldPrice: 'Старая цена должна быть больше текущей.',
    });
  });

  test('serializeProductForWrite returns database payload', () => {
    expect(
      serializeProductForWrite({
        title: 'Destroy',
        slug: 'destroy',
        description: 'Smoky',
        price: 9000,
        oldPrice: 11000,
        imageUrl: 'https://example.com/image.jpg',
        sizes: ['50 ml'],
        categoryId: 2,
        stock: 4,
        isActive: true,
      }),
    ).toEqual({
      title: 'Destroy',
      slug: 'destroy',
      description: 'Smoky',
      price: 9000,
      old_price: 11000,
      image_url: 'https://example.com/image.jpg',
      sizes: ['50 ml'],
      category_id: 2,
      stock: 4,
      is_active: true,
    });
  });
});
