const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com /api';

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

export interface QuickFixCategory {
  _id: string;
  name: string;
  icon: string;
  active: boolean;
  displayOrder: number;
}

export interface QuickFixPricing {
  enabled: boolean;
  price?: number;
  priceNote?: string;
}

export interface QuickFixDuration {
  value: number;
  unit: string;
}

export interface QuickFixService {
  _id: string;
  name: string;
  categoryId: string;
  image: { url: string; publicId: string };
  shortDescription: string;
  description: string;
  includedItems: string[];
  notes: string[];
  pricing?: QuickFixPricing;
  duration?: QuickFixDuration;
  active: boolean;
  featured: boolean;
  displayOrder: number;
  bookingConfiguration: {
    requiresTimeSlot: boolean;
    requiresPayment: boolean;
  };
}

export type QuickFixBannerDestinationType = 'none' | 'service' | 'category' | 'external';

export interface QuickFixBanner {
  _id: string;
  image: { url: string; publicId: string };
  internalName: string;
  active: boolean;
  displayOrder: number;
  startDate: string;
  endDate: string;
  ctaLabel: string;
  destinationType: QuickFixBannerDestinationType;
  destination: string;
}

export interface QuickFixStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
}

// ---- Categories ----
export async function fetchQuickFixCategories(params?: { active?: boolean }): Promise<QuickFixCategory[]> {
  const query = params?.active !== undefined ? `?active=${params.active}` : '';
  return request<QuickFixCategory[]>('GET', `/quick-fix/categories${query}`);
}

export async function fetchQuickFixAdminCategories(): Promise<QuickFixCategory[]> {
  return request<QuickFixCategory[]>('GET', '/quick-fix/admin/categories');
}

export async function createQuickFixCategory(data: { name: string; icon: string; active?: boolean }): Promise<QuickFixCategory> {
  return request<QuickFixCategory>('POST', '/quick-fix/admin/categories', data);
}

export async function updateQuickFixCategory(id: string, data: Partial<QuickFixCategory>): Promise<QuickFixCategory> {
  return request<QuickFixCategory>('PUT', `/quick-fix/admin/categories/${id}`, data);
}

export async function toggleQuickFixCategory(id: string): Promise<QuickFixCategory> {
  return request<QuickFixCategory>('PATCH', `/quick-fix/admin/categories/${id}/toggle-active`);
}

export async function deleteQuickFixCategory(id: string): Promise<void> {
  await request<void>('DELETE', `/quick-fix/admin/categories/${id}`);
}

export async function reorderQuickFixCategories(orderedIds: string[]): Promise<QuickFixCategory[]> {
  return request<QuickFixCategory[]>('PUT', '/quick-fix/admin/categories-reorder', { orderedIds });
}

// ---- Services ----
export async function fetchQuickFixServices(params?: { active?: boolean; categoryId?: string; search?: string }): Promise<QuickFixService[]> {
  const qs = new URLSearchParams();
  if (params?.active !== undefined) qs.set('active', String(params.active));
  if (params?.categoryId) qs.set('categoryId', params.categoryId);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString() ? `?${qs}` : '';
  return request<QuickFixService[]>('GET', `/quick-fix/services${query}`);
}

export async function fetchQuickFixAdminServices(params?: { search?: string }): Promise<QuickFixService[]> {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : '';
  return request<QuickFixService[]>('GET', `/quick-fix/admin/services${qs}`);
}

export async function fetchQuickFixServiceStats(): Promise<QuickFixStats> {
  return request<QuickFixStats>('GET', '/quick-fix/admin/services/stats');
}

export async function createQuickFixService(data: Partial<QuickFixService>): Promise<QuickFixService> {
  return request<QuickFixService>('POST', '/quick-fix/admin/services', data);
}

export async function updateQuickFixService(id: string, data: Partial<QuickFixService>): Promise<QuickFixService> {
  return request<QuickFixService>('PUT', `/quick-fix/admin/services/${id}`, data);
}

export async function toggleQuickFixService(id: string): Promise<QuickFixService> {
  return request<QuickFixService>('PATCH', `/quick-fix/admin/services/${id}/toggle-active`);
}

export async function deleteQuickFixService(id: string): Promise<void> {
  await request<void>('DELETE', `/quick-fix/admin/services/${id}`);
}

export async function reorderQuickFixServices(orderedIds: string[]): Promise<QuickFixService[]> {
  return request<QuickFixService[]>('PUT', '/quick-fix/admin/services-reorder', { orderedIds });
}

// ---- Banners ----
export async function fetchQuickFixBanners(params?: { active?: boolean }): Promise<QuickFixBanner[]> {
  const qs = params?.active !== undefined ? `?active=${params.active}` : '';
  return request<QuickFixBanner[]>('GET', `/quick-fix/banners${qs}`);
}

export async function fetchQuickFixAdminBanners(): Promise<QuickFixBanner[]> {
  return request<QuickFixBanner[]>('GET', '/quick-fix/admin/banners');
}

export async function createQuickFixBanner(data: Partial<QuickFixBanner>): Promise<QuickFixBanner> {
  return request<QuickFixBanner>('POST', '/quick-fix/admin/banners', data);
}

export async function updateQuickFixBanner(id: string, data: Partial<QuickFixBanner>): Promise<QuickFixBanner> {
  return request<QuickFixBanner>('PUT', `/quick-fix/admin/banners/${id}`, data);
}

export async function toggleQuickFixBanner(id: string): Promise<QuickFixBanner> {
  return request<QuickFixBanner>('PATCH', `/quick-fix/admin/banners/${id}/toggle-active`);
}

export async function deleteQuickFixBanner(id: string): Promise<void> {
  await request<void>('DELETE', `/quick-fix/admin/banners/${id}`);
}

export async function reorderQuickFixBanners(orderedIds: string[]): Promise<QuickFixBanner[]> {
  return request<QuickFixBanner[]>('PUT', '/quick-fix/admin/banners-reorder', { orderedIds });
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
