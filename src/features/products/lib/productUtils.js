import { normalizeProductSizes } from '../model';

const priceFormatter = new Intl.NumberFormat('ru-RU');

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return `${priceFormatter.format(numericValue)} ₽`;
}

export function getProductOldPrice(product) {
  const currentPrice = Number(product?.price);
  const previousPrice = Number(product?.oldPrice);

  if (!Number.isFinite(previousPrice) || previousPrice <= currentPrice) {
    return null;
  }

  return formatPrice(previousPrice);
}

export function normalizeSizes(sizes) {
  return normalizeProductSizes(sizes);
}

export function getProductHighlights(product) {
  const descriptionItems = product.description
    ? product.description
      .split(/\r?\n|[.;]/)
      .map((item) => item.trim())
      .filter(Boolean)
    : [];

  if (descriptionItems.length > 0) {
    return descriptionItems.slice(0, 4);
  }

  const fallbackItems = [];

  if (product.category?.name) {
    fallbackItems.push(`Категория: ${product.category.name}`);
  }

  if (product.stock !== null && product.stock !== undefined) {
    fallbackItems.push(Number(product.stock) > 0 ? 'В наличии' : 'Под заказ');
  }

  return fallbackItems;
}
