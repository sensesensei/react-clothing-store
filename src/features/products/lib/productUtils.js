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
