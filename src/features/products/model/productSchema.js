export const PRODUCT_DB_COLUMNS = Object.freeze({
  id: 'id',
  title: 'title',
  slug: 'slug',
  description: 'description',
  price: 'price',
  oldPrice: 'old_price',
  imageUrl: 'image_url',
  sizes: 'sizes',
  categoryId: 'category_id',
  stock: 'stock',
  isActive: 'is_active',
  createdAt: 'created_at',
});

export const PRODUCT_DB_SELECT = `
  ${PRODUCT_DB_COLUMNS.id},
  ${PRODUCT_DB_COLUMNS.title},
  ${PRODUCT_DB_COLUMNS.slug},
  ${PRODUCT_DB_COLUMNS.description},
  ${PRODUCT_DB_COLUMNS.price},
  ${PRODUCT_DB_COLUMNS.oldPrice},
  ${PRODUCT_DB_COLUMNS.imageUrl},
  ${PRODUCT_DB_COLUMNS.sizes},
  ${PRODUCT_DB_COLUMNS.categoryId},
  ${PRODUCT_DB_COLUMNS.stock},
  ${PRODUCT_DB_COLUMNS.isActive},
  ${PRODUCT_DB_COLUMNS.createdAt}
`;

export const PRODUCT_FIELDS = Object.freeze({
  title: Object.freeze({
    key: 'title',
    label: 'Название',
    input: 'text',
    required: true,
  }),
  slug: Object.freeze({
    key: 'slug',
    label: 'Slug',
    input: 'text',
    required: true,
  }),
  description: Object.freeze({
    key: 'description',
    label: 'Описание',
    input: 'textarea',
    required: false,
  }),
  price: Object.freeze({
    key: 'price',
    label: 'Цена',
    input: 'number',
    required: true,
  }),
  oldPrice: Object.freeze({
    key: 'oldPrice',
    label: 'Старая цена',
    input: 'number',
    required: false,
  }),
  imageUrl: Object.freeze({
    key: 'imageUrl',
    label: 'Изображение',
    input: 'text',
    required: true,
  }),
  sizes: Object.freeze({
    key: 'sizes',
    label: 'Размеры',
    input: 'chips',
    required: false,
  }),
  categoryId: Object.freeze({
    key: 'categoryId',
    label: 'Категория',
    input: 'select',
    required: false,
  }),
  stock: Object.freeze({
    key: 'stock',
    label: 'Остаток',
    input: 'number',
    required: false,
  }),
  isActive: Object.freeze({
    key: 'isActive',
    label: 'Опубликован',
    input: 'checkbox',
    required: false,
  }),
});

export const PRODUCT_EDITABLE_FIELDS = Object.freeze([
  'title',
  'slug',
  'description',
  'price',
  'oldPrice',
  'imageUrl',
  'sizes',
  'categoryId',
  'stock',
  'isActive',
]);

export const PRODUCT_READONLY_FIELDS = Object.freeze([
  'id',
  'category',
  'createdAt',
]);

export const PRODUCT_DEFAULTS = Object.freeze({
  id: null,
  title: '',
  slug: '',
  description: '',
  price: null,
  oldPrice: null,
  imageUrl: '',
  sizes: [],
  categoryId: null,
  category: null,
  stock: 0,
  isActive: true,
  createdAt: null,
});

function normalizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value);

  return normalizedValue || null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeNonNegativeInteger(value, fallback = 0) {
  const numericValue = normalizeNumber(value);

  if (numericValue === null) {
    return fallback;
  }

  return Math.max(0, Math.trunc(numericValue));
}

function normalizeBoolean(value, fallback = true) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === '1' || value === 1) {
    return true;
  }

  if (value === 'false' || value === '0' || value === 0) {
    return false;
  }

  return fallback;
}

function normalizeIdentifier(value) {
  const normalizedValue = normalizeNullableText(value);

  if (!normalizedValue) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (Number.isInteger(numericValue) && String(numericValue) === normalizedValue) {
    return numericValue;
  }

  return normalizedValue;
}

export function normalizeProductSizes(sizes) {
  if (Array.isArray(sizes)) {
    return sizes
      .map((size) => normalizeText(size))
      .filter(Boolean);
  }

  if (typeof sizes === 'string') {
    return sizes
      .split(',')
      .map((size) => normalizeText(size))
      .filter(Boolean);
  }

  return [];
}

export function normalizeProductCategory(category) {
  if (!category) {
    return null;
  }

  return {
    id: normalizeIdentifier(category.id),
    name: normalizeText(category.name),
    slug: normalizeText(category.slug),
  };
}

export function normalizeProductModel(product = {}) {
  const normalizedCategory = normalizeProductCategory(product.category);
  const normalizedCategoryId = normalizeIdentifier(
    product.categoryId ?? normalizedCategory?.id,
  );

  return {
    ...PRODUCT_DEFAULTS,
    id: normalizeIdentifier(product.id),
    title: normalizeText(product.title),
    slug: normalizeText(product.slug),
    description: normalizeText(product.description),
    price: normalizeNumber(product.price),
    oldPrice: normalizeNumber(product.oldPrice),
    imageUrl: normalizeText(product.imageUrl),
    sizes: normalizeProductSizes(product.sizes),
    categoryId: normalizedCategoryId,
    category: normalizedCategory,
    stock: normalizeNonNegativeInteger(product.stock, PRODUCT_DEFAULTS.stock),
    isActive: normalizeBoolean(product.isActive, PRODUCT_DEFAULTS.isActive),
    createdAt: normalizeNullableText(product.createdAt),
  };
}

export function createEmptyProduct(overrides = {}) {
  return normalizeProductModel({
    ...PRODUCT_DEFAULTS,
    ...overrides,
  });
}

export function getEditableProductValues(product = {}) {
  const normalizedProduct = normalizeProductModel(product);

  return PRODUCT_EDITABLE_FIELDS.reduce((values, field) => {
    values[field] = normalizedProduct[field];
    return values;
  }, {});
}

export function serializeProductForWrite(product = {}) {
  const normalizedProduct = normalizeProductModel(product);

  return {
    title: normalizedProduct.title,
    slug: normalizedProduct.slug,
    description: normalizedProduct.description || null,
    price: normalizedProduct.price,
    old_price: normalizedProduct.oldPrice,
    image_url: normalizedProduct.imageUrl || null,
    sizes: normalizedProduct.sizes,
    category_id: normalizedProduct.categoryId,
    stock: normalizedProduct.stock,
    is_active: normalizedProduct.isActive,
  };
}

export function validateProductModel(product = {}) {
  const normalizedProduct = normalizeProductModel(product);
  const errors = {};

  if (!normalizedProduct.title) {
    errors.title = 'Укажи название товара.';
  }

  if (!normalizedProduct.slug) {
    errors.slug = 'Укажи slug товара.';
  }

  if (normalizedProduct.price === null || normalizedProduct.price <= 0) {
    errors.price = 'Цена должна быть больше нуля.';
  }

  if (!normalizedProduct.imageUrl) {
    errors.imageUrl = 'Добавь основное изображение.';
  }

  if (
    normalizedProduct.oldPrice !== null
    && normalizedProduct.price !== null
    && normalizedProduct.oldPrice <= normalizedProduct.price
  ) {
    errors.oldPrice = 'Старая цена должна быть больше текущей.';
  }

  if (normalizedProduct.stock < 0) {
    errors.stock = 'Остаток не может быть отрицательным.';
  }

  return errors;
}
