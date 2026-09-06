const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface Address {
  _id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface AddressFormData {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
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

export async function getAddressesAPI(): Promise<ApiResponse<{ addresses: Address[] }>> {
  return apiRequest<{ addresses: Address[] }>('/addresses');
}

export async function addAddressAPI(payload: AddressFormData): Promise<ApiResponse<{ address: Address }>> {
  return apiRequest<{ address: Address }>('/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAddressAPI(
  addressId: string,
  payload: Partial<AddressFormData>
): Promise<ApiResponse<{ address: Address }>> {
  return apiRequest<{ address: Address }>(`/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAddressAPI(addressId: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export async function setDefaultAddressAPI(addressId: string): Promise<ApiResponse<{ address: Address }>> {
  return apiRequest<{ address: Address }>(`/addresses/${addressId}/default`, {
    method: 'PATCH',
  });
}
