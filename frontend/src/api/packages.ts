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

export interface PackageSpec {
  category: string;
  categoryOrder: number;
  rows: Array<{ label: string; value: string }>;
}

export interface Package {
  _id: string;
  name: string;
  pricePerSqFt: number;
  tagline: string;
  description: string;
  status: 'active' | 'inactive';
  priority: number;
  isDefault: boolean;
  specs: PackageSpec[];
  displayOrder: number;
}

export interface PackageFormData {
  name: string;
  comparisonName: string;
  description: string;
  price: number | null;
  pricePrefix: string;
  priceUnit: string;
  features: string[];
  popular: boolean;
  active: boolean;
  icon: string;
  displayOrder: number;
}

export async function fetchPackages(): Promise<Package[]> {
  return request<Package[]>('GET', '/packages');
}

export const getActivePackagesAPI = fetchPackages;

export async function fetchAdminPackages(): Promise<Package[]> {
  return request<Package[]>('GET', '/packages/admin');
}

export async function createPackage(data: Partial<Package>): Promise<Package> {
  return request<Package>('POST', '/packages/admin', data);
}

export async function updatePackage(id: string, data: Partial<Package>): Promise<Package> {
  return request<Package>('PUT', `/packages/admin/${id}`, data);
}

export async function deletePackage(id: string): Promise<void> {
  await request<void>('DELETE', `/packages/admin/${id}`);
}

export async function reorderPackages(orderedIds: string[]): Promise<Package[]> {
  return request<Package[]>('PUT', '/packages/admin/reorder', { orderedIds });
}

// Aliases for old API names used by AdminPackagesSection
export async function getPackagesAPI() {
  const packages = await fetchAdminPackages();
  return { success: true, data: { packages } };
}
export const createPackageAPI = createPackage;
export const updatePackageAPI = updatePackage;
export const deletePackageAPI = deletePackage;
export const reorderPackagesAPI = reorderPackages;
