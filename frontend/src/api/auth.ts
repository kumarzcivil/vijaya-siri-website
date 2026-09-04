const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthUser {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  role: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface SignupData {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  fullName: string;
  mobile: string;
  email: string;
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

export async function signupAPI(payload: SignupData): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginAPI(payload: LoginData): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMeAPI(): Promise<ApiResponse<{ user: AuthUser }>> {
  return apiRequest<{ user: AuthUser }>('/auth/me');
}

export async function updateProfileAPI(payload: ProfileUpdateData): Promise<ApiResponse<{ user: AuthUser }>> {
  return apiRequest<{ user: AuthUser }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
