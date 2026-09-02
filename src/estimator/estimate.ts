import type { EstimatorUnit } from './units';
import { calculateAmount, getConfiguredRate, type PricingCatalog } from './pricing';

export const ESTIMATE_CATEGORIES: readonly string[] = [
  'Site / Preliminary Works',
  'Foundation',
  'RCC / Structural Works',
  'Brick / Block Work',
  'Plastering',
  'Flooring',
  'Doors & Windows',
  'Electrical',
  'Plumbing',
  'Painting',
  'Other Civil Works',
];

export interface EstimateLine {
  description: string;
  quantity: number | null;
  unit: EstimatorUnit | null;
  rate: number | null;
  amount: number | null;
}

export interface EstimateRow {
  category: string;
  line: EstimateLine;
}

export interface CivilEstimateLineInput {
  category: string;
  description: string;
  quantity: number | null;
  unit: EstimatorUnit | null;
  workKind: string | null;
}

function amountFor(
  quantity: number | null,
  unit: EstimatorUnit | null,
  workKind: string | null,
  catalog: PricingCatalog
): EstimateLine {
  if (quantity === null || quantity <= 0 || unit === null || workKind === null) {
    return {
      description: '',
      quantity,
      unit,
      rate: null,
      amount: null,
    };
  }
  const rate = getConfiguredRate(catalog, workKind, unit);
  return {
    description: '',
    quantity,
    unit,
    rate: rate ? rate.amountPerUnit : null,
    amount: rate ? calculateAmount(quantity, rate) : null,
  };
}

export function buildCivilEstimateRows(
  input: CivilEstimateLineInput,
  catalog: PricingCatalog
): EstimateRow[] {
  return [{ category: input.category, line: amountFor(input.quantity, input.unit, input.workKind, catalog) }];
}

export function buildNoRateEstimate(): EstimateRow[] {
  return ESTIMATE_CATEGORIES.map((category) => ({
    category,
    line: {
      description: '',
      quantity: null,
      unit: null,
      rate: null,
      amount: null,
    },
  }));
}