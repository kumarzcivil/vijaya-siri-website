const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website.onrender.com/api';

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

export interface Offer {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  ctaLabel: string;
  ctaTarget: string;
  status: 'active' | 'inactive';
  priority: number;
  startDate: string;
  endDate: string;
  badge: string;
  color: string;
  displayOrder: number;
}

export async function fetchOffers(): Promise<Offer[]> {
  return request<Offer[]>('GET', '/offers');
}

export async function fetchAdminOffers(): Promise<Offer[]> {
  return request<Offer[]>('GET', '/offers/admin');
}

export async function createOffer(data: Partial<Offer>): Promise<Offer> {
  return request<Offer>('POST', '/offers/admin', data);
}

export async function updateOffer(id: string, data: Partial<Offer>): Promise<Offer> {
  return request<Offer>('PUT', `/offers/admin/${id}`, data);
}

export async function toggleOffer(id: string): Promise<Offer> {
  return request<Offer>('PATCH', `/offers/admin/${id}/toggle-status`);
}

export async function deleteOffer(id: string): Promise<void> {
  await request<void>('DELETE', `/offers/admin/${id}`);
}

export async function reorderOffers(orderedIds: string[]): Promise<Offer[]> {
  return request<Offer[]>('PUT', '/offers/admin/reorder', { orderedIds });
}
