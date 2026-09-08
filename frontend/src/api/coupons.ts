const API_BASE = import.meta.env.VITE_API_URL || 'https://api.vijayasiri.com/api';

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

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  serviceType: 'QUICK_FIX' | 'PRO_FIX' | 'BOTH';
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  couponId?: string;
  code?: string;
  discountType?: string;
  discountValue?: number;
  discount?: number;
  message?: string;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  return request<Coupon[]>('GET', '/coupons/admin');
}

export async function fetchActiveCoupons(): Promise<Coupon[]> {
  return request<Coupon[]>('GET', '/coupons/active');
}

export async function fetchCouponStats(): Promise<{ total: number; active: number; inactive: number }> {
  return request<{ total: number; active: number; inactive: number }>('GET', '/coupons/admin/stats');
}

export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  return request<Coupon>('POST', '/coupons/admin', data);
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
  return request<Coupon>('PUT', `/coupons/admin/${id}`, data);
}

export async function toggleCouponStatus(id: string): Promise<Coupon> {
  return request<Coupon>('PATCH', `/coupons/admin/${id}/toggle-status`);
}

export async function deleteCoupon(id: string): Promise<void> {
  await request<void>('DELETE', `/coupons/admin/${id}`);
}

export async function validateCoupon(code: string, serviceType: string, orderAmount: number): Promise<ValidateCouponResponse> {
  return request<ValidateCouponResponse>('POST', '/coupons/validate', { code, serviceType, orderAmount });
}
