export interface ConstructionPackage {
  id: string;
  name: string;
  rate: number;
  description: string;
  inclusions: string[];
  exclusions: string[];
  active: boolean;
}

export interface BuildingConfiguration {
  id: string;
  label: string;
  description: string;
  floorCount: number;
  floorKeys: string[];
  /** True for the special "Custom Built-up Area" option. */
  isCustom?: boolean;
}

export interface FloorCoverage {
  [floorKey: string]: number;
}

export interface MilestoneDef {
  id: string;
  name: string;
  percent: number;
  description: string;
}

export interface InclusionsSection {
  title: string;
  items: string[];
}

export interface ExclusionsSection {
  title: string;
  items: string[];
}

export interface OptionalAddon {
  id: string;
  name: string;
  unit: string;
  rate: number | null;
  description?: string;
}

/**
 * Descriptive "Number of Floors" options for the custom built-up area mode.
 * These are informational only and DO NOT affect the built-up area calculation,
 * which remains driven by the user-entered custom built-up area.
 */
export interface FloorCountOption {
  value: string;
  label: string;
}

export const floorCountOptions: FloorCountOption[] = [
  { value: 'ground', label: 'Ground Floor' },
  { value: 'g1', label: 'G+1' },
  { value: 'g2', label: 'G+2' },
  { value: 'g3', label: 'G+3' },
  { value: 'g4', label: 'G+4' },
  { value: 'other', label: 'Other' },
];

/**
 * Descriptive "Building Features" selectable options for the custom built-up
 * area mode. Purely informational - selecting a feature does not add any cost
 * or alter the built-up area or estimate total.
 */
export interface BuildingFeature {
  value: string;
  label: string;
}

export const buildingFeatures: BuildingFeature[] = [
  { value: 'parking', label: 'Parking' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'terrace', label: 'Terrace' },
  { value: 'staircase', label: 'Staircase' },
  { value: 'lift', label: 'Lift' },
  { value: 'utility', label: 'Utility / Service Area' },
  { value: 'pooja-room', label: 'Pooja Room' },
  { value: 'home-office', label: 'Home Office' },
  { value: 'store-room', label: 'Store Room' },
  { value: 'compound-wall', label: 'Compound Wall' },
];

/**
 * Demo construction packages.
 *
 * IMPORTANT: These are DEMO values only and are NOT verified or current
 * Vijaya Siri commercial rates. They exist to exercise the estimator.
 */
export const constructionPackages: ConstructionPackage[] = [
  {
    id: 'standard',
    name: 'Standard',
    rate: 1800,
    description:
      'Essential specification covering structural work, basic finishes and standard fittings.',
    inclusions: ['Structural + brickwork + plastering', 'Standard flooring and tiling', 'Standard electrical and plumbing points', 'Basic painting and finishing'],
    exclusions: ['Modular kitchen, wardrobes and furniture', 'False ceiling, solar, premium fixtures and external landscape works'],
    active: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    rate: 1900,
    description:
      'Improved finishes, better-grade fixtures and a wider specification scope.',
    inclusions: ['Everything in Standard', 'Better-grade flooring and tiles', 'Improved sanitary and electrical fixtures', 'Enhanced painting quality'],
    exclusions: ['Modular kitchen, wardrobes and furniture', 'False ceiling, solar, premium fixtures and external landscape works'],
    active: true,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    rate: 2300,
    description:
      'Premium-grade specification with higher-quality materials and finishes throughout.',
    inclusions: ['Everything in Premium', 'Premium flooring and tiling', 'Premium sanitary and electrical fixtures', 'Premium painting and finishing'],
    exclusions: ['Modular kitchen, wardrobes and furniture', 'False ceiling, solar, smart home and external landscape works'],
    active: true,
  },
];

export const buildingConfigurations: BuildingConfiguration[] = [
  {
    id: 'g',
    label: 'G',
    description: 'Ground Floor',
    floorCount: 1,
    floorKeys: ['ground'],
  },
  {
    id: 'g-plus-1',
    label: 'G+1',
    description: 'Ground + First Floor',
    floorCount: 2,
    floorKeys: ['ground', 'first'],
  },
  {
    id: 'g-plus-2',
    label: 'G+2',
    description: 'Ground + First + Second Floor',
    floorCount: 3,
    floorKeys: ['ground', 'first', 'second'],
  },
  {
    id: 'g-plus-3',
    label: 'G+3',
    description: 'Ground + First + Second + Third Floor',
    floorCount: 4,
    floorKeys: ['ground', 'first', 'second', 'third'],
  },
  {
    id: 'g-plus-4',
    label: 'G+4',
    description: 'Ground + First + Second + Third + Fourth Floor',
    floorCount: 5,
    floorKeys: ['ground', 'first', 'second', 'third', 'fourth'],
  },
  {
    id: 'custom',
    label: 'Custom Built-up Area',
    description: 'Enter the total built-up area directly for this estimate',
    floorCount: 0,
    floorKeys: [],
    isCustom: true,
  },
];

/**
 * Floor coverage rules as a fraction of the plot area used by each floor.
 * Configurable so the built-up area model can be replaced later with a
 * floor-by-floor calculation.
 *
 * NOTE: Only floors with an approved/configured coverage factor appear here.
 * G+3 (third) and G+4 (fourth) deliberately have NO configured factor yet, so
 * the estimator reports "Coverage not configured" instead of inventing a value.
 */
export const floorCoverage: FloorCoverage = {
  ground: 0.875,
  first: 0.875,
  second: 0.75,
};

/**
 * Milestone-based payment schedule as a percentage of the estimate.
 * Sum MUST equal 100 (validated at runtime by the engine).
 */
export const milestones: MilestoneDef[] = [
  { id: 'agreement', name: 'Agreement + Design + Mobilisation', percent: 5, description: 'Agreement formalities, design development and site mobilisation.' },
  { id: 'foundation', name: 'Foundation Completed', percent: 10, description: 'Excavation, PCC and foundation works completed.' },
  { id: 'plinth', name: 'Plinth Completed', percent: 8, description: 'Plinth beam and floor slab completed.' },
  { id: 'gr-rcc', name: 'Ground Floor RCC', percent: 12, description: 'Ground floor columns, beams and slabs cast.' },
  { id: 'gr-brick', name: 'Ground Floor Brickwork', percent: 8, description: 'Ground floor internal and external brickwork completed.' },
  { id: 'f1-rcc', name: 'First Floor RCC', percent: 12, description: 'First floor structural works cast.' },
  { id: 'f1-brick', name: 'First Floor Brickwork', percent: 8, description: 'First floor brickwork completed.' },
  { id: 'plaster', name: 'Plastering', percent: 10, description: 'Internal and external plastering completed.' },
  { id: 'services', name: 'Flooring + Electrical + Plumbing + Openings', percent: 10, description: 'Flooring, services and openings installed.' },
  { id: 'finishing', name: 'Painting + Fixtures + Finishing', percent: 10, description: 'Painting, fixtures and final finishing.' },
  { id: 'handover', name: 'Final Completion + Handover', percent: 7, description: 'Snagging, final completion and handover.' },
];

/**
 * Order of the repeating per-floor structural/brickwork construction stages.
 * The same set is reused for every floor configuration (G .. G+4), so adding a
 * future floor type only requires extending this list.
 */
interface FloorStageTemplate {
  label: string;
  rccDesc: string;
  brickDesc: string;
}

const FLOOR_STAGE_TEMPLATES: FloorStageTemplate[] = [
  {
    label: 'Ground',
    rccDesc: 'Ground floor columns, beams and slabs cast.',
    brickDesc: 'Ground floor internal and external brickwork completed.',
  },
  {
    label: 'First',
    rccDesc: 'First floor structural works cast.',
    brickDesc: 'First floor brickwork completed.',
  },
  {
    label: 'Second',
    rccDesc: 'Second floor structural works cast.',
    brickDesc: 'Second floor brickwork completed.',
  },
  {
    label: 'Third',
    rccDesc: 'Third floor structural works cast.',
    brickDesc: 'Third floor brickwork completed.',
  },
  {
    label: 'Fourth',
    rccDesc: 'Fourth floor structural works cast.',
    brickDesc: 'Fourth floor brickwork completed.',
  },
];

/**
 * Fixed milestone groups used by the milestone generator.
 * - Pre-floor / initial group
 * - Per-floor structural + brickwork stages
 * - Final finishing group
 *
 * Values are preserved from the existing G+1 schedule so the same commercial
 * split is retained for every configuration:
 *   pre-floor = 5 + 10 + 8 = 23%
 *   final     = 10 + 10 + 10 + 7 = 37%
 *   floor pool = 100 - 23 - 37 = 40%
 * Within a floor, RCC : brickwork keeps the existing 12 : 8 (3 : 2) ratio.
 */
const MILESTONE_FLOOR_POOL_PERCENT = 40;

/** Office rounding to whole percentage points. */
function roundPercent(value: number): number {
  return Math.round(value);
}

/**
 * Resolves the number of floors for a selected building configuration.
 *
 * - Standard configurations use their configured `floorCount`.
 * - Custom Built-up Area mode uses the user-entered descriptive floor count
 *   (already resolved into a number) when present.
 *
 * Returns null when a valid floor count cannot be determined so the caller can
 * fall back safely instead of inventing a floor count.
 */
export function resolveFloorCount(
  configuration: BuildingConfiguration | undefined,
  customFloorCount: number | null | undefined
): number | null {
  if (!configuration) return null;
  if (configuration.isCustom) {
    if (customFloorCount !== null && customFloorCount !== undefined && Number.isFinite(customFloorCount) && customFloorCount > 0) {
      return Math.floor(customFloorCount);
    }
    return null;
  }
  if (Number.isFinite(configuration.floorCount) && configuration.floorCount > 0) {
    return Math.floor(configuration.floorCount);
  }
  return null;
}

export interface GeneratePaymentMilestonesOptions {
  /** Resolved floor count for Custom Built-up Area mode (ignored otherwise). */
  customFloorCount?: number | null;
}

/**
 * Builds the payment milestone schedule for a given building configuration.
 *
 * The pre-floor and final milestones are fixed; the remaining construction
 * floor pool (40%) is distributed evenly across the applicable floors. Rounded
 * values are corrected so the schedule totals EXACTLY 100%, with any rounding
 * remainder absorbed by the final "Handover" milestone.
 *
 * Falls back to the default single-array schedule when no valid floor count can
 * be determined (e.g. an unconfigured/custom configuration without floors).
 */
export function generatePaymentMilestones(
  configuration: BuildingConfiguration | undefined,
  options: GeneratePaymentMilestonesOptions = {}
): MilestoneDef[] {
  const floorCount = resolveFloorCount(configuration, options.customFloorCount);

  if (!floorCount) {
    return milestones;
  }

  const results: MilestoneDef[] = [
    {
      id: 'agreement',
      name: 'Agreement + Design + Mobilisation',
      percent: 5,
      description: 'Agreement formalities, design development and site mobilisation.',
    },
    {
      id: 'foundation',
      name: 'Foundation Completed',
      percent: 10,
      description: 'Excavation, PCC and foundation works completed.',
    },
    {
      id: 'plinth',
      name: 'Plinth Completed',
      percent: 8,
      description: 'Plinth beam and floor slab completed.',
    },
  ];

  const perFloorPercent = MILESTONE_FLOOR_POOL_PERCENT / floorCount;
  const perFloorRcc = perFloorPercent * 0.6;
  const perFloorBrick = perFloorPercent * 0.4;

  for (let index = 0; index < floorCount; index += 1) {
    const template = FLOOR_STAGE_TEMPLATES[index];
    if (!template) break;
    results.push({
      id: `floor-${index}-rcc`,
      name: `${template.label} Floor RCC`,
      percent: roundPercent(perFloorRcc),
      description: template.rccDesc,
    });
    results.push({
      id: `floor-${index}-brick`,
      name: `${template.label} Floor Brickwork`,
      percent: roundPercent(perFloorBrick),
      description: template.brickDesc,
    });
  }

  results.push({
    id: 'plaster',
    name: 'Plastering',
    percent: 10,
    description: 'Internal and external plastering completed.',
  });
  results.push({
    id: 'services',
    name: 'Flooring + Electrical + Plumbing + Openings',
    percent: 10,
    description: 'Flooring, services and openings installed.',
  });
  results.push({
    id: 'finishing',
    name: 'Painting + Fixtures + Finishing',
    percent: 10,
    description: 'Painting, fixtures and final finishing.',
  });
  results.push({
    id: 'handover',
    name: 'Final Completion + Handover',
    percent: 7,
    description: 'Snagging, final completion and handover.',
  });

  const total = results.reduce((sum, def) => sum + def.percent, 0);
  const remainder = 100 - total;
  if (remainder !== 0 && results.length > 0) {
    results[results.length - 1].percent += remainder;
  }

  return results;
}

export const inclusions: InclusionsSection[] = [
  {
    title: 'Civil & Structural',
    items: [
      'Excavation',
      'PCC where applicable',
      'Foundation',
      'RCC columns',
      'RCC beams',
      'RCC slabs',
      'Staircase',
      'Reinforcement steel',
      'Formwork/shuttering',
      'Brick/block masonry',
      'Internal plastering',
      'External plastering',
    ],
  },
  {
    title: 'Flooring & Tiling',
    items: [
      'Floor tiles according to package specification',
      'Bathroom flooring',
      'Bathroom wall tiles according to specification',
      'Skirting',
      'Kitchen dado according to specification',
    ],
  },
  {
    title: 'Doors & Windows',
    items: [
      'Main door according to specification',
      'Internal doors',
      'Bathroom doors',
      'Windows',
      'Frames',
      'Standard hardware',
    ],
  },
  {
    title: 'Electrical',
    items: [
      'Concealed conduits',
      'Wiring',
      'Switch boxes',
      'Standard switches/sockets',
      'Distribution board',
      'MCB/RCCB provision',
      'Earthing',
      'Standard electrical points',
    ],
  },
  {
    title: 'Plumbing',
    items: [
      'Water-supply piping',
      'Drainage piping',
      'Soil/waste piping',
      'Bathroom plumbing points',
      'Kitchen plumbing points',
    ],
  },
  {
    title: 'Sanitary',
    items: [
      'WC',
      'Wash basin',
      'Standard taps',
      'Shower points',
      'Basic bathroom fittings',
    ],
  },
  {
    title: 'Painting',
    items: [
      'Surface preparation',
      'Putty where specified',
      'Primer',
      'Interior paint',
      'Exterior paint',
      'Ceiling paint',
    ],
  },
];

export const exclusions: ExclusionsSection[] = [
  {
    title: 'Land & Legal',
    items: [
      'Land purchase',
      'Registration',
      'Stamp duty',
      'Legal fees',
      'Property documentation charges',
    ],
  },
  {
    title: 'Government / Approval',
    items: [
      'Building approval fees',
      'Municipal/local authority charges',
      'Development charges',
      'Statutory fees',
      'Government charges/taxes where applicable',
    ],
  },
  {
    title: 'Site-Specific',
    items: [
      'Rock excavation',
      'Hard-rock breaking',
      'Piling',
      'Special foundation systems',
      'Dewatering',
      'Major soil treatment',
      'Retaining walls unless specifically included',
    ],
  },
  {
    title: 'External Works',
    items: [
      'Compound wall unless specified',
      'Main gate unless specified',
      'Landscaping',
      'Garden work',
      'Major driveway/paving',
      'Decorative external works',
    ],
  },
  {
    title: 'Utility Connections',
    items: [
      'Electricity connection/meter charges',
      'Water connection charges',
      'Borewell',
      'Borewell equipment',
      'Water tanker charges',
      'Sewage connection charges',
      'Utility deposits',
    ],
  },
  {
    title: 'Appliances',
    items: [
      'AC',
      'Geyser',
      'Refrigerator',
      'Washing machine',
      'TV',
      'Water purifier',
      'Kitchen appliances',
      'Solar systems unless specified',
    ],
  },
  {
    title: 'Custom / Premium Items',
    items: [
      'Modular kitchen',
      'Wardrobes',
      'Furniture',
      'False ceiling unless specified',
      'Decorative wall panels',
      'Premium lighting',
      'Smart-home systems',
      'CCTV/security systems',
      'Premium sanitary/electrical fixtures',
    ],
  },
];

export const SCOPE_CHANGE_NOTE =
  'Any customer-requested work outside the approved scope must be treated as a Change Request and separately priced and approved before execution.';

export const ADDON_RATE_NOT_CONFIGURED = 'Rate not configured';

export const optionalAddons: OptionalAddon[] = [
  { id: 'modular-kitchen', name: 'Modular kitchen', unit: 'set', rate: null },
  { id: 'wardrobes', name: 'Wardrobes', unit: 'set', rate: null },
  { id: 'false-ceiling', name: 'False ceiling', unit: 'sq ft', rate: null },
  { id: 'compound-wall', name: 'Compound wall', unit: 'r.ft', rate: null },
  { id: 'main-gate', name: 'Main gate', unit: 'set', rate: null },
  { id: 'solar-water-heater', name: 'Solar water heater', unit: 'nos', rate: null },
  { id: 'solar-power', name: 'Solar power', unit: 'kW', rate: null },
  { id: 'cctv', name: 'CCTV', unit: 'nos', rate: null },
  { id: 'smart-home', name: 'Smart home', unit: 'set', rate: null },
  { id: 'premium-sanitary', name: 'Premium sanitary', unit: 'set', rate: null },
  { id: 'premium-electrical', name: 'Premium electrical fixtures', unit: 'set', rate: null },
  { id: 'landscaping', name: 'Landscaping', unit: 'lot', rate: null },
];

export const DEMO_RATES_NOTE =
  'Package rates shown here are DEMO values for this preview and are not verified commercial rates.';

export function getOptionalAddonById(id: string): OptionalAddon | null {
  return optionalAddons.find((addon) => addon.id === id) ?? null;
}