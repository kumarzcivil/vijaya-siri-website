/* ========================
   QUICK FIX ADVERTISEMENT BANNERS
   Dedicated promotional feed — separate from Quick Fix Services.

   Conceptual Admin-managed record shape:
   banner
   ├── id
   ├── image
   ├── internalName
   ├── active
   ├── displayOrder
   ├── startDate
   ├── endDate
   ├── ctaLabel
   ├── destinationType
   └── destination

   Rules:
   - destinationType 'none' → banner is display-only.
   - 'service'  → destination is a Quick Fix service id.
   - 'category' → destination is a Quick Fix category id.
   - 'external' → destination is an absolute URL.
   - Banners reference services/categories by id.
     Service information is never duplicated here.
   ======================== */

export type QuickFixBannerDestinationType = 'none' | 'service' | 'category' | 'external';

export interface QuickFixBanner {
  id: string;
  image: string;
  internalName: string;
  active: boolean;
  displayOrder: number;
  startDate: string;
  endDate: string;
  ctaLabel: string;
  destinationType: QuickFixBannerDestinationType;
  destination: string;
}

const IMG_BASE = '/assests/Profix%20hero%20images';

export const quickFixBanners: QuickFixBanner[] = [
  {
    id: 'qfb_01',
    image: `${IMG_BASE}/08_Offer_Electrical_Work.jpg`,
    internalName: 'QF Electrical Repairs Promo',
    active: true,
    displayOrder: 1,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    ctaLabel: 'Explore Electrical Repairs',
    destinationType: 'category',
    destination: 'electrical',
  },
  {
    id: 'qfb_02',
    image: `${IMG_BASE}/09_Offer_Plumbing_Work.jpg`,
    internalName: 'QF Plumbing Repair Promo',
    active: true,
    displayOrder: 2,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    ctaLabel: 'Book Plumbing Repair',
    destinationType: 'service',
    destination: 'plumbing-repair',
  },
  {
    id: 'qfb_03',
    image: `${IMG_BASE}/11.%20Renovation%20Work.jpg`,
    internalName: 'QF Home Repairs Brand Banner',
    active: true,
    displayOrder: 3,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    ctaLabel: '',
    destinationType: 'none',
    destination: '',
  },
];

const BANNER_STORAGE_KEY = 'vs_quickfix_banners';

function applyQuickFixBannerOverlay(banners: QuickFixBanner[]): QuickFixBanner[] {
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY);
    if (!raw) return banners;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return banners;
    const byId = new Map(banners.map((b) => [b.id, { ...b }]));
    stored.forEach((entry: Partial<QuickFixBanner>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as QuickFixBanner), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return banners;
  }
}

export function getQuickFixBanners(): QuickFixBanner[] {
  return applyQuickFixBannerOverlay(quickFixBanners);
}

export function saveQuickFixBanners(banners: QuickFixBanner[]): void {
  localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banners));
}

export function updateQuickFixBanner(id: string, updates: Partial<QuickFixBanner>): QuickFixBanner[] {
  const banners = getQuickFixBanners();
  const updated = banners.map((b) => (b.id === id ? { ...b, ...updates } : b));
  saveQuickFixBanners(updated);
  return updated;
}

export function addQuickFixBanner(
  input: Omit<QuickFixBanner, 'id' | 'displayOrder'> & { displayOrder?: number }
): QuickFixBanner[] {
  const banners = getQuickFixBanners();
  const maxOrder = banners.reduce((max, b) => Math.max(max, b.displayOrder), 0);
  const banner: QuickFixBanner = {
    ...input,
    id: `qfb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    displayOrder: input.displayOrder || maxOrder + 1,
  };
  banners.push(banner);
  saveQuickFixBanners(banners);
  return banners;
}

export function deleteQuickFixBanner(id: string): QuickFixBanner[] {
  const banners = getQuickFixBanners().filter((b) => b.id !== id);
  saveQuickFixBanners(banners);
  return banners;
}

export function resetQuickFixBanners(): QuickFixBanner[] {
  localStorage.removeItem(BANNER_STORAGE_KEY);
  return quickFixBanners.map((b) => ({ ...b }));
}

export function moveQuickFixBanner(id: string, direction: 'up' | 'down'): QuickFixBanner[] {
  const banners = getQuickFixBanners();
  const sorted = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
  const index = sorted.findIndex((b) => b.id === id);
  if (index < 0) return banners;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return banners;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((b, i) => ({ ...b, displayOrder: i + 1 }));
  saveQuickFixBanners(reordered);
  return reordered;
}

export function reorderQuickFixBanners(orderedIds: string[]): QuickFixBanner[] {
  const banners = getQuickFixBanners();
  const byId = new Map(banners.map((b) => [b.id, b]));
  const placed = new Set<string>();
  const reordered: QuickFixBanner[] = [];
  for (const id of orderedIds) {
    const banner = byId.get(id);
    if (banner && !placed.has(id)) {
      reordered.push({ ...banner });
      placed.add(id);
    }
  }
  for (const banner of banners) {
    if (!placed.has(banner.id)) reordered.push({ ...banner });
  }
  const finalized = reordered.map((b, i) => ({ ...b, displayOrder: i + 1 }));
  saveQuickFixBanners(finalized);
  return finalized;
}

export function getActiveQuickFixBanners(): QuickFixBanner[] {
  const today = new Date().toISOString().slice(0, 10);
  return getQuickFixBanners()
    .filter(
      (banner) =>
        banner.active &&
        banner.startDate <= today &&
        banner.endDate >= today
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
