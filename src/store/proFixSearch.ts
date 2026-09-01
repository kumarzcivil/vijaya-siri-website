type Listener = () => void;

let query = '';
const listeners = new Set<Listener>();

export function getProFixSearch(): string {
  return query;
}

export function setProFixSearch(value: string) {
  if (query === value) return;
  query = value;
  listeners.forEach((fn) => fn());
}

export function subscribeProFixSearch(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
