const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com/api';

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
  authProvider?: string;
  preferredAction?: string;
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
  preferredAction?: string;
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

export interface SendOTPData {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export async function sendOTPAPI(payload: SendOTPData): Promise<ApiResponse<{ email: string }>> {
  return apiRequest<{ email: string }>('/auth/verify/send-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyOTPAPI(payload: VerifyOTPData): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('/auth/verify/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resendOTPAPI(email: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>('/auth/verify/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
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

export async function adminLoginAPI(payload: LoginData): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function googleAuthAPI(payload: { credential: string }): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
