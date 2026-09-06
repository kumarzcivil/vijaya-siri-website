const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com /api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface SiteControlData {
  maintenanceMode: boolean;
  pages: {
    home: boolean;
    projects: boolean;
    packages: boolean;
    proFix: boolean;
    quickFix: boolean;
    about: boolean;
    quote: boolean;
    account: boolean;
    offers: boolean;
  };
  locations: Record<string, { quickFix: boolean; proFix: boolean }>;
  quickFixLoginRequired: boolean;
  proFixLoginRequired: boolean;
  updatedAt: string;
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
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
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

export async function getSiteControlAPI(): Promise<ApiResponse<{ siteControl: SiteControlData }>> {
  return apiRequest<{ siteControl: SiteControlData }>('/site-control');
}

export async function updateGlobalAPI(
  maintenanceMode: boolean
): Promise<ApiResponse<{ siteControl: SiteControlData }>> {
  return apiRequest<{ siteControl: SiteControlData }>('/site-control/global', {
    method: 'PUT',
    body: JSON.stringify({ maintenanceMode }),
  });
}

export async function updatePageAPI(
  page: string,
  enabled: boolean
): Promise<ApiResponse<{ siteControl: SiteControlData }>> {
  return apiRequest<{ siteControl: SiteControlData }>(`/site-control/pages/${page}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
}

export async function updateLocationAPI(
  locationId: string,
  quickFix: boolean,
  proFix: boolean
): Promise<ApiResponse<{ siteControl: SiteControlData }>> {
  return apiRequest<{ siteControl: SiteControlData }>(`/site-control/locations/${locationId}`, {
    method: 'PUT',
    body: JSON.stringify({ quickFix, proFix }),
  });
}

export async function updateAccessAPI(
  quickFixLoginRequired?: boolean,
  proFixLoginRequired?: boolean
): Promise<ApiResponse<{ siteControl: SiteControlData }>> {
  const body: Record<string, boolean> = {};
  if (quickFixLoginRequired !== undefined) body.quickFixLoginRequired = quickFixLoginRequired;
  if (proFixLoginRequired !== undefined) body.proFixLoginRequired = proFixLoginRequired;
  return apiRequest<{ siteControl: SiteControlData }>('/site-control/access', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function getLocationsAPI(): Promise<
  ApiResponse<{
    locations: {
      quickFixLoginRequired: boolean;
      proFixLoginRequired: boolean;
      locations: Record<string, { quickFix: boolean; proFix: boolean }>;
    };
  }>
> {
  return apiRequest('/site-control/locations');
}

export async function resetSiteControlAPI(): Promise<ApiResponse<{ siteControl: SiteControlData }>> {
  return apiRequest<{ siteControl: SiteControlData }>('/site-control/reset', {
    method: 'POST',
  });
}
