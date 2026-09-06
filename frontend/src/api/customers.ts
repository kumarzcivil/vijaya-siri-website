const API_BASE = import.meta.env.VITE_API_URL || 'https://api.vijayasiri.com/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AdminCustomer {
  _id: string;
  fullName: string;
  mobile: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  addresses?: Array<{
    _id: string;
    label: string;
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListData {
  customers: AdminCustomer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  recentSignups: number;
}

function getToken(): string | null {
  try {
    return localStorage.getItem('vs_auth_token');
  } catch {
    return null;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, ...data };
  }

  return data;
}

export async function getAdminCustomersAPI(params?: {
  page?: number;
  search?: string;
  status?: 'active' | 'inactive';
}): Promise<ApiResponse<CustomerListData>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return apiRequest<CustomerListData>(`/admin/customers${qs ? `?${qs}` : ''}`);
}

export async function getAdminCustomerAPI(id: string): Promise<ApiResponse<AdminCustomer>> {
  return apiRequest<AdminCustomer>(`/admin/customers/${id}`);
}

export async function toggleAdminCustomerAPI(id: string): Promise<ApiResponse<AdminCustomer>> {
  return apiRequest<AdminCustomer>(`/admin/customers/${id}/toggle`, {
    method: 'PATCH',
  });
}

export async function deleteAdminCustomerAPI(id: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/admin/customers/${id}`, {
    method: 'DELETE',
  });
}

export async function getAdminCustomerStatsAPI(): Promise<ApiResponse<CustomerStats>> {
  return apiRequest<CustomerStats>('/admin/customers/stats');
}
