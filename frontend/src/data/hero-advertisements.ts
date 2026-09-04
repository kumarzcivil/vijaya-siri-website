import { proFixHeroPosters } from './profix-hero-posters';

const STORAGE_KEY = 'vs_profix_hero_ads';
export const SEED_ID_PREFIX = 'pfad_seed_';

export interface HeroAdvertisement {
  id: string;
  placement: 'pro-fix-hero';
  type: 'advertisement';
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  ctaLabel: string;
  ctaTarget: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export function isSeededHeroAd(id: string): boolean {
  return id.startsWith(SEED_ID_PREFIX);
}

function buildSeededAds(): HeroAdvertisement[] {
  const now = new Date().toISOString();
  return proFixHeroPosters.map((poster) => ({
    id: `${SEED_ID_PREFIX}${String(poster.displayOrder).padStart(2, '0')}`,
    placement: 'pro-fix-hero',
    type: 'advertisement',
    eyebrow: '',
    title: poster.title,
    description: poster.alt,
    image: poster.image,
    mobileImage: poster.image,
    ctaLabel: '',
    ctaTarget: poster.destination || '',
    status: poster.active ? 'active' : 'inactive',
    startDate: '2000-01-01',
    endDate: '2999-12-31',
    priority: poster.displayOrder,
    createdAt: now,
    updatedAt: now,
  }));
}

function loadAds(): HeroAdvertisement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeededAds();
      saveAds(seeded);
      return seeded;
    }
    const ads: HeroAdvertisement[] = JSON.parse(raw);
    if (!ads.some((ad) => isSeededHeroAd(ad.id))) {
      const seeded = buildSeededAds();
      saveAds([...seeded, ...ads]);
      return [...seeded, ...ads];
    }
    return ads;
  } catch {
    return buildSeededAds();
  }
}

function saveAds(ads: HeroAdvertisement[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

function normalizePriority(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

function sortAds(ads: HeroAdvertisement[]): HeroAdvertisement[] {
  return ads.slice().sort((a, b) => {
    const diff = normalizePriority(a.priority) - normalizePriority(b.priority);
    if (diff !== 0) return diff;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function getProFixHeroAds(): HeroAdvertisement[] {
  return sortAds(loadAds());
}

export function getActiveProFixHeroAds(): HeroAdvertisement[] {
  const now = new Date().toISOString();
  return sortAds(
    loadAds().filter(
      (ad) =>
        ad.status === 'active' &&
        ad.placement === 'pro-fix-hero' &&
        ad.startDate <= now &&
        ad.endDate >= now
    )
  );
}

export function addProFixHeroAd(ad: Omit<HeroAdvertisement, 'id' | 'createdAt' | 'updatedAt'>): HeroAdvertisement[] {
  const ads = loadAds();
  const now = new Date().toISOString();
  const newAd: HeroAdvertisement = {
    ...ad,
    id: `pfad_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  ads.push(newAd);
  saveAds(ads);
  return ads;
}

export function updateProFixHeroAd(id: string, updates: Partial<HeroAdvertisement>): HeroAdvertisement[] {
  const ads = loadAds();
  const idx = ads.findIndex((a) => a.id === id);
  if (idx < 0) return ads;
  ads[idx] = { ...ads[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAds(ads);
  return ads;
}

export function deleteProFixHeroAd(id: string): HeroAdvertisement[] {
  const ads = loadAds().filter((a) => a.id !== id);
  saveAds(ads);
  return ads;
}

export function resetProFixHeroAds(): HeroAdvertisement[] {
  const seeded = buildSeededAds();
  saveAds(seeded);
  return seeded;
}