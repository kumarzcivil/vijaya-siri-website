/* ========================
   ADVERTISEMENTS
   Generalized placement-aware ad system
   ======================== */

export type AdvertisementPlacement = 'home' | 'pro-fix' | 'quick-fix' | 'projects' | 'offers';

export interface Advertisement {
  id: string;
  placement: AdvertisementPlacement;
  desktopImage: string;
  mobileImage?: string;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vs_advertisements';

function generateId(): string {
  return `ad_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function load(): Advertisement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(advertisements: Advertisement[]): Advertisement[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(advertisements));
  return advertisements;
}

/* ---- Read ---- */

export function getAdvertisements(): Advertisement[] {
  return load().sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getAdvertisementsByPlacement(placement: AdvertisementPlacement): Advertisement[] {
  return getAdvertisements().filter((ad) => ad.placement === placement);
}

export function getActiveAdvertisementsByPlacement(placement: AdvertisementPlacement): Advertisement[] {
  return getAdvertisementsByPlacement(placement).filter((ad) => ad.active);
}

/* ---- Write ---- */

export function addAdvertisement(
  ad: Omit<Advertisement, 'id' | 'createdAt' | 'updatedAt'>
): Advertisement[] {
  const existing = load();
  const now = new Date().toISOString();
  const newAd: Advertisement = {
    ...ad,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  return save([...existing, newAd]);
}

export function updateAdvertisement(
  id: string,
  updates: Partial<Omit<Advertisement, 'id' | 'createdAt'>>
): Advertisement[] {
  const existing = load();
  const now = new Date().toISOString();
  const updated = existing.map((ad) =>
    ad.id === id ? { ...ad, ...updates, updatedAt: now } : ad
  );
  return save(updated);
}

export function deleteAdvertisement(id: string): Advertisement[] {
  const existing = load().filter((ad) => ad.id !== id);
  return save(existing);
}

export function resetAdvertisements(): Advertisement[] {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}
