/* ========================
   QUICK FIX DATA
   Fast problem-solving services feed.
   Separate entity from Quick Fix Banners.

   Customer-side data contracts are kept clean for a
   future Admin-managed Quick Fix feed:
   ADMIN → QUICK FIX CATEGORIES / SERVICES → CUSTOMER QUICK FIX
   ======================== */

export interface QuickFixCategory {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  displayOrder: number;
}

export interface QuickFixPricing {
  enabled: boolean;
  price?: number;
  priceNote?: string;
}

export interface QuickFixDuration {
  value: number;
  unit: string;
}

export interface QuickFixBookingConfiguration {
  requiresTimeSlot: boolean;
  requiresPayment: boolean;
}

export interface QuickFixService {
  id: string;
  categoryId: string;
  name: string;
  image?: string;
  shortDescription: string;
  description: string;
  includedItems?: string[];
  notes?: string[];
  pricing: QuickFixPricing;
  duration?: QuickFixDuration;
  active: boolean;
  featured: boolean;
  displayOrder: number;
  bookingConfiguration: QuickFixBookingConfiguration;
}

export const quickFixCategories: QuickFixCategory[] = [
  { id: 'electrical', name: 'Electrical', icon: 'star', active: true, displayOrder: 1 },
  { id: 'plumbing', name: 'Plumbing', icon: 'clipboard', active: true, displayOrder: 2 },
  { id: 'carpentry', name: 'Carpentry', icon: 'wrench', active: true, displayOrder: 3 },
  { id: 'appliances', name: 'Appliances', icon: 'armchair', active: true, displayOrder: 4 },
  { id: 'cleaning', name: 'Cleaning', icon: 'leaf', active: true, displayOrder: 5 },
  { id: 'pest-control', name: 'Pest Control', icon: 'shield-check', active: true, displayOrder: 6 },
  { id: 'painting', name: 'Painting', icon: 'diamond', active: true, displayOrder: 7 },
];

const IMG_BASE = '/assests/Profix%20hero%20images';

export const quickFixServices: QuickFixService[] = [
  {
    id: 'plumbing-repair',
    categoryId: 'plumbing',
    name: 'Plumbing Repair',
    image: `${IMG_BASE}/09_Offer_Plumbing_Work.jpg`,
    shortDescription: 'Leaky taps, pipes and flush tanks fixed fast.',
    description:
      'Quick diagnosis and repair of common plumbing problems — leaking taps, running flush tanks, clogged drains and minor pipe leaks. Verified plumber, standard spares included.',
    includedItems: [
      'Leak & blockage diagnosis',
      'Tap, pipe & flush tank repair',
      'Standard consumable spares',
      'Work-area cleanup',
    ],
    notes: ['Major part replacement is quoted separately before work begins.'],
    pricing: {
      enabled: true,
      price: 199,
      priceNote: 'Visit charge included · Spares at actuals for major parts',
    },
    duration: { value: 60, unit: 'mins' },
    active: true,
    featured: true,
    displayOrder: 1,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'electrical-repair',
    categoryId: 'electrical',
    name: 'Electrical Repair',
    image: `${IMG_BASE}/08_Offer_Electrical_Work.jpg`,
    shortDescription: 'Switches, sockets, fans and wiring fixed safely.',
    description:
      'Safe repair of switches, sockets, fan regulators, tube lights and minor wiring faults by a verified electrician. Basic electrical consumables included.',
    includedItems: [
      'Fault diagnosis & safety check',
      'Switch, socket & regulator repair',
      'Fan & light fitting fixes',
      'Minor wiring correction',
    ],
    notes: ['Major rewiring is quoted separately after inspection.'],
    pricing: {
      enabled: true,
      price: 149,
      priceNote: 'Visit charge included · Parts at actuals',
    },
    duration: { value: 60, unit: 'mins' },
    active: true,
    featured: true,
    displayOrder: 2,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'ac-service',
    categoryId: 'appliances',
    name: 'AC Service & Repair',
    shortDescription: 'Split & window AC cleaning, gas check and cooling fix.',
    description:
      'Complete servicing for split and window ACs — filter and coil cleaning, drainage check, cooling inspection and minor repairs for smooth performance.',
    includedItems: [
      'Filter & coil deep cleaning',
      'Drainage line check',
      'Cooling performance check',
      'Minor repair & troubleshooting',
    ],
    notes: ['Gas refilling is quoted separately after inspection.'],
    pricing: {
      enabled: true,
      price: 499,
      priceNote: 'Per AC · Gas refilling quoted separately',
    },
    duration: { value: 90, unit: 'mins' },
    active: true,
    featured: true,
    displayOrder: 3,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'ro-service',
    categoryId: 'appliances',
    name: 'RO Purifier Service',
    shortDescription: 'Filter check, membrane cleaning and sanitization.',
    description:
      'Routine service for RO water purifiers — filter condition check, membrane cleaning, tank sanitization and TDS verification for safe drinking water.',
    includedItems: [
      'Filter condition check',
      'Membrane cleaning',
      'Tank sanitization',
      'TDS level verification',
    ],
    pricing: {
      enabled: true,
      price: 399,
      priceNote: 'Per purifier · Filter replacement at actuals',
    },
    duration: { value: 60, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 4,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'carpentry-repair',
    categoryId: 'carpentry',
    name: 'Carpentry Repair',
    shortDescription: 'Doors, hinges, locks and furniture repaired on the spot.',
    description:
      'On-the-spot carpentry fixes — door alignment, hinge and lock replacement, drawer and cabinet repairs, and minor furniture fixes by a skilled carpenter.',
    includedItems: [
      'Door & lock adjustment',
      'Hinge replacement',
      'Drawer & cabinet repair',
      'Minor furniture fixes',
    ],
    pricing: {
      enabled: true,
      price: 249,
      priceNote: 'Visit charge included · Hardware at actuals',
    },
    duration: { value: 90, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 5,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'painting-touchup',
    categoryId: 'painting',
    name: 'Painting Touch-up',
    image: `${IMG_BASE}/10_Painting%20Work.jpg`,
    shortDescription: 'Wall patches, scuffs and touch-ups blended to match.',
    description:
      'Fast wall touch-up service — crack and hole patching, seepage stain covering and paint touch-ups matched to your existing wall shade.',
    includedItems: [
      'Crack & hole patching',
      'Stain covering',
      'Shade-matched touch-up',
      'Area masking & cleanup',
    ],
    pricing: {
      enabled: true,
      price: 299,
      priceNote: 'Up to 50 Sq.ft touch-up area',
    },
    duration: { value: 120, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 6,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'deep-cleaning',
    categoryId: 'cleaning',
    name: 'Home Deep Cleaning',
    shortDescription: 'Kitchen, bathroom and full-home deep cleaning.',
    description:
      'Intensive cleaning for kitchens, bathrooms and living areas using professional tools and eco-friendly chemicals. Trained cleaning crew, equipment included.',
    includedItems: [
      'Kitchen degreasing',
      'Bathroom descaling',
      'Floor & surface scrubbing',
      'Eco-friendly chemicals',
    ],
    pricing: {
      enabled: true,
      price: 999,
      priceNote: '1 BHK · Larger homes quoted on confirmation',
    },
    duration: { value: 180, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 7,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'pest-control',
    categoryId: 'pest-control',
    name: 'Pest Control Treatment',
    shortDescription: 'Cockroach, ant and general pest treatment.',
    description:
      'Safe, odorless pest control treatment for cockroaches, ants and common household pests. Child- and pet-safe chemicals applied by trained technicians.',
    includedItems: [
      'Cockroach & ant treatment',
      'Kitchen-safe gel application',
      'Odorless chemicals',
      'Post-treatment guidance',
    ],
    pricing: {
      enabled: true,
      price: 799,
      priceNote: 'Up to 2 BHK · Warranty details shared on visit',
    },
    active: true,
    featured: false,
    displayOrder: 8,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: true },
  },
  {
    id: 'tv-mounting',
    categoryId: 'appliances',
    name: 'TV Mounting & Installation',
    shortDescription: 'Wall mounting, bracket fixing and cable management.',
    description:
      'Secure TV wall mounting with bracket installation, levelling and neat cable management for screens up to 65 inches.',
    includedItems: [
      'Bracket installation',
      'Secure wall mounting',
      'Levelling & stability check',
      'Cable management',
    ],
    notes: ['Wall mount bracket not included unless specified while booking.'],
    pricing: {
      enabled: true,
      price: 199,
      priceNote: 'Screens up to 65 inches · Bracket at actuals',
    },
    duration: { value: 45, unit: 'mins' },
    active: true,
    featured: false,
    displayOrder: 9,
    bookingConfiguration: { requiresTimeSlot: true, requiresPayment: false },
  },
];

const SERVICESTORAGE_KEY = 'vs_quickfix_services';

function applyQuickFixServiceOverlay(services: QuickFixService[]): QuickFixService[] {
  try {
    const raw = localStorage.getItem(SERVICESTORAGE_KEY);
    if (!raw) return services;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return services;
    const byId = new Map(services.map((s) => [s.id, { ...s }]));
    stored.forEach((entry: Partial<QuickFixService>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as QuickFixService), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return services;
  }
}

export function getQuickFixServices(): QuickFixService[] {
  return applyQuickFixServiceOverlay(quickFixServices);
}

export function saveQuickFixServices(services: QuickFixService[]): void {
  localStorage.setItem(SERVICESTORAGE_KEY, JSON.stringify(services));
}

export function updateQuickFixService(id: string, updates: Partial<QuickFixService>): QuickFixService[] {
  const services = getQuickFixServices();
  const updated = services.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveQuickFixServices(updated);
  return updated;
}

export function addQuickFixService(
  input: Omit<QuickFixService, 'id' | 'displayOrder'> & { displayOrder?: number }
): QuickFixService[] {
  const services = getQuickFixServices();
  const maxOrder = services.reduce((max, s) => Math.max(max, s.displayOrder), 0);
  const service: QuickFixService = {
    ...input,
    id: `qfs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    displayOrder: input.displayOrder || maxOrder + 1,
  };
  services.push(service);
  saveQuickFixServices(services);
  return services;
}

export function resetQuickFixServices(): QuickFixService[] {
  localStorage.removeItem(SERVICESTORAGE_KEY);
  return quickFixServices.map((s) => ({ ...s }));
}

export function moveQuickFixService(id: string, direction: 'up' | 'down'): QuickFixService[] {
  const services = getQuickFixServices();
  const sorted = [...services].sort((a, b) => a.displayOrder - b.displayOrder);
  const index = sorted.findIndex((s) => s.id === id);
  if (index < 0) return services;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return services;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((s, i) => ({ ...s, displayOrder: i + 1 }));
  saveQuickFixServices(reordered);
  return reordered;
}

export function reorderQuickFixServices(orderedIds: string[]): QuickFixService[] {
  const services = getQuickFixServices();
  const byId = new Map(services.map((s) => [s.id, s]));
  const placed = new Set<string>();
  const reordered: QuickFixService[] = [];
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
  saveQuickFixServices(finalized);
  return finalized;
}

export function getQuickFixService(id: string | undefined): QuickFixService | undefined {
  if (!id) return undefined;
  return getQuickFixServices().find((s) => s.id === id && s.active);
}

export function getQuickFixActiveServices(): QuickFixService[] {
  return getQuickFixServices()
    .filter((s) => s.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

const CATEGORY_STORAGE_KEY = 'vs_quickfix_categories';

function applyQuickFixCategoryOverlay(categories: QuickFixCategory[]): QuickFixCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) return categories;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return categories;
    const byId = new Map(categories.map((c) => [c.id, { ...c }]));
    stored.forEach((entry: Partial<QuickFixCategory>) => {
      const id = entry.id;
      if (!id) return;
      byId.set(id, { ...(byId.get(id) as QuickFixCategory), ...entry, id });
    });
    return Array.from(byId.values());
  } catch {
    return categories;
  }
}

export function getQuickFixCategories(): QuickFixCategory[] {
  return applyQuickFixCategoryOverlay(quickFixCategories);
}

export function saveQuickFixCategories(categories: QuickFixCategory[]): void {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

export function updateQuickFixCategory(id: string, updates: Partial<QuickFixCategory>): QuickFixCategory[] {
  const categories = getQuickFixCategories();
  const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveQuickFixCategories(updated);
  return updated;
}

export function addQuickFixCategory(
  input: Omit<QuickFixCategory, 'id' | 'displayOrder'> & { displayOrder?: number }
): QuickFixCategory[] {
  const categories = getQuickFixCategories();
  const maxOrder = categories.reduce((max, c) => Math.max(max, c.displayOrder), 0);
  const category: QuickFixCategory = {
    ...input,
    id: `qfcat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    displayOrder: input.displayOrder || maxOrder + 1,
  };
  categories.push(category);
  saveQuickFixCategories(categories);
  return categories;
}

export function resetQuickFixCategories(): QuickFixCategory[] {
  localStorage.removeItem(CATEGORY_STORAGE_KEY);
  return quickFixCategories.map((c) => ({ ...c }));
}

export function moveQuickFixCategory(id: string, direction: 'up' | 'down'): QuickFixCategory[] {
  const categories = getQuickFixCategories();
  const sorted = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  const index = sorted.findIndex((c) => c.id === id);
  if (index < 0) return categories;
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sorted.length) return categories;
  const current = sorted[index];
  sorted[index] = sorted[swapIndex];
  sorted[swapIndex] = current;
  const reordered = sorted.map((c, i) => ({ ...c, displayOrder: i + 1 }));
  saveQuickFixCategories(reordered);
  return reordered;
}

export function reorderQuickFixCategories(orderedIds: string[]): QuickFixCategory[] {
  const categories = getQuickFixCategories();
  const byId = new Map(categories.map((c) => [c.id, c]));
  const placed = new Set<string>();
  const reordered: QuickFixCategory[] = [];
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
  saveQuickFixCategories(finalized);
  return finalized;
}

export function getActiveQuickFixCategories(): QuickFixCategory[] {
  return getQuickFixCategories()
    .filter((c) => c.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getQuickFixCategory(categoryId: string): QuickFixCategory | undefined {
  return getQuickFixCategories().find((c) => c.id === categoryId && c.active);
}

export function getQuickFixCategoryName(categoryId: string): string {
  return getQuickFixCategories().find((c) => c.id === categoryId)?.name ?? categoryId;
}

export function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatQuickFixDuration(duration: QuickFixDuration | undefined): string | null {
  if (!duration) return null;
  return `~${duration.value} ${duration.unit}`;
}
