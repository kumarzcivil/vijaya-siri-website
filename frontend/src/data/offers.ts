/* ========================
   OFFERS
   Dedicated promotional feed for the customer /offers page.

   This is a promotional/CTA-based Offers system (V3.40).
   No pricing fields are stored here — the business pricing model
   has not been finalized.

   Conceptual Admin-managed record shape:
   offer
   ├── id
   ├── title
   ├── description
   ├── image
   ├── mobileImage (optional)
   ├── eyebrow
   ├── ctaLabel
   ├── ctaTarget
   ├── destinationType
   ├── active
   ├── startDate
   ├── endDate
   └── displayOrder

   Rules:
   - destinationType 'none'     → offer is display-only.
   - 'internal'                 → destination is an app path (e.g. /quote).
   - 'external'                 → destination is an absolute URL.
   - getActiveOffers() only returns active offers within their
     startDate/endDate window, sorted by displayOrder.
   ======================== */

export type OfferDestinationType = 'none' | 'internal' | 'external';

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  mobileImage?: string;
  eyebrow: string;
  ctaLabel: string;
  ctaTarget: string;
  destinationType: OfferDestinationType;
  active: boolean;
  startDate: string;
  endDate: string;
  displayOrder: number;
}

const OFFER_STORAGE_KEY = 'vs_offers';

const IMG_BASE = '/assests/Profix%20hero%20images';

export const seedOffers: Offer[] = [
  {
    id: 'off_01',
    title: 'Free Construction Consultation',
    description:
      'Meet our construction team and get expert guidance on planning and building your new home, from site selection to handover.',
    image: `${IMG_BASE}/06_Offer_Exterior_Construction.jpg`,
    mobileImage: `${IMG_BASE}/06_Offer_Exterior_Construction.jpg`,
    eyebrow: 'Consultation',
    ctaLabel: 'Start a Consultation',
    ctaTarget: '/quote',
    destinationType: 'internal',
    active: true,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    displayOrder: 1,
  },
  {
    id: 'off_02',
    title: 'Renovation Planning',
    description:
      'Transform your existing space with a guided renovation plan covering structure, finishes and budget before you begin.',
    image: `${IMG_BASE}/02_Offer_Bathroom_Renovation.jpg`,
    mobileImage: `${IMG_BASE}/02_Offer_Bathroom_Renovation.jpg`,
    eyebrow: 'Renovation',
    ctaLabel: 'Plan a Renovation',
    ctaTarget: '/quote',
    destinationType: 'internal',
    active: true,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    displayOrder: 2,
  },
  {
    id: 'off_03',
    title: 'Interior Planning',
    description:
      'Work with our team to design functional, beautiful interiors — kitchens, modular spaces and finishes that fit your home.',
    image: `${IMG_BASE}/05_Offer_Modular_Kitchen.jpg`,
    mobileImage: `${IMG_BASE}/05_Offer_Modular_Kitchen.jpg`,
    eyebrow: 'Interiors',
    ctaLabel: 'Start Interior Planning',
    ctaTarget: '/quote',
    destinationType: 'internal',
    active: true,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    displayOrder: 3,
  },
  {
    id: 'off_04',
    title: 'Seasonal Project Consultation',
    description:
      'Plan your construction projects around the right season with a focused consultation on scheduling, materials and phasing.',
    image: `${IMG_BASE}/03_Offer_House_Painting.jpg`,
    mobileImage: `${IMG_BASE}/03_Offer_House_Painting.jpg`,
    eyebrow: 'Seasonal',
    ctaLabel: 'Talk to an Expert',
    ctaTarget: '/quote',
    destinationType: 'internal',
    active: true,
    startDate: '2025-01-01',
    endDate: '2030-12-31',
    displayOrder: 4,
  },
];

function applyOfferOverlay(offers: Offer[]): Offer[] {
  try {
    const raw = localStorage.getItem(OFFER_STORAGE_KEY);
    if (!raw) return offers.map((o) => ({ ...o }));
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return offers.map((o) => ({ ...o }));
    const byId = new Map(offers.map((o) => [o.id, { ...o }]));
    stored.forEach((entry: Partial<Offer>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as Offer), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return offers.map((o) => ({ ...o }));
  }
}

function generateId(): string {
  return `off_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getOffers(): Offer[] {
  return applyOfferOverlay(seedOffers).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function saveOffers(offers: Offer[]): void {
  try {
    localStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify(offers));
  } catch {
    // storage unavailable — keep in-memory value
  }
}

export function updateOffer(id: string, updates: Partial<Offer>): Offer[] {
  const offers = getOffers();
  const updated = offers.map((o) => (o.id === id ? { ...o, ...updates, id: o.id } : o));
  saveOffers(updated);
  return updated.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function addOffer(
  input: Omit<Offer, 'id' | 'displayOrder'> & { displayOrder?: number }
): Offer[] {
  const offers = getOffers();
  const maxOrder = offers.reduce((max, o) => Math.max(max, o.displayOrder), 0);
  const offer: Offer = {
    ...input,
    id: generateId(),
    displayOrder: input.displayOrder ?? maxOrder + 1,
  };
  offers.push(offer);
  saveOffers(offers);
  return offers.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function deleteOffer(id: string): Offer[] {
  const offers = getOffers().filter((o) => o.id !== id);
  saveOffers(offers);
  return offers;
}

export function resetOffers(): Offer[] {
  try {
    localStorage.removeItem(OFFER_STORAGE_KEY);
  } catch {
    // ignore
  }
  return seedOffers.map((o) => ({ ...o }));
}

export function moveOffer(id: string, direction: 'up' | 'down'): Offer[] {
  const offers = getOffers();
  const sorted = [...offers].sort((a, b) => a.displayOrder - b.displayOrder);
  const index = sorted.findIndex((o) => o.id === id);
  if (index < 0) return offers;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return offers;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((o, i) => ({ ...o, displayOrder: i + 1 }));
  saveOffers(reordered);
  return reordered;
}

export function reorderOffers(orderedIds: string[]): Offer[] {
  const offers = getOffers();
  const byId = new Map(offers.map((o) => [o.id, o]));
  const placed = new Set<string>();
  const reordered: Offer[] = [];
  for (const id of orderedIds) {
    const offer = byId.get(id);
    if (offer && !placed.has(id)) {
      reordered.push({ ...offer });
      placed.add(id);
    }
  }
  for (const offer of offers) {
    if (!placed.has(offer.id)) reordered.push({ ...offer });
  }
  const finalized = reordered.map((o, i) => ({ ...o, displayOrder: i + 1 }));
  saveOffers(finalized);
  return finalized.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getActiveOffers(): Offer[] {
  const today = new Date().toISOString().slice(0, 10);
  return getOffers().filter(
    (offer) =>
      offer.active &&
      (!offer.startDate || offer.startDate.slice(0, 10) <= today) &&
      (!offer.endDate || offer.endDate.slice(0, 10) >= today)
  );
}
