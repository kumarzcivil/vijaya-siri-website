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

export interface ProFixCategory {
  _id: string;
  name: string;
  icon: string;
  active: boolean;
  displayOrder: number;
}

export interface ProFixPricing {
  enabled: boolean;
  mode: string;
  rate?: number;
  unit?: string;
  quantityLabel?: string;
  defaultQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  step?: number;
}

export interface ProFixService {
  _id: string;
  name: string;
  category: string;
  description: string;
  image: { url: string; publicId: string };
  unit: string;
  startingPrice: string;
  included: string[];
  notes: string[];
  pricing?: ProFixPricing;
  siteVisitCharge: number;
  siteVisitWaiver: {
    enabled: boolean;
    label: string;
    amount: number;
    trigger: string;
  };
  active: boolean;
  displayOrder: number;
}

export interface ProFixBanner {
  _id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: { url: string; publicId: string };
  ctaLabel: string;
  ctaTarget: string;
  status: 'active' | 'inactive';
  priority: number;
  startDate: string;
  endDate: string;
  isSeeded: boolean;
}

export interface ProFixStats {
  total: number;
  active: number;
  inactive: number;
}

// ---- Categories ----
export async function fetchProFixCategories(params?: { active?: boolean }): Promise<ProFixCategory[]> {
  const query = params?.active !== undefined ? `?active=${params.active}` : '';
  return request<ProFixCategory[]>('GET', `/pro-fix/categories${query}`);
}

export async function fetchProFixAdminCategories(): Promise<ProFixCategory[]> {
  return request<ProFixCategory[]>('GET', '/pro-fix/admin/categories');
}

export async function createProFixCategory(data: { name: string; icon: string; active?: boolean }): Promise<ProFixCategory> {
  return request<ProFixCategory>('POST', '/pro-fix/admin/categories', data);
}

export async function updateProFixCategory(id: string, data: Partial<ProFixCategory>): Promise<ProFixCategory> {
  return request<ProFixCategory>('PUT', `/pro-fix/admin/categories/${id}`, data);
}

export async function toggleProFixCategory(id: string): Promise<ProFixCategory> {
  return request<ProFixCategory>('PATCH', `/pro-fix/admin/categories/${id}/toggle-active`);
}

export async function deleteProFixCategory(id: string): Promise<void> {
  await request<void>('DELETE', `/pro-fix/admin/categories/${id}`);
}

export async function reorderProFixCategories(orderedIds: string[]): Promise<ProFixCategory[]> {
  return request<ProFixCategory[]>('PUT', '/pro-fix/admin/categories-reorder', { orderedIds });
}

// ---- Services ----
export async function fetchProFixServices(params?: { active?: boolean; category?: string; search?: string }): Promise<ProFixService[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set('active', String(params.active));
  if (params?.category) qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString() ? `?${qs}` : '';
  return request<ProFixService[]>('GET', `/pro-fix/services${query}`);
}

export async function fetchProFixAdminServices(params?: { search?: string }): Promise<ProFixService[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  return request<ProFixService[]>('GET', `/pro-fix/admin/services${qs}`);
}

export async function fetchProFixServiceStats(): Promise<ProFixStats> {
  return request<ProFixStats>('GET', '/pro-fix/admin/services/stats');
}

export async function createProFixService(data: Partial<ProFixService>): Promise<ProFixService> {
  return request<ProFixService>('POST', '/pro-fix/admin/services', data);
}

export async function updateProFixService(id: string, data: Partial<ProFixService>): Promise<ProFixService> {
  return request<ProFixService>('PUT', `/pro-fix/admin/services/${id}`, data);
}

export async function toggleProFixService(id: string): Promise<ProFixService> {
  return request<ProFixService>('PATCH', `/pro-fix/admin/services/${id}/toggle-active`);
}

export async function deleteProFixService(id: string): Promise<void> {
  await request<void>('DELETE', `/pro-fix/admin/services/${id}`);
}

export async function reorderProFixServices(orderedIds: string[]): Promise<ProFixService[]> {
  return request<ProFixService[]>('PUT', '/pro-fix/admin/services-reorder', { orderedIds });
}

// ---- Banners ----
export async function fetchProFixBanners(params?: { active?: boolean }): Promise<ProFixBanner[]> {
  const qs = params?.active !== undefined ? `?active=${params.active}` : '';
  return request<ProFixBanner[]>('GET', `/pro-fix/banners${qs}`);
}

export async function fetchProFixAdminBanners(): Promise<ProFixBanner[]> {
  return request<ProFixBanner[]>('GET', '/pro-fix/admin/banners');
}

export async function createProFixBanner(data: Partial<ProFixBanner>): Promise<ProFixBanner> {
  return request<ProFixBanner>('POST', '/pro-fix/admin/banners', data);
}

export async function updateProFixBanner(id: string, data: Partial<ProFixBanner>): Promise<ProFixBanner> {
  return request<ProFixBanner>('PUT', `/pro-fix/admin/banners/${id}`, data);
}

export async function toggleProFixBanner(id: string): Promise<ProFixBanner> {
  return request<ProFixBanner>('PATCH', `/pro-fix/admin/banners/${id}/toggle-status`);
}

export async function deleteProFixBanner(id: string): Promise<void> {
  await request<void>('DELETE', `/pro-fix/admin/banners/${id}`);
}

// ---- Upload ----
export async function uploadImage(file: File, folder?: string): Promise<{ url: string; publicId: string }> {
  const token = localStorage.getItem('vs_auth_token');
  const formData = new FormData();
  formData.append('image', file);
  if (folder) formData.append('folder', folder);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json: ApiResponse<{ url: string; publicId: string }> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Upload failed');
  return json.data!;
}
