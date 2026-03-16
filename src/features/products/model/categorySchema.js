const CATEGORY_SLUG_PATTERN = /^[A-Za-z0-9-]+$/;

export const CATEGORY_FIELDS = Object.freeze({
  name: Object.freeze({
    key: 'name',
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
});

export const CATEGORY_DEFAULTS = Object.freeze({
  id: null,
  name: '',
  slug: '',
});

function normalizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeIdentifier(value) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (Number.isInteger(numericValue) && String(numericValue) === normalizedValue) {
    return numericValue;
  }

  return normalizedValue;
}

export function normalizeCategoryModel(category = {}) {
  return {
    ...CATEGORY_DEFAULTS,
    id: normalizeIdentifier(category.id),
    name: normalizeText(category.name),
    slug: normalizeText(category.slug),
  };
}

export function createEmptyCategory(overrides = {}) {
  return normalizeCategoryModel({
    ...CATEGORY_DEFAULTS,
    ...overrides,
  });
}

export function getEditableCategoryValues(category = {}) {
  const normalizedCategory = normalizeCategoryModel(category);

  return {
    name: normalizedCategory.name,
    slug: normalizedCategory.slug,
  };
}

export function serializeCategoryForWrite(category = {}) {
  const normalizedCategory = normalizeCategoryModel(category);

  return {
    name: normalizedCategory.name,
    slug: normalizedCategory.slug,
  };
}

export function validateCategoryModel(category = {}) {
  const normalizedCategory = normalizeCategoryModel(category);
  const errors = {};

  if (!normalizedCategory.name) {
    errors.name = 'Укажи название категории.';
  }

  if (!normalizedCategory.slug) {
    errors.slug = 'Укажи slug категории.';
  } else if (!CATEGORY_SLUG_PATTERN.test(normalizedCategory.slug)) {
    errors.slug = 'Только латиница, цифры и дефис.';
  }

  return errors;
}
