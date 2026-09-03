import type { BookingRegistryRecord } from '../data/bookingsRegistry';

type Listener = () => void;

const STORAGE_KEY = 'vs_bookings_registry';

function readInitial(): BookingRegistryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookingRegistryRecord[]) : [];
  } catch {
    return [];
  }
}

let records: BookingRegistryRecord[] = readInitial();
let snapshot: BookingRegistryRecord[] | null = null;
const listeners = new Set<Listener>();

function computeSnapshot(): BookingRegistryRecord[] {
  return [...records].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getBookingsRegistry(): BookingRegistryRecord[] {
  if (snapshot === null) snapshot = computeSnapshot();
  return snapshot;
}

export function setBookingsRegistry(next: BookingRegistryRecord[]): void {
  records = next;
  snapshot = computeSnapshot();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  listeners.forEach((fn) => fn());
}

export function subscribeBookingsRegistry(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
