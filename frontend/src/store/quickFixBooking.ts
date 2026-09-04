import type { QuickFixBooking } from '../data/quickfixBooking';

type Listener = () => void;

const STORAGE_KEY = 'vs-quickfix-booking';

function readInitialBooking(): QuickFixBooking | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuickFixBooking) : null;
  } catch {
    return null;
  }
}

let booking: QuickFixBooking | null = readInitialBooking();
const listeners = new Set<Listener>();

export function getQuickFixBooking(): QuickFixBooking | null {
  return booking;
}

export function setQuickFixBooking(value: QuickFixBooking) {
  booking = value;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    window.console.debug('quickfix booking persistence unavailable');
  }
  listeners.forEach((fn) => fn());
}

export function clearQuickFixBooking() {
  booking = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    window.console.debug('quickfix booking persistence unavailable');
  }
  listeners.forEach((fn) => fn());
}

export function subscribeQuickFixBooking(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
