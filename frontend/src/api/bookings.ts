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

export interface Booking {
  _id: string;
  kind: 'quick-fix' | 'pro-fix';
  serviceId: string;
  serviceName: string;
  categoryName: string;
  slotDate: string;
  slotTime: string;
  amount: number;
  paymentRequired: boolean;
  paymentStatus: 'pending' | 'submitted' | 'paid' | 'pay_after_service' | 'none';
  paymentRef: string;
  paymentMethod: string;
  couponCode: string;
  couponDiscount: number;
  customerName: string;
  customerMobile: string;
  customerId: string;
  siteAddress: string;
  siteLocation: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

export async function createBooking(data: Partial<Booking>): Promise<Booking> {
  return request<Booking>('POST', '/bookings', data);
}

export async function fetchMyBookings(): Promise<Booking[]> {
  return request<Booking[]>('GET', '/bookings/my');
}

export async function fetchAdminBookings(params?: { status?: string; kind?: string; search?: string }): Promise<Booking[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.kind) qs.set('kind', params.kind);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString() ? `?${qs}` : '';
  return request<Booking[]>('GET', `/bookings/admin${query}`);
}

export async function fetchBookingStats(): Promise<BookingStats> {
  return request<BookingStats>('GET', '/bookings/admin/stats');
}

export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  return request<Booking>('PATCH', `/bookings/admin/${id}/status`, { status });
}

export async function deleteBooking(id: string): Promise<void> {
  await request<void>('DELETE', `/bookings/admin/${id}`);
}
