import type {
  BOQItem,
  EstimateTerm,
  PaymentConfig,
  ScopeOfWork,
  SmallWorksUnit,
} from '../estimator/smallWorks';
import { DEFAULT_PAYMENT_STAGES } from '../estimator/smallWorks';

/**
 * Small Works estimate templates.
 *
 * Templates are STARTING POINTS — they seed a new Small Works estimate with a
 * default BOQ, scope, payment stages and terms. Every item remains fully
 * editable within the estimate, and editing an estimate never mutates the
 * template.
 */

export interface SmallWorksTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultBoq: BOQItem[];
  defaultScope: ScopeOfWork;
  defaultPayment: PaymentConfig;
  defaultTerms: EstimateTerm[];
}

function item(
  id: string,
  description: string,
  unit: SmallWorksUnit,
  quantity: number,
  rate: number,
  specification = '',
  remarks = ''
): BOQItem {
  return {
    id,
    description,
    category: '',
    unit,
    quantity,
    rate,
    specification,
    remarks,
  };
}

function term(id: string, title: string, description: string): EstimateTerm {
  return { id, title, description };
}

const COMMON_TERMS: EstimateTerm[] = [
  term(
    'validity',
    'Estimate validity',
    'This estimate is valid for 30 days from the date of issue.'
  ),
  term(
    'commencement',
    'Commencement',
    'Work commencement is subject to confirmation and the applicable advance payment.'
  ),
  term(
    'extra-work',
    'Additional work',
    'Any work outside the approved BOQ will require separate written approval and pricing.'
  ),
  term(
    'spec-availability',
    'Specifications',
    'Material specifications may be subject to availability; equivalent alternatives may be proposed.'
  ),
  term(
    'site-conditions',
    'Site conditions',
    'Unforeseen site conditions are excluded unless specifically included in the scope.'
  ),
  term(
    'measurement',
    'Quantities',
    'Final quantities may vary based on actual site measurement where applicable.'
  ),
];

const BATHROOM_PAYMENT: PaymentConfig = {
  mode: 'percentage',
  stages: [
    { id: 'p1', name: 'Advance on Confirmation', description: '', entry: { type: 'percent', value: 30 } },
    { id: 'p2', name: 'Material Procurement', description: '', entry: { type: 'percent', value: 35 } },
    { id: 'p3', name: 'Work Progress', description: '', entry: { type: 'percent', value: 25 } },
    { id: 'p4', name: 'Completion & Handover', description: '', entry: { type: 'percent', value: 10 } },
  ],
};

function defaultPayment(): PaymentConfig {
  return {
    mode: 'percentage',
    stages: DEFAULT_PAYMENT_STAGES.map((stage) => ({ ...stage })),
  };
}

export const DEFAULT_SMALL_WORKS_TEMPLATES: SmallWorksTemplate[] = [
  {
    id: 'civil-repair',
    name: 'Civil Repair',
    category: 'Repair & Renovation',
    description: 'Structural and masonry repair works on existing structures.',
    defaultBoq: [
      item('c1', 'Crack repair and sealing', 'R.ft', 0, 0, '', ''),
      item('c2', 'Plaster repair', 'Sq.ft', 0, 0, '', ''),
      item('c3', 'RCC repair and treatment', 'Sq.ft', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Crack sealing, plaster repair and surface treatment.',
      excludedWorks: 'Major structural demolition, concealed services replacement.',
      specifications: 'Repair materials to be assessed on site.',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'bathroom-renovation',
    name: 'Bathroom Renovation',
    category: 'Repair & Renovation',
    description: 'Full bathroom demolition, waterproofing, tiling and fixture fit-out.',
    defaultBoq: [
      item('b1', 'Floor tile removal', 'Sq.ft', 0, 0, '', ''),
      item('b2', 'Floor tile supply', 'Sq.ft', 0, 0, '', ''),
      item('b3', 'Tile laying', 'Sq.ft', 0, 0, '', ''),
      item('b4', 'Grouting and finishing', 'Sq.ft', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Existing tile removal, surface preparation, tile installation and grouting.',
      excludedWorks: 'Structural repairs and concealed plumbing replacement.',
      specifications: 'Tiles and fittings as per selected range.',
    },
    defaultPayment: BATHROOM_PAYMENT,
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'flooring-work',
    name: 'Flooring Work',
    category: 'Flooring',
    description: 'Supply and laying of flooring over prepared surfaces.',
    defaultBoq: [
      item('f1', 'Flooring material supply', 'Sq.ft', 0, 0, '', ''),
      item('f2', 'Flooring laying', 'Sq.ft', 0, 0, '', ''),
      item('f3', 'Skirting work', 'R.ft', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Supply and laying of flooring, skirting and finishing.',
      excludedWorks: 'Old flooring removal and base preparation unless specified.',
      specifications: 'Flooring material as per selected range.',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'painting-work',
    name: 'Painting Work',
    category: 'Painting',
    description: 'Interior and exterior painting including surface preparation.',
    defaultBoq: [
      item('p1', 'Surface preparation', 'Sq.ft', 0, 0, '', ''),
      item('p2', 'Primer coat', 'Sq.ft', 0, 0, '', ''),
      item('p3', 'Paint application', 'Sq.ft', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Surface preparation, priming and paint application.',
      excludedWorks: 'Major plaster repairs and waterproofing unless specified.',
      specifications: 'Paint as per selected brand and shade.',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'plumbing-work',
    name: 'Plumbing Work',
    category: 'Plumbing',
    description: 'Water supply, drainage and sanitary plumbing works.',
    defaultBoq: [
      item('pl1', 'Supply of pipes and fittings', 'Each', 0, 0, '', ''),
      item('pl2', 'Water supply piping', 'R.ft', 0, 0, '', ''),
      item('pl3', 'Sanitary fittings installation', 'Each', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Supply and installation of plumbing and sanitary fittings.',
      excludedWorks: 'Major structural cutting and external service connections.',
      specifications: 'Fittings as per selected range.',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'electrical-work',
    name: 'Electrical Work',
    category: 'Electrical',
    description: 'Wiring, points, switchboards and light fittings.',
    defaultBoq: [
      item('e1', 'Wiring', 'R.ft', 0, 0, '', ''),
      item('e2', 'Switch points', 'Nos', 0, 0, '', ''),
      item('e3', 'Light fittings supply & fixing', 'Each', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Concealed wiring, points and fitting installation.',
      excludedWorks: 'External service connection charges.',
      specifications: 'Material as per selected range.',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'compound-wall',
    name: 'Compound Wall',
    category: 'Compound Wall',
    description: 'Compound wall construction including masonry and plastering.',
    defaultBoq: [
      item('cw1', 'Foundation and footing', 'R.ft', 0, 0, '', ''),
      item('cw2', 'Wall masonry', 'Sq.ft', 0, 0, '', ''),
      item('cw3', 'Plastering and finishing', 'Sq.ft', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Foundation, masonry, plastering and finishing of the compound wall.',
      excludedWorks: 'Main gate, painting and external landscaping unless specified.',
      specifications: 'Wall design and height as per approved layout.',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'waterproofing',
    name: 'Waterproofing',
    category: 'Waterproofing',
    description: 'Waterproofing of roofs, terraces, bathrooms and walls.',
    defaultBoq: [
      item('w1', 'Surface preparation', 'Sq.ft', 0, 0, '', ''),
      item('w2', 'Waterproofing membrane / chemical', 'Sq.ft', 0, 0, '', ''),
      item('w3', 'Protective screed', 'Sq.ft', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'Surface preparation, waterproofing application and protective screed.',
      excludedWorks: 'Structural repair and internal finishes unless specified.',
      specifications: 'Waterproofing system as per manufacturer recommendations.',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
  {
    id: 'general-small-works',
    name: 'General Small Works',
    category: 'General Small Works',
    description: 'General repair, maintenance and small construction works.',
    defaultBoq: [
      item('g1', 'Description of work', 'Each', 0, 0, '', ''),
      item('g2', 'Description of work', 'Each', 0, 0, '', ''),
    ],
    defaultScope: {
      includedWorks: 'As described in the BOQ.',
      excludedWorks: 'Work not listed in the BOQ or scope.',
      specifications: '',
    },
    defaultPayment: defaultPayment(),
    defaultTerms: [...COMMON_TERMS],
  },
];

const STORAGE_KEY = 'vs_small_works_templates';

export function getSmallWorksTemplates(): SmallWorksTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SmallWorksTemplate[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SMALL_WORKS_TEMPLATES;
}

export function saveSmallWorksTemplates(templates: SmallWorksTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getSmallWorksTemplateById(id: string): SmallWorksTemplate | null {
  return getSmallWorksTemplates().find((t) => t.id === id) ?? null;
}
