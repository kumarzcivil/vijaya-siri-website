export type SpecValue = {
  type: 'text' | 'included' | 'excluded';
  text?: string;
};

export interface SpecRow {
  id: string;
  label: string;
  reference?: string;
  values: Record<string, SpecValue>;
}

export interface SpecCategory {
  id: string;
  title: string;
  subtitle?: string;
  rows: SpecRow[];
}

export interface Package {
  id: string;
  name: string;
  comparisonName: string;
  description: string;
  price: number | null;
  pricePrefix: string;
  priceUnit: string;
  features: string[];
  popular?: boolean;
  custom?: boolean;
  icon: string;
  active?: boolean;
  displayOrder: number;
}

export interface PackageSpecMatrix {
  packages: Package[];
  categories: SpecCategory[];
}

function t(text: string): SpecValue {
  return { type: 'text', text };
}

function yes(): SpecValue {
  return { type: 'included' };
}

function no(): SpecValue {
  return { type: 'excluded' };
}

export const packageSpecMatrix: PackageSpecMatrix = {
  packages: [
    {
      id: 'comfort',
      name: 'Comfort',
      comparisonName: 'Comfort',
      description: 'A budget package with no compromise on quality that includes all construction essentials.',
      price: 1995,
      pricePrefix: '\u20B9',
      priceUnit: 'per sq.ft',
      features: [
        'Trusted brand steel & cement',
        'Standard floor tiles upto \u20B950/sqft',
        'Standard flush doors and window finish',
        'Tractor Emulsion finish',
        'Essential kitchen & bathroom fittings',
      ],
      icon: 'home',
      active: true,
      displayOrder: 1,
    },
    {
      id: 'premium',
      name: 'Premium',
      comparisonName: 'Premium',
      description: 'Our best seller package with upgraded brands like Jindal Steels, Hindware etc at a considerable price.',
      price: 2145,
      pricePrefix: '\u20B9',
      priceUnit: 'per sq.ft',
      features: [
        'Superior brand steel & cement',
        'Refined floor tiles upto \u20B9100/sqft',
        'Elegant teak doors and window finish',
        'Tractor Shyne Emulsion finish',
        'Stylish kitchen & bathroom',
      ],
      popular: true,
      icon: 'star',
      active: true,
      displayOrder: 2,
    },
    {
      id: 'luxury',
      name: 'Luxury',
      comparisonName: 'Luxury',
      description: 'An elegant package crafted for modern living with extra provisions like solar heater setup, puja room door etc.',
      price: 2495,
      pricePrefix: '\u20B9',
      priceUnit: 'per sq.ft',
      features: [
        'Superior Brand steel & cement',
        'Premium floor tiles upto \u20B9140/sqft',
        'Designer teak doors and window finish',
        'Apcolite Premium finish',
        'Quality kitchen & bathroom',
      ],
      icon: 'diamond',
      active: true,
      displayOrder: 3,
    },
    {
      id: 'custom',
      name: 'Custom Build',
      comparisonName: 'Custom Build',
      description: 'Fully customised construction tailored to your vision. Work directly with our architects and engineers.',
      price: null,
      pricePrefix: '',
      priceUnit: '',
      features: [
        'Personal architect consultation',
        'Custom floor plans',
        'Premium material selection',
        'Landscape architecture',
        'Interior design service',
        'Project management included',
      ],
      custom: true,
      icon: 'blueprint',
      active: true,
      displayOrder: 4,
    },
  ],
  categories: [
    {
      id: 'structure',
      title: 'Structure',
      rows: [
        {
          id: 'steel',
          label: 'Steel',
          reference: 'Fe 550/Fe 550D',
          values: {
            comfort: t('Sunvik / Prime gold / Kamdhenu / Tirumala'),
            premium: t('Indus / Jindal Panther / Vizag'),
            luxury: t('Indus / Jindal Panther / Vizag'),
          },
        },
        {
          id: 'cement',
          label: 'Cement',
          reference: '43 grade in surface, 53 grade in core',
          values: {
            comfort: t('Zuari / Dalmia / Bharathi'),
            premium: t('Zuari / Dalmia / Bharathi'),
            luxury: t('ACC / Ultratech / Ramco Supercrete'),
          },
        },
        {
          id: 'aggregates',
          label: 'Aggregates',
          reference: '20mm & 40mm',
          values: { comfort: yes(), premium: yes(), luxury: yes() },
        },
        {
          id: 'blockwork',
          label: 'Block work',
          reference: '6 inch (outer), 4 inch (inner) - Solid concrete blocks',
          values: { comfort: yes(), premium: yes(), luxury: yes() },
        },
        {
          id: 'rccmix',
          label: 'RCC Mix',
          reference: 'M20 or M25',
          values: {
            comfort: yes(),
            premium: yes(),
            luxury: t('ACC or Ultratech'),
          },
        },
        {
          id: 'ceiling',
          label: 'Ceiling height',
          reference: 'Floor-to-Floor height 10ft',
          values: { comfort: yes(), premium: yes(), luxury: yes() },
        },
      ],
    },
    {
      id: 'kitchen',
      title: 'Kitchen',
      subtitle: 'All fittings can be customised at cost',
      rows: [
        {
          id: 'k_dado',
          label: 'Ceramic Wall Dado',
          values: {
            comfort: t('Upto \u20B940 per sqft'),
            premium: t('Upto \u20B960 per sqft'),
            luxury: t('Upto \u20B980 per sqft'),
          },
        },
        {
          id: 'k_sink',
          label: 'Sink',
          values: {
            comfort: t('Upto \u20B93000 (Single bowl SS)'),
            premium: t('Upto \u20B96000 (Futura, Carysill)'),
            luxury: t('Upto \u20B98000 (Futura, Carysill)'),
          },
        },
        {
          id: 'k_faucet',
          label: 'Sink Faucet',
          values: {
            comfort: t('Upto \u20B91300'),
            premium: t('Upto \u20B92600'),
            luxury: t('Upto \u20B93500'),
          },
        },
        {
          id: 'k_accessories',
          label: 'Sink Accessories',
          values: {
            comfort: t('ISI Marked'),
            premium: t('ISI Marked'),
            luxury: t('Parryware / Hindware / Jaquar'),
          },
        },
      ],
    },
    {
      id: 'bathroom',
      title: 'Bathroom',
      subtitle: 'All fittings can be customised at cost',
      rows: [
        {
          id: 'b_dado',
          label: 'Ceramic Wall Dado',
          values: {
            comfort: t('Upto \u20B940 per sqft'),
            premium: t('Upto \u20B960 per sqft'),
            luxury: t('Upto \u20B980 per sqft'),
          },
        },
        {
          id: 'b_cp',
          label: 'Sanitary & CP fittings',
          values: {
            comfort: t('Upto \u20B930,000 per 1000 sqft\n(Cera / equivalent)'),
            premium: t('Upto \u20B950,000 per 1000 sqft\n(Hindware / Parryware)'),
            luxury: t('Upto \u20B970,000 per 1000 sqft\n(Jaquar / equivalent)'),
          },
        },
        {
          id: 'b_cpvc',
          label: 'CPVC Pipe',
          values: {
            comfort: t('APL Apollo / equivalent'),
            premium: t('APL Apollo / equivalent'),
            luxury: t('APL Apollo / equivalent'),
          },
        },
        {
          id: 'b_doors',
          label: 'Bathroom doors',
          reference: 'Waterproof flush doors or WPC',
          values: { comfort: yes(), premium: yes(), luxury: yes() },
        },
        {
          id: 'b_accessories',
          label: 'Bathroom Accessories',
          values: {
            comfort: no(),
            premium: no(),
            luxury: t('Mirror, Soap dish, Towel rail - worth of \u20B97,000 per 1000 sqft'),
          },
        },
        {
          id: 'b_solar',
          label: 'Provision for Solar water heater',
          values: { comfort: no(), premium: no(), luxury: yes() },
        },
      ],
    },
    {
      id: 'doors',
      title: 'Doors & Windows',
      rows: [
        {
          id: 'd_main',
          label: 'Main Door',
          values: {
            comfort: t('Flush doors with veneer & frame with salwood upto \u20B920,000 including accessories'),
            premium: t('Teak Door With Teak frame of 5 inch by 3 inch, worth Rs.30,000 including fixtures.'),
            luxury: t('Teak door with teak frame of 5inch by 3.5 inch, worth \u20B940,000 including fixtures'),
          },
        },
        {
          id: 'd_internal',
          label: 'Internal Doors',
          values: {
            comfort: t('Membrane / Flush door with laminates upto \u20B911,000'),
            premium: t('Membrane / Flush door with laminates upto \u20B911,000'),
            luxury: t('Membrane / Flush door with laminates upto \u20B913,000'),
          },
        },
        {
          id: 'd_puja',
          label: 'Puja Room Door',
          values: {
            comfort: no(),
            premium: no(),
            luxury: t('Teak shutter with teak frame worth of \u20B928,000 for every 2,000 sqft of package area'),
          },
        },
        {
          id: 'd_windows',
          label: 'Windows',
          reference: '3 Track with 1 Mesh',
          values: {
            comfort: t('Aluminium windows \u20B9440 per sqft of Jindal Profiles'),
            premium: t('UPVC windows \u20B9495 per sqft of Luthing / Plasto / Lesso eiti'),
            luxury: t('UPVC windows \u20B9700 per sqft of NCL Veka / Prominence / V-tech / Greentech'),
          },
        },
        {
          id: 'd_grills',
          label: 'Window grills',
          reference: 'Basic design MS Grill \u20B9195 per sqft',
          values: { comfort: yes(), premium: yes(), luxury: yes() },
        },
      ],
    },
    {
      id: 'painting',
      title: 'Painting',
      rows: [
        {
          id: 'p_interior',
          label: 'Interior Painting',
          reference: '(Asian Paints) JK Putty + Primer + Emulsion Paint',
          values: {
            comfort: t('Tractor Emulsion'),
            premium: t('Tractor Shyne Emulsion'),
            luxury: t('Apcolite Premium Emulsion'),
          },
        },
        {
          id: 'p_exterior',
          label: 'Exterior Painting',
          reference: '(Asian Paints) Primer + Exterior Emulsion',
          values: {
            comfort: t('Ace Exterior Emulsion'),
            premium: t('Apex Exterior Emulsion'),
            luxury: t('Apex Exterior Emulsion'),
          },
        },
      ],
    },
    {
      id: 'flooring',
      title: 'Flooring',
      subtitle: 'Laying charges will vary for marble, tiles and granite',
      rows: [
        {
          id: 'f_living',
          label: 'Living & Dining Flooring',
          values: {
            comfort: t('Tiles upto \u20B950 per sqft'),
            premium: t('Tiles / Granite upto \u20B9100 per sqft'),
            luxury: t('Tiles / Granite / Marble upto \u20B9140 per sqft'),
          },
        },
        {
          id: 'f_rooms',
          label: 'Rooms and Kitchen Flooring',
          values: {
            comfort: t('Tiles upto \u20B950 per sqft'),
            premium: t('Tiles upto \u20B980 per sqft'),
            luxury: t('Tiles upto \u20B9120 per sqft'),
          },
        },
        {
          id: 'f_balcony',
          label: 'Balcony and Open Area',
          reference: 'Anti Skid',
          values: {
            comfort: t('Tiles upto \u20B940 per sqft'),
            premium: t('Tiles upto \u20B960 per sqft'),
            luxury: t('Tiles upto \u20B980 per sqft'),
          },
        },
        {
          id: 'f_staircase',
          label: 'Staircase',
          reference: 'Sadarahalli Granite',
          values: {
            comfort: t('Upto \u20B970 per sqft'),
            premium: t('Upto \u20B980 per sqft'),
            luxury: t('Upto \u20B9110 per sqft'),
          },
        },
        {
          id: 'f_parking',
          label: 'Parking',
          reference: 'Anti Skid',
          values: {
            comfort: t('Tiles upto \u20B940 per sqft'),
            premium: t('Tiles upto \u20B950 per sqft'),
            luxury: t('Tiles upto \u20B970 per sqft'),
          },
        },
      ],
    },
    {
      id: 'wiring',
      title: 'Wiring',
      rows: [
        {
          id: 'w_fire',
          label: 'Fireproof Wiring',
          reference: 'Finolex silver FR or equivalent',
          values: {
            comfort: t('Finolex / Anchor / Havells'),
            premium: t('Finolex / Anchor / Havells'),
            luxury: t('Finolex / Anchor / Havells'),
          },
        },
        {
          id: 'w_switch',
          label: 'Switch',
          values: {
            comfort: t('Legrand Allzy / GM(G9) / HI-FI / Great white'),
            premium: t('Roma / Lisha / Legrand lyncus / Havells Fabio'),
            luxury: t('Legrand mylinic / Havells Coral / Roma'),
          },
        },
        {
          id: 'w_socket',
          label: 'Socket',
          values: {
            comfort: t('Legrand Allzy / GM(G9) / HI-FI / Great white'),
            premium: t('Roma / Lisha / Legrand lyncus / Havells Fabio'),
            luxury: t('Legrand mylinic / Havells Coral / Roma'),
          },
        },
        {
          id: 'w_ups',
          label: 'Provision for UPS Wiring',
          values: { comfort: no(), premium: yes(), luxury: yes() },
        },
      ],
    },
  ],
};

// Helper: get all comparison package IDs (non-custom)
export function getComparisonPackageIds(): string[] {
  return packageSpecMatrix.packages.filter((p) => !p.custom).map((p) => p.id);
}

// Helper: check if a row has differences across selected packages
export function rowHasDifferences(row: SpecRow, packageIds: string[]): boolean {
  if (packageIds.length < 2) return false;
  const values = packageIds.map((id) => {
    const v = row.values[id];
    if (!v) return '';
    if (v.type === 'included') return '__YES__';
    if (v.type === 'excluded') return '__NO__';
    return v.text || '';
  });
  return new Set(values).size > 1;
}

// Backward compat exports for package cards
export const packages = packageSpecMatrix.packages;

/* ========================
   PACKAGE PERSISTENCE (admin-managed)
   Mirrors the Projects persistence pattern (src/data/projects.ts).
   LocalStorage-backed so admin edits survive refresh, seeded once
   from the hard-coded packageSpecMatrix on first use.
   ======================== */

const PACKAGE_STORAGE_KEY = 'vijayasiri_packages';

function cloneSeeds(): Package[] {
  return packageSpecMatrix.packages.map((p) => ({ ...p, features: [...p.features] }));
}

function loadPackages(): Package[] {
  try {
    const raw = localStorage.getItem(PACKAGE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Package[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const seeded = cloneSeeds();
  savePackages(seeded);
  return seeded;
}

export function savePackages(pkgs: Package[]): void {
  localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(pkgs));
}

export function getPackages(): Package[] {
  return loadPackages();
}

export function updatePackage(id: string, updates: Partial<Package>): Package[] {
  const pkgs = loadPackages();
  const updated = pkgs.map((p) => (p.id === id ? { ...p, ...updates } : p));
  savePackages(updated);
  return updated;
}

export function addPackage(data: Partial<Package>): Package[] {
  const pkgs = loadPackages();
  const id = data.id || `pkg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const nextOrder = pkgs.reduce((max, p) => (p.displayOrder > max ? p.displayOrder : max), 0) + 1;
  const pkg: Package = {
    id,
    name: data.name || 'Untitled Package',
    comparisonName: data.comparisonName || data.name || 'Untitled Package',
    description: data.description || '',
    price: data.price ?? null,
    pricePrefix: data.pricePrefix || '',
    priceUnit: data.priceUnit || '',
    features: data.features || [],
    popular: data.popular ?? false,
    custom: data.custom ?? false,
    icon: data.icon || 'home',
    active: data.active ?? true,
    displayOrder: data.displayOrder ?? nextOrder,
  };
  const updated = [...pkgs, pkg];
  savePackages(updated);
  return updated;
}

export function resetPackages(): Package[] {
  const seeded = cloneSeeds();
  savePackages(seeded);
  return seeded;
}

