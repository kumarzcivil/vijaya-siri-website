const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-my-repo.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg: string; param: string }>;
}

function getAuthHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem('vs_auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...getAuthHeaders() };
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    const msg = json.errors?.map((e) => e.msg).join(', ') || json.message || 'Request failed';
    throw new Error(msg);
  }
  return json.data as T;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  category: 'booking' | 'quote' | 'service' | 'account' | 'system' | 'offer';
  customerId: string;
  read: boolean;
  sent: boolean;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

export async function fetchMyNotifications(): Promise<Notification[]> {
  return request<Notification[]>('GET', '/notifications/my');
}

export async function fetchAdminNotifications(params?: { category?: string; read?: string; customerId?: string }): Promise<Notification[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.read) qs.set('read', params.read);
  if (params?.customerId) qs.set('customerId', params.customerId);
  const query = qs.toString() ? `?${qs}` : '';
  return request<Notification[]>('GET', `/notifications/admin${query}`);
}

export async function fetchNotificationStats(): Promise<NotificationStats> {
  return request<NotificationStats>('GET', '/notifications/admin/stats');
}

export async function createNotification(data: Partial<Notification>): Promise<Notification> {
  return request<Notification>('POST', '/notifications/admin', data);
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return request<Notification>('PATCH', `/notifications/admin/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await request<void>('PATCH', '/notifications/my/read-all');
}

export async function deleteNotification(id: string): Promise<void> {
  await request<void>('DELETE', `/notifications/admin/${id}`);
}

export async function getVapidKey(): Promise<string> {
  const res = await request<{ publicKey: string }>('GET', '/notifications/vapid-key');
  return res.publicKey;
}

export async function subscribePush(subscription: PushSubscription, customerId?: string): Promise<void> {
  const sub = subscription.toJSON();
  console.log('[API] Sending subscription to backend:', {
    endpoint: sub.endpoint?.substring(0, 60) + '...',
    hasP256dh: !!sub.keys?.p256dh,
    hasAuth: !!sub.keys?.auth,
    customerId: customerId || '(anonymous)',
  });
  await request<unknown>('POST', '/notifications/subscribe', {
    endpoint: sub.endpoint,
    keys: sub.keys,
    customerId: customerId || '',
  });
  console.log('[API] Subscription saved successfully');
}

export async function unsubscribePush(endpoint: string): Promise<void> {
  await request<void>('POST', '/notifications/unsubscribe', { endpoint });
}
