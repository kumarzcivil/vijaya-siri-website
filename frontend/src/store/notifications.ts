/* ========================
   NOTIFICATIONS REGISTRY
   Shared, frontend-only persisted notification feed. The customer
   /notifications page and the Control Center Notifications section both read
   from this registry (a notification with a customerId is customer-facing;
   admin sees all). Storage owned by this module (in-memory + localStorage +
   pub/sub via useSyncExternalStore). Storage key: vs_notifications
   ======================== */

export type NotificationCategory =
  | 'booking'
  | 'quote'
  | 'service'
  | 'account'
  | 'system';

type Listener = () => void;

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  customerId?: string;
  read: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'vs_notifications';

function readInitial(): NotificationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NotificationRecord[]) : [];
  } catch {
    return [];
  }
}

let notifications: NotificationRecord[] = readInitial();
let snapshot: NotificationRecord[] | null = null;
const listeners = new Set<Listener>();

function computeSnapshot(): NotificationRecord[] {
  return [...notifications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getNotifications(): NotificationRecord[] {
  if (snapshot === null) snapshot = computeSnapshot();
  return snapshot;
}

export function setNotifications(next: NotificationRecord[]): void {
  notifications = next;
  snapshot = computeSnapshot();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  listeners.forEach((fn) => fn());
}

export function subscribeNotifications(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function generateNotificationId(): string {
  return `ntf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addNotification(
  input: Omit<NotificationRecord, 'id' | 'read' | 'createdAt'>
): NotificationRecord {
  const record: NotificationRecord = {
    ...input,
    id: generateNotificationId(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  setNotifications([record, ...notifications]);
  return record;
}

export function markNotificationRead(id: string): NotificationRecord[] {
  const next = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  setNotifications(next);
  return next;
}

export function deleteNotification(id: string): NotificationRecord[] {
  const next = notifications.filter((n) => n.id !== id);
  setNotifications(next);
  return next;
}

export function getCustomerNotifications(customerId?: string): NotificationRecord[] {
  const all = getNotifications();
  if (!customerId) return all;
  return all.filter((n) => !n.customerId || n.customerId === customerId);
}
