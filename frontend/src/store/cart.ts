type Listener = () => void;

const STORAGE_KEY = 'vs-cart';

export interface CartItem {
  id: string;
  kind: 'quick-fix' | 'pro-fix';
  serviceId: string;
  serviceName: string;
  categoryName: string;
  image?: string;
  price: number;
  quantity: number;
  unit: string;
  siteVisitCharge?: number;
  maxQuantity?: number;
  minQuantity?: number;
  addedAt: number;
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let items: CartItem[] = readCart();
const listeners = new Set<Listener>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* noop */
  }
  listeners.forEach((fn) => fn());
}

export function getCartItems(): CartItem[] {
  return items;
}

export function getCartCount(): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function getCartTotal(): number {
  return items.reduce((sum, i) => {
    const itemTotal = i.price * i.quantity;
    return sum + itemTotal + (i.siteVisitCharge || 0);
  }, 0);
}

export function addToCart(item: Omit<CartItem, 'addedAt'>): boolean {
  const existing = items.find((i) => i.serviceId === item.serviceId && i.kind === item.kind);
  if (existing) {
    const max = item.maxQuantity || 99;
    if (existing.quantity >= max) return false;
    existing.quantity = Math.min(existing.quantity + item.quantity, max);
  } else {
    items.push({ ...item, addedAt: Date.now() });
  }
  persist();
  return true;
}

export function updateQuantity(serviceId: string, kind: string, quantity: number): boolean {
  const item = items.find((i) => i.serviceId === serviceId && i.kind === kind);
  if (!item) return false;
  const min = item.minQuantity || 1;
  const max = item.maxQuantity || 99;
  item.quantity = Math.max(min, Math.min(quantity, max));
  persist();
  return true;
}

export function removeFromCart(serviceId: string, kind: string) {
  items = items.filter((i) => !(i.serviceId === serviceId && i.kind === kind));
  persist();
}

export function clearCart() {
  items = [];
  persist();
}

export function isInCart(serviceId: string, kind: string): boolean {
  return items.some((i) => i.serviceId === serviceId && i.kind === kind);
}

export function subscribeCart(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
