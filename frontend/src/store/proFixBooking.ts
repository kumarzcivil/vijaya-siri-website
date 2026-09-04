import type { ProFixSiteVisitOrder } from '../data/profix';

type Listener = () => void;

const STORAGE_KEY = 'vs-profix-site-visit-order';

function readInitialOrder(): ProFixSiteVisitOrder | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProFixSiteVisitOrder) : null;
  } catch {
    return null;
  }
}

let order: ProFixSiteVisitOrder | null = readInitialOrder();
const listeners = new Set<Listener>();

export function getProFixBooking(): ProFixSiteVisitOrder | null {
  return order;
}

export function setProFixBooking(value: ProFixSiteVisitOrder) {
  order = value;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    window.console.debug('profix booking persistence unavailable');
  }
  listeners.forEach((fn) => fn());
}

export function clearProFixBooking() {
  order = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    window.console.debug('profix booking persistence unavailable');
  }
  listeners.forEach((fn) => fn());
}

export function subscribeProFixBooking(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
