const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

/* ---- Public quote form types ---- */

export interface QuoteFormData {
  fullName: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  projectDescription?: string;
  projectLocation: string;
  projectType: string;
  area?: number;
  budget?: string;
  message?: string;
}

export interface QuoteSubmitResult {
  refId: string;
  _id: string;
}

/* ---- Admin quote types ---- */

export interface AdminQuote {
  _id: string;
  refId: string;
  fullName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  projectDescription: string;
  projectLocation: string;
  projectType: string;
  area?: number;
  budget: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  notes: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteListData {
  quotes: AdminQuote[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface QuoteStats {
  total: number;
  newCount: number;
  contacted: number;
  quoted: number;
  closed: number;
  unread: number;
  recentCount: number;
}

/* ---- Helpers ---- */

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

/* ---- Public API ---- */

export async function submitQuoteAPI(payload: QuoteFormData): Promise<ApiResponse<QuoteSubmitResult>> {
  return apiRequest<QuoteSubmitResult>('/quotes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getQuoteByRefAPI(refId: string): Promise<ApiResponse<AdminQuote>> {
  return apiRequest<AdminQuote>(`/quotes/${refId}`);
}

/* ---- Admin API ---- */

export async function getAdminQuotesAPI(params?: {
  page?: number;
  search?: string;
  status?: string;
  location?: string;
}): Promise<ApiResponse<QuoteListData>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.location) searchParams.set('location', params.location);
  const qs = searchParams.toString();
  return apiRequest<QuoteListData>(`/admin/quotes${qs ? `?${qs}` : ''}`);
}

export async function getAdminQuoteAPI(id: string): Promise<ApiResponse<AdminQuote>> {
  return apiRequest<AdminQuote>(`/admin/quotes/${id}`);
}

export async function updateQuoteStatusAPI(id: string, status: string): Promise<ApiResponse<AdminQuote>> {
  return apiRequest<AdminQuote>(`/admin/quotes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateQuoteNotesAPI(id: string, notes: string): Promise<ApiResponse<AdminQuote>> {
  return apiRequest<AdminQuote>(`/admin/quotes/${id}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

export async function deleteAdminQuoteAPI(id: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/admin/quotes/${id}`, {
    method: 'DELETE',
  });
}

export async function getAdminQuoteStatsAPI(): Promise<ApiResponse<QuoteStats>> {
  return apiRequest<QuoteStats>('/admin/quotes/stats');
}
