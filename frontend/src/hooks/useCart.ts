import { useSyncExternalStore } from 'react';
import {
  getCartItems,
  getCartCount,
  getCartTotal,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  isInCart,
  subscribeCart,
  type CartItem,
} from '../store/cart';

export function useCart() {
  const items = useSyncExternalStore(subscribeCart, getCartItems);
  const count = useSyncExternalStore(subscribeCart, getCartCount);
  const total = useSyncExternalStore(subscribeCart, getCartTotal);

  return {
    items,
    count,
    total,
    addItem: addToCart,
    updateQuantity,
    removeItem: removeFromCart,
    clearCart,
    isInCart,
  };
}
