import { normalizeCartItems } from './cartModel';

const CART_STORAGE_KEY = 'parfum_cart';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function readCartItems() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    return normalizeCartItems(JSON.parse(rawValue));
  } catch {
    return [];
  }
}

export function writeCartItems(items) {
  if (!canUseStorage()) {
    return;
  }

  try {
    const normalizedItems = normalizeCartItems(items);
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems));
  } catch {
    // Ignore storage write failures to keep the cart usable in memory.
  }
}
