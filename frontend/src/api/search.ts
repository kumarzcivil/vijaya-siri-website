const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com/api';

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

export interface SearchResult {
  id: string;
  type: 'quick-fix' | 'pro-fix';
  name: string;
  description: string;
  image: string;
  category: string;
  price?: number | null;
  startingPrice?: string | null;
  duration?: string | null;
  url: string;
}

export interface SearchResults {
  quickFix: SearchResult[];
  proFix: SearchResult[];
}

export async function searchServices(query: string): Promise<SearchResults> {
  const qs = new URLSearchParams({ q: query });
  return request<SearchResults>('GET', `/search?${qs}`);
}
