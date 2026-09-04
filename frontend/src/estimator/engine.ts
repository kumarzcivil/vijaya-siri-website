import type {
  BuildingConfiguration,
  FloorCoverage,
  MilestoneDef,
} from './config';
import { floorCoverage as defaultFloorCoverage } from './config';
import { roundTo } from './units';

export const MAX_PLOT_DIMENSION_FT = 2000;

export function calculatePlotArea(lengthInFt: number, widthInFt: number): number {
  return roundTo(lengthInFt * widthInFt);
}

export interface BuiltUpAreaResult {
  total: number;
  perFloor: number[];
}

/**
 * Floor-by-floor built-up area model. Each floor consumes a configured
 * fraction of the plot area; total built-up is the sum of all floors.
 * Replaceable later by a more sophisticated per-floor calculation without
 * changing how the rest of the estimator consumes it.
 */
export function calculateBuiltUpArea(
  plotArea: number,
  floorCoverageValues: FloorCoverage = defaultFloorCoverage,
  floorKeys: string[]
): BuiltUpAreaResult {
  const perFloor = floorKeys.map((key) => {
    const coverage = floorCoverageValues[key] ?? 0;
    return roundTo(plotArea * coverage);
  });
  const total = roundTo(perFloor.reduce((sum, value) => sum + value, 0));
  return { total, perFloor };
}

export function calculateEstimateCost(
  totalBuiltUpArea: number,
  ratePerSqft: number
): number {
  return Math.round(totalBuiltUpArea * ratePerSqft);
}

export interface AddonPricingInput {
  rate: number | null;
  quantity: number;
}

export function calculateAddonAmount(
  rate: number | null,
  quantity: number
): number | null {
  if (rate === null || rate <= 0 || quantity <= 0) return null;
  return roundTo(rate * quantity);
}

export function calculateAddonTotal(inputs: AddonPricingInput[]): number {
  const total = inputs.reduce((sum, input) => {
    const amount = calculateAddonAmount(input.rate, input.quantity);
    return sum + (amount === null ? 0 : amount);
  }, 0);
  return roundTo(total);
}

/**
 * Resolves the effective per-unit rate for an add-on.
 * Priority: user-entered rate (if valid) > catalog-configured rate.
 * Returns null when no valid rate exists.
 */
export function resolveEffectiveAddonRate(
  userRateText: string,
  configuredRate: number | null
): number | null {
  const cleaned = userRateText.replace(/\D/g, '');
  if (cleaned.length > 0) {
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return configuredRate;
}

export function milestoneTotalPercent(defs: MilestoneDef[]): number {
  return roundTo(defs.reduce((sum, def) => sum + def.percent, 0));
}

export function milestoneScheduleIsValid(defs: MilestoneDef[]): boolean {
  return Math.abs(milestoneTotalPercent(defs) - 100) < 0.0001;
}

export interface MilestoneAmount {
  def: MilestoneDef;
  amount: number;
}

/**
 * Largest-remainder distribution so the milestone amounts always sum EXACTLY
 * to the total estimate cost.
 */
export function calculateMilestoneAmounts(
  totalCost: number,
  defs: MilestoneDef[]
): MilestoneAmount[] {
  if (!Number.isFinite(totalCost) || totalCost < 0) {
    return defs.map((def) => ({ def, amount: 0 }));
  }

  const raw = defs.map((def) => (totalCost * def.percent) / 100);
  const floored = raw.map((value) => Math.floor(value));
  const remainder = Math.round(totalCost - floored.reduce((sum, value) => sum + value, 0));

  const fractions = raw.map((value, index) => value - floored[index]);
  const order = fractions
    .map((fraction, index) => ({ fraction, index }))
    .sort((a, b) => b.fraction - a.fraction);

  const extra = defs.map(() => 0);
  for (let k = 0; k < remainder; k += 1) {
    const target = order[k % order.length];
    if (target) extra[target.index] += 1;
  }

  return defs.map((def, index) => ({
    def,
    amount: floored[index] + extra[index],
  }));
}

export type { BuildingConfiguration };