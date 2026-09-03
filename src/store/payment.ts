import type { PaymentDraft } from '../data/payment';

type Listener = () => void;

const STORAGE_KEY = 'vs-payment-draft';

function readInitialDraft(): PaymentDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaymentDraft) : null;
  } catch {
    return null;
  }
}

let draft: PaymentDraft | null = readInitialDraft();
const listeners = new Set<Listener>();

export function getPaymentDraft(): PaymentDraft | null {
  return draft;
}

export function setPaymentDraft(value: PaymentDraft) {
  draft = value;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    window.console.debug('payment draft persistence unavailable');
  }
  listeners.forEach((fn) => fn());
}

export function clearPaymentDraft() {
  draft = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    window.console.debug('payment draft persistence unavailable');
  }
  listeners.forEach((fn) => fn());
}

export function subscribePaymentDraft(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
