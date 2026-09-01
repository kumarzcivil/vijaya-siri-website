export interface FeaturedProject {
  id: string;
  name: string;
  location: string;
  city: string;
  type: string;
  size: string;
  bedrooms: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  statusLabel: string;
  rating: number;
  imageUrl: string;
  features: string[];
  tags: string[];
  featured: boolean;
  displayOrder: number;
}

export const defaultProjects: FeaturedProject[] = [
  {
    id: 'p1',
    name: 'Serenity Heights',
    location: 'Siruguppa, Karnataka',
    city: 'Siruguppa',
    type: 'Residential Villa',
    size: '2,400 sq.ft',
    bedrooms: '4 BHK',
    status: 'completed',
    statusLabel: 'Completed',
    rating: 4.9,
    imageUrl: '',
    features: ['4 BHK', 'Garden', 'Smart Home'],
    tags: ['villa', 'smart-home', 'premium'],
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'p2',
    name: 'Green Valley Homes',
    location: 'Adoni, Andhra Pradesh',
    city: 'Adoni',
    type: 'Independent House',
    size: '1,850 sq.ft',
    bedrooms: '3 BHK',
    status: 'in-progress',
    statusLabel: 'In Progress',
    rating: 4.8,
    imageUrl: '',
    features: ['3 BHK', 'Modular Kitchen', 'Parking'],
    tags: ['house', 'modular', 'family'],
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'p3',
    name: 'Royal Residency',
    location: 'Sindhanur, Karnataka',
    city: 'Sindhanur',
    type: 'Luxury Villa',
    size: '3,200 sq.ft',
    bedrooms: '5 BHK',
    status: 'completed',
    statusLabel: 'Completed',
    rating: 5.0,
    imageUrl: '',
    features: ['5 BHK', 'Pool', 'Home Theatre'],
    tags: ['luxury', 'villa', 'premium'],
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'p4',
    name: 'Lakewood Estates',
    location: 'Siruguppa, Karnataka',
    city: 'Siruguppa',
    type: 'Residential Complex',
    size: '2,100 sq.ft',
    bedrooms: '3 BHK',
    status: 'in-progress',
    statusLabel: 'In Progress',
    rating: 4.7,
    imageUrl: '',
    features: ['3 BHK', 'Balcony', 'Gym'],
    tags: ['complex', 'amenities', 'family'],
    featured: true,
    displayOrder: 4,
  },
];

const STORAGE_KEY = 'vijayasiri_projects';

export function getProjects(): FeaturedProject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as FeaturedProject[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [...defaultProjects];
}

export function saveProjects(projects: FeaturedProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getFeaturedProjects(): FeaturedProject[] {
  return getProjects()
    .filter((p) => p.featured)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function updateProject(id: string, updates: Partial<FeaturedProject>): FeaturedProject[] {
  const projects = getProjects();
  const updated = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveProjects(updated);
  return updated;
}

export function addProject(data: Partial<FeaturedProject>): FeaturedProject[] {
  const projects = getProjects();
  const id = data.id || `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const status = data.status || 'completed';
  const statusLabel = data.statusLabel || (status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Upcoming');
  const nextOrder =
    projects.reduce((max, p) => (typeof p.displayOrder === 'number' && p.displayOrder > max ? p.displayOrder : max), 0) + 1;
  const project: FeaturedProject = {
    name: data.name || 'Untitled Project',
    location: data.location || '',
    city: data.city || '',
    type: data.type || '',
    size: data.size || '',
    bedrooms: data.bedrooms || '',
    status,
    statusLabel,
    rating: data.rating ?? 0,
    imageUrl: data.imageUrl || '',
    features: data.features || [],
    tags: data.tags || [],
    featured: data.featured ?? true,
    ...data,
    id,
    displayOrder: data.displayOrder ?? nextOrder,
  };
  const updated = [...projects, project];
  saveProjects(updated);
  return updated;
}

export function resetProjects(): FeaturedProject[] {
  localStorage.removeItem(STORAGE_KEY);
  return [...defaultProjects];
}
