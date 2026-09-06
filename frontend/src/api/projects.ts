const API_BASE = import.meta.env.VITE_API_URL || 'https://vijaya-siri-website-qvmi.onrender.com /api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface ProjectImage {
  url: string;
  isCover: boolean;
}

export interface Project {
  _id: string;
  name: string;
  location: string;
  city: string;
  type: string;
  size: string;
  bedrooms: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  rating: number;
  displayOrder: number;
  tags: string[];
  imageUrl: string;
  images: ProjectImage[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  name: string;
  location: string;
  city: string;
  type: string;
  size: string;
  bedrooms: string;
  status: string;
  rating: number;
  displayOrder: number;
  tags: string;
  featured: boolean;
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

export async function getProjectsAPI(): Promise<ApiResponse<{ projects: Project[] }>> {
  return apiRequest<{ projects: Project[] }>('/projects');
}

export async function getProjectAPI(id: string): Promise<ApiResponse<{ project: Project }>> {
  return apiRequest<{ project: Project }>(`/projects/${id}`);
}

export async function createProjectAPI(
  formData: ProjectFormData,
  imageFiles?: File[] | null,
  coverIndex?: number
): Promise<ApiResponse<{ project: Project }>> {
  const body = new FormData();
  body.append('name', formData.name);
  body.append('location', formData.location);
  body.append('city', formData.city);
  body.append('type', formData.type);
  body.append('size', formData.size);
  body.append('bedrooms', formData.bedrooms);
  body.append('status', formData.status);
  body.append('rating', String(formData.rating));
  body.append('displayOrder', String(formData.displayOrder));
  body.append('tags', formData.tags);
  body.append('featured', String(formData.featured));
  if (coverIndex !== undefined) {
    body.append('coverIndex', String(coverIndex));
  }
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => body.append('images', file));
  }

  return apiRequest<{ project: Project }>('/projects', {
    method: 'POST',
    body,
  });
}

export async function updateProjectAPI(
  id: string,
  formData: ProjectFormData,
  imageFiles?: File[] | null,
  existingImages?: ProjectImage[],
  coverIndex?: number
): Promise<ApiResponse<{ project: Project }>> {
  const body = new FormData();
  body.append('name', formData.name);
  body.append('location', formData.location);
  body.append('city', formData.city);
  body.append('type', formData.type);
  body.append('size', formData.size);
  body.append('bedrooms', formData.bedrooms);
  body.append('status', formData.status);
  body.append('rating', String(formData.rating));
  body.append('displayOrder', String(formData.displayOrder));
  body.append('tags', formData.tags);
  body.append('featured', String(formData.featured));
  if (coverIndex !== undefined) {
    body.append('coverIndex', String(coverIndex));
  }
  if (existingImages) {
    body.append('existingImages', JSON.stringify(existingImages));
  }
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => body.append('images', file));
  }

  return apiRequest<{ project: Project }>(`/projects/${id}`, {
    method: 'PUT',
    body,
  });
}

export async function deleteProjectAPI(id: string): Promise<ApiResponse<null>> {
  return apiRequest<null>(`/projects/${id}`, {
    method: 'DELETE',
  });
}
