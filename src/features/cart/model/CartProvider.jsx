import { createContext, useContext, useEffect, useState } from 'react';
import {
  createCartItemFromProduct,
  getCartTotals,
  normalizeCartItem,
  normalizeCartItems,
  normalizeCartQuantity,
} from './cartModel';
import { readCartItems, writeCartItems } from './cartStorage';

const CartContext = createContext(null);

function mergeCartItems(currentItem, nextItem) {
  return normalizeCartItem({
    ...currentItem,
    ...nextItem,
    quantity: normalizeCartQuantity(
      currentItem.quantity + nextItem.quantity,
      nextItem.stock ?? currentItem.stock,
    ),
  });
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCartItems());
  const normalizedItems = normalizeCartItems(items);

  useEffect(() => {
    writeCartItems(normalizedItems);
  }, [normalizedItems]);

  const totals = getCartTotals(normalizedItems);

  function addItem(product, options = {}) {
    const nextItem = createCartItemFromProduct(product, options);
    const mode = normalizedItems.some((item) => item.id === nextItem.id)
      ? 'updated'
      : 'added';

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === nextItem.id);

      if (!existingItem) {
        return [...currentItems, nextItem];
      }

      return currentItems.map((item) =>
        item.id === nextItem.id ? mergeCartItems(existingItem, nextItem) : item);
    });

    return { item: nextItem, mode };
  }

  function removeItem(itemId) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }

  function clearCart() {
    setItems([]);
  }

  function updateItemQuantity(itemId, quantity) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? normalizeCartItem({
            ...item,
            quantity: normalizeCartQuantity(quantity, item.stock),
          })
          : item));
  }

  function incrementItem(itemId) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? normalizeCartItem({
            ...item,
            quantity: item.quantity + 1,
          })
          : item));
  }

  function decrementItem(itemId) {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== itemId) {
          return [item];
        }

        if (item.quantity <= 1) {
          return [];
        }

        return [
          normalizeCartItem({
            ...item,
            quantity: item.quantity - 1,
          }),
        ];
      }));
  }

  const value = {
    items: normalizedItems,
    uniqueItems: totals.uniqueItems,
    totalItems: totals.totalItems,
    subtotal: totals.subtotal,
    addItem,
    removeItem,
    clearCart,
    updateItemQuantity,
    incrementItem,
    decrementItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
