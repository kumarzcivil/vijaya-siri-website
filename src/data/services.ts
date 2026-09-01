export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  path?: string;
  active: boolean;
  displayOrder: number;
}

export const services: Service[] = [
  {
    id: 'construction',
    number: '01',
    title: 'Construction',
    description: 'New residential & commercial builds',
    path: '/projects?category=construction',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'renovation',
    number: '02',
    title: 'Renovation',
    description: 'Transform and upgrade existing spaces',
    path: '/projects?category=renovation',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'interiors',
    number: '03',
    title: 'Interiors',
    description: 'Functional interiors designed around you',
    path: '/projects?category=interiors',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'civil-works',
    number: '04',
    title: 'Civil Works',
    description: 'Structural and outdoor construction',
    path: '/projects?category=civil-works',
    active: true,
    displayOrder: 4,
  },
];

const SERVICE_STORAGE_KEY = 'vs_marketing_discover_services';

function applyServicesOverlay(seed: Service[]): Service[] {
  try {
    const raw = localStorage.getItem(SERVICE_STORAGE_KEY);
    if (!raw) return seed.map((s) => ({ ...s }));
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return seed.map((s) => ({ ...s }));
    const byId = new Map(seed.map((s) => [s.id, { ...s }]));
    stored.forEach((entry: Partial<Service>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as Service), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return seed.map((s) => ({ ...s }));
  }
}

export function getMarketingServices(): Service[] {
  return applyServicesOverlay(services);
}

export function saveMarketingServices(items: Service[]): void {
  localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(items));
}

export function updateMarketingService(id: string, updates: Partial<Service>): Service[] {
  const items = getMarketingServices();
  const updated = items.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveMarketingServices(updated);
  return updated;
}

export function addMarketingService(
  input: Omit<Service, 'id' | 'displayOrder'> & { displayOrder?: number }
): Service[] {
  const items = getMarketingServices();
  const maxOrder = items.reduce((max, s) => Math.max(max, s.displayOrder), 0);
  const service: Service = {
    ...input,
    id: `svc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    displayOrder: input.displayOrder || maxOrder + 1,
  };
  items.push(service);
  saveMarketingServices(items);
  return items;
}

export function deleteMarketingService(id: string): Service[] {
  const items = getMarketingServices().filter((s) => s.id !== id);
  saveMarketingServices(items);
  return items;
}

export function resetMarketingServices(): Service[] {
  localStorage.removeItem(SERVICE_STORAGE_KEY);
  return services.map((s) => ({ ...s }));
}

export function moveMarketingService(id: string, direction: 'up' | 'down'): Service[] {
  const items = getMarketingServices();
  const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
  const index = sorted.findIndex((s) => s.id === id);
  if (index < 0) return items;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return items;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((s, i) => ({ ...s, displayOrder: i + 1 }));
  saveMarketingServices(reordered);
  return reordered;
}

export function reorderMarketingServices(orderedIds: string[]): Service[] {
  const items = getMarketingServices();
  const byId = new Map(items.map((s) => [s.id, s]));
  const placed = new Set<string>();
  const reordered: Service[] = [];
  for (const id of orderedIds) {
    const service = byId.get(id);
    if (service && !placed.has(id)) {
      reordered.push({ ...service });
      placed.add(id);
    }
  }
  for (const service of items) {
    if (!placed.has(service.id)) reordered.push({ ...service });
  }
  const finalized = reordered.map((s, i) => ({ ...s, displayOrder: i + 1 }));
  saveMarketingServices(finalized);
  return finalized;
}

export function getActiveMarketingServices(): Service[] {
  return getMarketingServices()
    .filter((s) => s.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
