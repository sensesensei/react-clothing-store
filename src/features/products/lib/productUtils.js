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
  const previousPrice = Number(product?.old_price);

  if (!Number.isFinite(previousPrice) || previousPrice <= currentPrice) {
    return null;
  }

  return formatPrice(previousPrice);
}

export function normalizeSizes(sizes) {
  if (Array.isArray(sizes)) {
    return sizes
      .map((size) => String(size).trim())
      .filter(Boolean);
  }

  if (typeof sizes === 'string') {
    return sizes
      .split(',')
      .map((size) => size.trim())
      .filter(Boolean);
  }

  return [];
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

  if (product.categories?.name) {
    fallbackItems.push(`Категория: ${product.categories.name}`);
  }

  if (product.stock !== null && product.stock !== undefined) {
    fallbackItems.push(Number(product.stock) > 0 ? 'В наличии' : 'Под заказ');
  }

  return fallbackItems;
}
