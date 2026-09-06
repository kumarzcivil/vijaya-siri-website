const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com/api';

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

export interface MarketingStat {
  _id: string;
  value: string;
  label: string;
  icon: string;
  status: 'active' | 'inactive';
  displayOrder: number;
}

export interface MarketingService {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  ctaLabel: string;
  ctaTarget: string;
  status: 'active' | 'inactive';
  displayOrder: number;
}

// ---- Stats ----
export async function fetchMarketingStats(): Promise<MarketingStat[]> {
  return request<MarketingStat[]>('GET', '/marketing/stats');
}

export async function fetchAdminMarketingStats(): Promise<MarketingStat[]> {
  return request<MarketingStat[]>('GET', '/marketing/admin/stats');
}

export async function createMarketingStat(data: Partial<MarketingStat>): Promise<MarketingStat> {
  return request<MarketingStat>('POST', '/marketing/admin/stats', data);
}

export async function updateMarketingStat(id: string, data: Partial<MarketingStat>): Promise<MarketingStat> {
  return request<MarketingStat>('PUT', `/marketing/admin/stats/${id}`, data);
}

export async function toggleMarketingStat(id: string): Promise<MarketingStat> {
  return request<MarketingStat>('PATCH', `/marketing/admin/stats/${id}/toggle-status`);
}

export async function deleteMarketingStat(id: string): Promise<void> {
  await request<void>('DELETE', `/marketing/admin/stats/${id}`);
}

// ---- Services ----
export async function fetchMarketingServices(): Promise<MarketingService[]> {
  return request<MarketingService[]>('GET', '/marketing/services');
}

export async function fetchAdminMarketingServices(): Promise<MarketingService[]> {
  return request<MarketingService[]>('GET', '/marketing/admin/services');
}

export async function createMarketingService(data: Partial<MarketingService>): Promise<MarketingService> {
  return request<MarketingService>('POST', '/marketing/admin/services', data);
}

export async function updateMarketingService(id: string, data: Partial<MarketingService>): Promise<MarketingService> {
  return request<MarketingService>('PUT', `/marketing/admin/services/${id}`, data);
}

export async function toggleMarketingService(id: string): Promise<MarketingService> {
  return request<MarketingService>('PATCH', `/marketing/admin/services/${id}/toggle-status`);
}

export async function deleteMarketingService(id: string): Promise<void> {
  await request<void>('DELETE', `/marketing/admin/services/${id}`);
}
