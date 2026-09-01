type Listener = () => void;

let query = '';
const listeners = new Set<Listener>();

export function getQuickFixSearch(): string {
  return query;
}

export function setQuickFixSearch(value: string) {
  if (query === value) return;
  query = value;
  listeners.forEach((fn) => fn());
}

export function subscribeQuickFixSearch(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
