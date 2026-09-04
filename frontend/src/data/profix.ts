export type ProFixPricingMode = 'area_rate' | 'quantity_rate' | 'fixed' | 'custom';

export interface ProFixPricing {
  enabled: boolean;
  mode: ProFixPricingMode;
  rate?: number;
  unit?: string;
  quantityLabel?: string;
  defaultQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  step?: number;
}

export interface ProFixCategory {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  displayOrder: number;
}

export interface ProFixService {
  id: string;
  name: string;
  category: string;
  description: string;
  active: boolean;
  displayOrder: number;
  image: string;
  imageUrl?: string;
  unit: string;
  startingPrice: string;
  included?: string[];
  notes?: string[];
  pricing?: ProFixPricing;
  siteVisitCharge?: number;
  siteVisitWaiver?: ProFixSiteVisitWaiver;
}

export interface ProFixSiteVisitWaiver {
  enabled: boolean;
  label: string;
  amount: number;
  trigger: 'work_completion';
}

export type ProFixEstimateStatus = 'draft' | 'reviewed' | 'booked';

export type ProFixPaymentStatus = 'pending' | 'submitted' | 'paid' | 'failed';

export interface ProFixBillingDetails {
  name: string;
  mobile: string;
  siteAddress: string;
  siteLocation: string;
  email: string;
}

export interface ProFixSiteVisitOrder {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  quantity: number;
  unit: string;
  rate: number;
  estimatedWorkCost: number;
  siteVisitCharge: number;
  siteVisitWaiverAmount: number;
  effectiveSiteVisitCost: number;
  payableNow: number;
  billingDetails: ProFixBillingDetails;
  estimateStatus: ProFixEstimateStatus;
  paymentStatus: ProFixPaymentStatus;
  paymentRef: string;
  /** Payment method label stored on the order for display (e.g. MANUAL_UPI). */
  paymentMethod?: string;
  /** Preferred visit date (YYYY-MM-DD). */
  slotDate?: string;
  /** Preferred visit time slot label. */
  slotTime?: string;
  /** Reference to the canonical Payment record (set once a payment exists). */
  paymentId?: string;
  /** Customer-visible booking reference. */
  bookingId?: string;
  /** Reference to the customer identity session. */
  customerId?: string;
  /** Coupon code applied at checkout (if any). */
  couponCode?: string;
  /** Discount (INR) applied from the coupon. */
  couponDiscount?: number;
  createdAt: string;
}

export const proFixCategories: ProFixCategory[] = [
  { id: 'masonry', name: 'Masonry & Civil', icon: 'bricks', active: true, displayOrder: 1 },
  { id: 'flooring', name: 'Flooring', icon: 'diamond', active: true, displayOrder: 2 },
  { id: 'ceiling', name: 'Ceiling & Walls', icon: 'building', active: true, displayOrder: 3 },
  { id: 'painting', name: 'Painting', icon: 'leaf', active: true, displayOrder: 4 },
  { id: 'carpentry', name: 'Carpentry', icon: 'wrench', active: true, displayOrder: 5 },
  { id: 'exterior', name: 'Exterior Work', icon: 'store', active: true, displayOrder: 6 },
  { id: 'electrical', name: 'Electrical', icon: 'star', active: true, displayOrder: 7 },
  { id: 'plumbing', name: 'Plumbing', icon: 'clipboard', active: true, displayOrder: 8 },
  { id: 'others', name: 'Others', icon: 'check-circle', active: true, displayOrder: 9 },
];

const CUSTOM_PRICING: ProFixPricing = { enabled: false, mode: 'custom' };

export const PROFIX_DEFAULT_SITE_VISIT_CHARGE = 300;

export const proFixServices: ProFixService[] = [
  {
    id: 'plastering',
    name: 'Plastering Work',
    category: 'masonry',
    description: 'Smooth and long-lasting wall plastering for interior and exterior surfaces.',
    active: true,
    displayOrder: 1,
    image: 'plastering',
    imageUrl: '/assests/Profix%20hero%20images/01_Service_ProFix.jpg',
    unit: 'Sq.ft',
    startingPrice: '',
    included: [
      'Surface cleaning & preparation',
      'Interior & exterior wall plastering',
      'Skilled mason team',
      'Material handling & wastage control',
      'Post-work site cleanup',
    ],
    notes: ['Final rate may vary with ceiling height and surface condition.'],
    siteVisitCharge: 300,
    siteVisitWaiver: {
      enabled: true,
      label: 'Work Completion Waiver',
      amount: 300,
      trigger: 'work_completion',
    },
    pricing: {
      enabled: true,
      mode: 'area_rate',
      rate: 45,
      unit: 'Sq.ft',
      quantityLabel: 'Area',
      defaultQuantity: 120,
      minQuantity: 1,
      maxQuantity: 100000,
      step: 10,
    },
  },
  {
    id: 'tile-flooring',
    name: 'Tile Flooring',
    category: 'flooring',
    description: 'Professional tile installation with precision alignment and finishing.',
    active: true,
    displayOrder: 2,
    image: 'flooring',
    imageUrl: '/assests/Profix%20hero%20images/04_Offer_Flooring_Tile_Work.jpg',
    unit: 'Sq.ft',
    startingPrice: '',
    included: [
      'Tile layout & alignment',
      'Adhesive & grouting',
      'Level checking across the floor',
      'Edge & corner finishing',
      'Debris removal',
    ],
    pricing: CUSTOM_PRICING,
  },
  {
    id: 'gypsum-ceiling',
    name: 'Gypsum False Ceiling',
    category: 'ceiling',
    description: 'Modern false ceiling designs with clean finishes and durable framing.',
    active: true,
    displayOrder: 3,
    image: 'ceiling',
    imageUrl: '/assests/Profix%20hero%20images/07_Offer_False_Ceiling.jpg',
    unit: 'Sq.ft',
    startingPrice: '',
    included: [
      'Design consultation',
      'GI framing & gypsum boards',
      'Cove & light provision',
      'Finishing & sanding',
      'Site cleanup',
    ],
    pricing: CUSTOM_PRICING,
  },
  {
    id: 'house-painting',
    name: 'Full House Painting',
    category: 'painting',
    description: 'Complete interior and exterior painting with premium finish options.',
    active: true,
    displayOrder: 4,
    image: 'painting',
    imageUrl: '/assests/Profix%20hero%20images/03_Offer_House_Painting.jpg',
    unit: 'Sq.ft',
    startingPrice: '',
    included: [
      'Surface preparation & putty',
      'Primer application',
      'Two coats of premium paint',
      'Furniture & floor masking',
      'Final inspection',
    ],
    pricing: CUSTOM_PRICING,
  },
  {
    id: 'rmc-concrete',
    name: 'RMC Concrete',
    category: 'masonry',
    description: 'Ready-mix concrete supply and pouring for foundations and structures.',
    active: true,
    displayOrder: 5,
    image: 'concrete',
    imageUrl: '/assests/Profix%20hero%20images/06_Offer_Exterior_Construction.jpg',
    unit: 'Cu.m',
    startingPrice: '',
    included: [
      'RMC supply as per mix design',
      'Pumping & pouring',
      'Vibration & leveling',
      'Curing guidance',
      'Basic site cleanup',
    ],
    pricing: CUSTOM_PRICING,
  },
  {
    id: 'concrete-blocks',
    name: 'Concrete Blocks',
    category: 'masonry',
    description: 'Quality concrete block supply and laying for walls and boundaries.',
    active: true,
    displayOrder: 6,
    image: 'blocks',
    imageUrl: '/assests/Profix%20hero%20images/06_Offer_Exterior_Construction.jpg',
    unit: 'Sq.ft',
    startingPrice: '',
    included: [
      'Block supply & stacking',
      'Mortar preparation',
      'Wall laying & alignment',
      'Curing',
      'Site cleanup',
    ],
    pricing: CUSTOM_PRICING,
  },
  {
    id: 'bathroom-reno',
    name: 'Bathroom Renovation',
    category: 'plumbing',
    description: 'Complete bathroom remodel including tiles, fixtures, and plumbing.',
    active: true,
    displayOrder: 7,
    image: 'bathroom',
    imageUrl: '/assests/Profix%20hero%20images/02_Offer_Bathroom_Renovation.jpg',
    unit: 'Unit',
    startingPrice: '',
    included: [
      'Site inspection & measurement',
      'Tile work & waterproofing',
      'Plumbing & fixture installation',
      'Electrical fitting coordination',
      'Final finishing',
    ],
    pricing: CUSTOM_PRICING,
  },
  {
    id: 'modular-kitchen',
    name: 'Modular Kitchen',
    category: 'carpentry',
    description: 'Custom modular kitchen design, fabrication, and installation.',
    active: true,
    displayOrder: 8,
    image: 'kitchen',
    imageUrl: '/assests/Profix%20hero%20images/05_Offer_Modular_Kitchen.jpg',
    unit: 'Unit',
    startingPrice: '',
    included: [
      'Design & 3D layout',
      'Factory-finished carcass',
      'Countertop & shutter installation',
      'Hardware fittings',
      'Post-installation cleanup',
    ],
    pricing: CUSTOM_PRICING,
  },
];

const STORAGE_KEY = 'vs_profix_services';

function applyProFixOverlay(services: ProFixService[]): ProFixService[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return services;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return services;
    const byId = new Map(services.map((s) => [s.id, { ...s }]));
    stored.forEach((entry: Partial<ProFixService>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as ProFixService), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return services;
  }
}

export function getProFixServices(): ProFixService[] {
  return applyProFixOverlay(proFixServices);
}

export function saveProFixServices(services: ProFixService[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

export function updateProFixService(id: string, updates: Partial<ProFixService>): ProFixService[] {
  const services = getProFixServices();
  const updated = services.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveProFixServices(updated);
  return updated;
}

export function addProFixService(
  input: Omit<ProFixService, 'id' | 'displayOrder'> & { displayOrder?: number }
): ProFixService[] {
  const services = getProFixServices();
  const maxOrder = services.reduce((max, s) => Math.max(max, s.displayOrder), 0);
  const service: ProFixService = {
    ...input,
    id: `pf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    displayOrder: input.displayOrder || maxOrder + 1,
  };
  services.push(service);
  saveProFixServices(services);
  return services;
}

export function resetProFixServices(): ProFixService[] {
  localStorage.removeItem(STORAGE_KEY);
  return proFixServices.map((s) => ({ ...s }));
}

export function moveProFixService(id: string, direction: 'up' | 'down'): ProFixService[] {
  const services = getProFixServices();
  const sorted = [...services].sort((a, b) => a.displayOrder - b.displayOrder);
  const index = sorted.findIndex((s) => s.id === id);
  if (index < 0) return services;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return services;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((s, i) => ({ ...s, displayOrder: i + 1 }));
  saveProFixServices(reordered);
  return reordered;
}

export function reorderProFixServices(orderedIds: string[]): ProFixService[] {
  const services = getProFixServices();
  const byId = new Map(services.map((s) => [s.id, s]));
  const placed = new Set<string>();
  const reordered: ProFixService[] = [];
  for (const id of orderedIds) {
    const service = byId.get(id);
    if (service && !placed.has(id)) {
      reordered.push({ ...service });
      placed.add(id);
    }
  }
  for (const service of services) {
    if (!placed.has(service.id)) reordered.push({ ...service });
  }
  const finalized = reordered.map((s, i) => ({ ...s, displayOrder: i + 1 }));
  saveProFixServices(finalized);
  return finalized;
}

export function getActiveProFixServices(): ProFixService[] {
  return getProFixServices()
    .filter((s) => s.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getProFixService(id: string | undefined): ProFixService | undefined {
  if (!id) return undefined;
  return getProFixServices().find((s) => s.id === id);
}

const CATEGORY_STORAGE_KEY = 'vs_profix_categories';

function applyProFixCategoryOverlay(categories: ProFixCategory[]): ProFixCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return categories;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return categories;
    const byId = new Map(categories.map((c) => [c.id, { ...c }]));
    stored.forEach((entry: Partial<ProFixCategory>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as ProFixCategory), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return categories;
  }
}

export function getProFixCategories(): ProFixCategory[] {
  return applyProFixCategoryOverlay(proFixCategories);
}

export function saveProFixCategories(categories: ProFixCategory[]): void {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

export function updateProFixCategory(id: string, updates: Partial<ProFixCategory>): ProFixCategory[] {
  const categories = getProFixCategories();
  const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveProFixCategories(updated);
  return updated;
}

export function addProFixCategory(
  input: Omit<ProFixCategory, 'id' | 'displayOrder'> & { displayOrder?: number }
): ProFixCategory[] {
  const categories = getProFixCategories();
  const maxOrder = categories.reduce((max, c) => Math.max(max, c.displayOrder), 0);
  const category: ProFixCategory = {
    ...input,
    id: `pfcat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    displayOrder: input.displayOrder || maxOrder + 1,
  };
  categories.push(category);
  saveProFixCategories(categories);
  return categories;
}

export function resetProFixCategories(): ProFixCategory[] {
  localStorage.removeItem(CATEGORY_STORAGE_KEY);
  return proFixCategories.map((c) => ({ ...c }));
}

export function moveProFixCategory(id: string, direction: 'up' | 'down'): ProFixCategory[] {
  const categories = getProFixCategories();
  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  const index = sorted.findIndex((c) => c.id === id);
  if (index < 0) return categories;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return categories;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((c, i) => ({ ...c, displayOrder: i + 1 }));
  saveProFixCategories(reordered);
  return reordered;
}

export function reorderProFixCategories(orderedIds: string[]): ProFixCategory[] {
  const categories = getProFixCategories();
  const byId = new Map(categories.map((c) => [c.id, c]));
  const placed = new Set<string>();
  const reordered: ProFixCategory[] = [];
  for (const id of orderedIds) {
    const category = byId.get(id);
    if (category && !placed.has(id)) {
      reordered.push({ ...category });
      placed.add(id);
    }
  }
  for (const category of categories) {
    if (!placed.has(category.id)) reordered.push({ ...category });
  }
  const finalized = reordered.map((c, i) => ({ ...c, displayOrder: i + 1 }));
  saveProFixCategories(finalized);
  return finalized;
}

export function getActiveProFixCategories(): ProFixCategory[] {
  return getProFixCategories()
    .filter((c) => c.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getProFixCategoryName(categoryId: string): string {
  return getProFixCategories().find((c) => c.id === categoryId)?.name ?? categoryId;
}

export function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calculateProFixWorkCost(
  pricing: ProFixPricing,
  quantity: number
): number | null {
  if (!pricing.enabled || pricing.mode === 'custom') return null;
  if (pricing.mode === 'fixed') return pricing.rate ?? 0;
  return Math.round(quantity * (pricing.rate ?? 0));
}

export function getProFixSiteVisitCharge(service: ProFixService): number {
  return service.siteVisitCharge ?? PROFIX_DEFAULT_SITE_VISIT_CHARGE;
}

export function getProFixSiteVisitWaiver(service: ProFixService): ProFixSiteVisitWaiver {
  return (
    service.siteVisitWaiver ?? {
      enabled: true,
      label: 'Work Completion Waiver',
      amount: getProFixSiteVisitCharge(service),
      trigger: 'work_completion',
    }
  );
}

export const proFixProcess = [
  {
    step: '01',
    title: 'Choose Service',
    description: 'Select the service you need.',
  },
  {
    step: '02',
    title: 'Share Details',
    description: 'Tell us about your requirements.',
  },
  {
    step: '03',
    title: 'Get Instant Quote',
    description: 'Receive the best price.',
  },
  {
    step: '04',
    title: 'Schedule Work',
    description: 'Pick a convenient date & time.',
  },
  {
    step: '05',
    title: 'We Do The Work',
    description: 'Sit back, relax \u2014 we fix it.',
  },
];

export const proFixBenefits = [
  { id: 'verified', title: 'Verified Professionals', description: 'Skilled and background-checked experts.' },
  { id: 'materials', title: 'Quality Materials', description: 'Only premium-grade materials used.' },
  { id: 'pricing', title: 'Transparent Pricing', description: 'No hidden costs, clear quotes upfront.' },
  { id: 'ontime', title: 'On-time Delivery', description: 'Projects completed on schedule.' },
  { id: 'satisfaction', title: 'Satisfaction Guaranteed', description: 'Your satisfaction is our priority.' },
];
