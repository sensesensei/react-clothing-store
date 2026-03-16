import {
  createEmptyCategory,
  normalizeCategoryModel,
  serializeCategoryForWrite,
  validateCategoryModel,
} from './categorySchema';

describe('categorySchema', () => {
  test('normalizeCategoryModel trims strings and normalizes id', () => {
    expect(
      normalizeCategoryModel({
        id: '12',
        name: '  Ароматы  ',
        slug: '  aromas  ',
      }),
    ).toEqual({
      id: 12,
      name: 'Ароматы',
      slug: 'aromas',
    });
  });

  test('createEmptyCategory merges overrides into defaults', () => {
    expect(
      createEmptyCategory({
        name: 'Новая категория',
      }),
    ).toEqual({
      id: null,
      name: 'Новая категория',
      slug: '',
    });
  });

  test('validateCategoryModel checks required fields and slug format', () => {
    expect(validateCategoryModel({})).toEqual({
      name: 'Укажи название категории.',
      slug: 'Укажи slug категории.',
    });

    expect(
      validateCategoryModel({
        name: 'Ароматы',
        slug: 'ароматы',
      }),
    ).toEqual({
      slug: 'Только латиница, цифры и дефис.',
    });
  });

  test('serializeCategoryForWrite returns clean payload', () => {
    expect(
      serializeCategoryForWrite({
        name: '  Ароматы ',
        slug: ' aromas ',
      }),
    ).toEqual({
      name: 'Ароматы',
      slug: 'aromas',
    });
  });
});
