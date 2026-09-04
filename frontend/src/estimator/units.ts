export type EstimatorUnit = 'sqft' | 'sqm' | 'cft' | 'cum' | 'rm' | 'nos';

interface UnitMeta {
  unit: EstimatorUnit;
  label: string;
  shortLabel: string;
}

export const UNITS: Record<EstimatorUnit, UnitMeta> = {
  sqft: { unit: 'sqft', label: 'Square Feet', shortLabel: 'sq.ft' },
  sqm: { unit: 'sqm', label: 'Square Metre', shortLabel: 'sq.m' },
  cft: { unit: 'cft', label: 'Cubic Feet', shortLabel: 'cu.ft' },
  cum: { unit: 'cum', label: 'Cubic Metre', shortLabel: 'cu.m' },
  rm: { unit: 'rm', label: 'Running Metre', shortLabel: 'r.m' },
  nos: { unit: 'nos', label: 'Number', shortLabel: 'nos' },
};

export const SQM_TO_SQFT = 10.7639104167;
export const CUM_TO_CFT = 35.314666721489;

export function sqmToSqft(value: number): number {
  return value * SQM_TO_SQFT;
}

export function sqftToSqm(value: number): number {
  return value / SQM_TO_SQFT;
}

export function cumToCft(value: number): number {
  return value * CUM_TO_CFT;
}

export function cftToCum(value: number): number {
  return value / CUM_TO_CFT;
}

export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '\u2014';
  const rounded = roundTo(value);
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '\u2014';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatInrPerSqft(value: number): string {
  if (!Number.isFinite(value)) return '\u2014';
  return `\u20b9 ${formatNumber(value)}/sq ft`;
}