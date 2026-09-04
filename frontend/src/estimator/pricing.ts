import type { EstimatorUnit } from './units';

export interface RateConfig {
  code: string;
  label: string;
  workKind: string;
  unit: EstimatorUnit;
  amountPerUnit: number;
}

export interface PricingCatalog {
  version: number;
  rates: RateConfig[];
}

export const DEFAULT_PRICING: PricingCatalog = {
  version: 1,
  rates: [],
};

export function getConfiguredRate(
  catalog: PricingCatalog,
  workKind: string,
  unit: EstimatorUnit
): RateConfig | null {
  if (!catalog?.rates?.length) return null;
  return (
    catalog.rates.find((rate) => rate.workKind === workKind && rate.unit === unit) ?? null
  );
}

export function calculateAmount(
  quantity: number,
  rate: RateConfig | null
): number | null {
  if (!rate || !Number.isFinite(quantity)) return null;
  return quantity * rate.amountPerUnit;
}