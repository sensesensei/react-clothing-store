import { normalizeProductSizes } from '../../products/model';

export const CART_ITEM_DEFAULTS = Object.freeze({
  id: '',
  productId: null,
  slug: '',
  title: '',
  imageUrl: '',
  price: 0,
  oldPrice: null,
  size: '',
  quantity: 1,
  stock: null,
});

function normalizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
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

function normalizeStockLimit(stock) {
  const normalizedStock = normalizeNumber(stock);

  if (normalizedStock === null || normalizedStock <= 0) {
    return null;
  }

  return Math.max(1, Math.trunc(normalizedStock));
}

export function getCartItemId(productId, size = '') {
  const normalizedProductId = normalizeIdentifier(productId);
  const normalizedSize = normalizeText(size);

  return normalizedSize
    ? `${normalizedProductId}::${normalizedSize}`
    : String(normalizedProductId);
}

export function normalizeCartQuantity(quantity, stock = null) {
  const normalizedQuantity = Math.max(1, Math.trunc(normalizeNumber(quantity, 1)));
  const stockLimit = normalizeStockLimit(stock);

  if (!stockLimit) {
    return normalizedQuantity;
  }

  return Math.min(normalizedQuantity, stockLimit);
}

export function normalizeCartItem(item = {}) {
  const productId = normalizeIdentifier(item.productId);
  const size = normalizeText(item.size);
  const stock = normalizeStockLimit(item.stock);

  return {
    ...CART_ITEM_DEFAULTS,
    id: getCartItemId(productId, size),
    productId,
    slug: normalizeText(item.slug),
    title: normalizeText(item.title),
    imageUrl: normalizeText(item.imageUrl),
    price: normalizeNumber(item.price, 0) ?? 0,
    oldPrice: normalizeNumber(item.oldPrice),
    size,
    quantity: normalizeCartQuantity(item.quantity, stock),
    stock,
  };
}

export function normalizeCartItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => normalizeCartItem(item))
    .filter((item) => item.productId !== null);
}

export function createCartItemFromProduct(product, options = {}) {
  const productId = normalizeIdentifier(product?.id ?? product?.slug);
  const availableSizes = normalizeProductSizes(product?.sizes);
  const selectedSize = normalizeText(options.size);

  if (productId === null) {
    throw new Error('Товар недоступен для добавления в корзину.');
  }

  if (availableSizes.length > 0 && !selectedSize) {
    throw new Error('Выбери размер перед добавлением в корзину.');
  }

  return normalizeCartItem({
    productId,
    slug: product?.slug,
    title: product?.title,
    imageUrl: product?.imageUrl,
    price: product?.price,
    oldPrice: product?.oldPrice,
    size: selectedSize,
    quantity: options.quantity ?? 1,
    stock: product?.stock,
  });
}

export function getCartTotals(items) {
  return normalizeCartItems(items).reduce(
    (totals, item) => {
      totals.uniqueItems += 1;
      totals.totalItems += item.quantity;
      totals.subtotal += item.price * item.quantity;
      return totals;
    },
    {
      uniqueItems: 0,
      totalItems: 0,
      subtotal: 0,
    },
  );
}
