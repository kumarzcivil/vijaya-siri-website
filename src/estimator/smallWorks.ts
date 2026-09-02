import { roundTo } from './units';

/**
 * Small Works Estimator domain types and pure calculation helpers.
 *
 * This module is intentionally separate from the Project Estimator (built-up
 * area / G .. G+4) model. Small works are itemised BOQ estimates where
 * Amount = Quantity x Rate, with independent editable payment terms.
 */

export const SMALL_WORKS_UNITS = [
  'Sq.ft',
  'Sq.m',
  'R.ft',
  'Nos',
  'Each',
  'Kg',
  'Ltr',
  'Cu.ft',
  'Cu.m',
  'Hour',
  'Day',
  'LS',
  'Other',
] as const;

export type SmallWorksUnit = (typeof SMALL_WORKS_UNITS)[number];

export const SMALL_WORKS_CATEGORIES = [
  'Civil Works',
  'Repair & Renovation',
  'Flooring',
  'Painting',
  'Plumbing',
  'Electrical',
  'Waterproofing',
  'Compound Wall',
  'General Small Works',
] as const;

export type SmallWorksCategory = (typeof SMALL_WORKS_CATEGORIES)[number];

export interface BOQItem {
  id: string;
  description: string;
  category: string;
  unit: SmallWorksUnit;
  quantity: number;
  /** Per-unit rate in rupees. */
  rate: number;
  specification: string;
  remarks: string;
}

export interface ScopeOfWork {
  includedWorks: string;
  excludedWorks: string;
  specifications: string;
}

export type PaymentMode = 'percentage' | 'advance-balance' | 'custom';

export interface PaymentStageEntry {
  type: 'percent' | 'amount';
  value: number;
}

export interface PaymentStage {
  id: string;
  name: string;
  description: string;
  entry: PaymentStageEntry;
}

export interface AdvanceConfig {
  kind: 'percent' | 'amount';
  value: number;
}

export interface PaymentConfig {
  mode: PaymentMode;
  /** Stages used by 'percentage' and 'custom' modes. */
  stages: PaymentStage[];
  /** Advance configuration for 'advance-balance' mode. */
  advance?: AdvanceConfig | null;
}

export interface EstimateTerm {
  id: string;
  title: string;
  description: string;
}

export interface SmallWorksEstimate {
  id: string;
  estimateNumber: string;
  date: string;
  customerName: string;
  mobileNumber: string;
  workTitle: string;
  workCategory: string;
  siteLocation: string;
  description: string;
  boq: BOQItem[];
  scope: ScopeOfWork;
  payment: PaymentConfig;
  terms: EstimateTerm[];
}

/**
 * Amount for a single BOQ item = quantity x rate.
 * Returns 0 for invalid/missing values so the UI never shows NaN/Infinity.
 */
export function boqItemAmount(item: BOQItem): number {
  const quantity = item?.quantity;
  const rate = item?.rate;
  if (
    quantity === null ||
    quantity === undefined ||
    !Number.isFinite(quantity) ||
    quantity < 0 ||
    rate === null ||
    rate === undefined ||
    !Number.isFinite(rate) ||
    rate < 0
  ) {
    return 0;
  }
  return roundTo(quantity * rate, 2);
}

/** Grand subtotal of all BOQ items. NEVER manually editable. */
export function boqSubtotal(boq: BOQItem[]): number {
  return roundTo(
    (boq ?? []).reduce((sum, item) => sum + boqItemAmount(item), 0),
    2
  );
}

/**
 * Total value of an estimate. The current architecture has no tax / discount /
 * contingency system, so the total equals the BOQ subtotal.
 */
export function estimateTotal(estimate: SmallWorksEstimate): number {
  return boqSubtotal(estimate.boq);
}

export interface ResolvedPaymentRow {
  id: string;
  name: string;
  description: string;
  percent: number;
  amount: number;
}

function stageAmount(total: number, entry: PaymentStageEntry): number {
  if (entry.type === 'amount') {
    return Number.isFinite(entry.value) && entry.value > 0 ? roundTo(entry.value, 2) : 0;
  }
  return roundTo((total * (entry.value || 0)) / 100, 2);
}

/**
 * Resolves payment terms into concrete stage rows (name, percent, amount)
 * based on the estimate total. The final "Balance" row for the advance-balance
 * mode absorbs the remaining amount so everything reconciles with the total.
 */
export function resolvePaymentRows(
  total: number,
  config: PaymentConfig
): ResolvedPaymentRow[] {
  if (!config) return [];

  if (config.mode === 'advance-balance') {
    const advanceAmount = config.advance
      ? config.advance.kind === 'amount'
        ? roundTo(config.advance.value, 2)
        : roundTo((total * (config.advance.value || 0)) / 100, 2)
      : 0;
    const balance = roundTo(total - advanceAmount, 2);
    const rows: ResolvedPaymentRow[] = [];
    if (advanceAmount > 0 || total > 0) {
      rows.push({
        id: 'advance',
        name: 'Advance on Confirmation',
        description: 'Advance payable on confirmation of work.',
        percent: total > 0 ? (advanceAmount / total) * 100 : 0,
        amount: advanceAmount,
      });
    }
    rows.push({
      id: 'balance',
      name: 'Balance on Completion',
      description: 'Remaining amount payable after completion.',
      percent: total > 0 ? (balance / total) * 100 : 0,
      amount: balance,
    });
    return rows;
  }

  return (config.stages ?? []).map((stage, index) => {
    const amount = stageAmount(total, stage.entry);
    return {
      id: stage.id || `stage-${index}`,
      name: stage.name,
      description: stage.description,
      percent: total > 0 ? (amount / total) * 100 : 0,
      amount,
    };
  });
}

/**
 * Sum of resolved payment amounts. Should reconcile with the estimate total.
 */
export function resolvedPaymentTotal(rows: ResolvedPaymentRow[]): number {
  return roundTo(rows.reduce((sum, row) => sum + row.amount, 0), 2);
}

/** Sum of all stage percentage values (the configured schedule, before resolve). */
export function paymentPercentSum(config: PaymentConfig): number {
  if (!config) return 0;
  if (config.mode === 'advance-balance') {
    return 100;
  }
  return (config.stages ?? []).reduce(
    (sum, stage) => sum + (stage.entry.type === 'percent' ? stage.entry.value : 0),
    0
  );
}

/**
 * Validates a percentage-driven payment schedule.
 * When stages are amount-based, validation is deferred to the resolved total
 * reconciliation instead of a fixed 100% rule.
 */
export function paymentScheduleValid(config: PaymentConfig): boolean {
  if (!config) return true;
  if (config.mode === 'advance-balance') return true;
  if ((config.stages ?? []).length === 0) return false;
  const usesPercent = (config.stages ?? []).every((stage) => stage.entry.type === 'percent');
  if (!usesPercent) return true;
  return Math.abs(paymentPercentSum(config) - 100) < 0.0001;
}

export function paymentErrorMessage(config: PaymentConfig): string | null {
  if (paymentScheduleValid(config)) return null;
  return 'Payment schedule must total 100%.';
}

export const DEFAULT_SMALL_WORKS_SCOPE: ScopeOfWork = {
  includedWorks: '',
  excludedWorks: '',
  specifications: '',
};

export const DEFAULT_SMALL_WORKS_TERMS: EstimateTerm[] = [];

export const DEFAULT_PAYMENT_STAGES: PaymentStage[] = [
  {
    id: 'advance',
    name: 'Advance on Confirmation',
    description: 'Advance payable on confirmation of work.',
    entry: { type: 'percent', value: 30 },
  },
];

export const EM_DASH = '\u2014';

/** Returns a reasonably unique id — best effort without relying on crypto. */
export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Formats a date string (YYYY-MM-DD) into a human readable label. */
export function formatDateLabel(value: string | null | undefined): string {
  if (!value) return EM_DASH;
  const normalized = value.length >= 10 ? value.slice(0, 10) : value;
  const date = new Date(normalized + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return normalized || EM_DASH;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** Today's date formatted for the <input type="date"> default value. */
export function todayInputValue(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** A short human-readable estimate number, e.g. SW-2026-00013. */
export function makeEstimateNumber(date: string): string {
  const year = date ? new Date(date.slice(0, 10) + 'T00:00:00').getFullYear() : new Date().getFullYear();
  const suffix = uid().slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `SW-${year}-${suffix}`;
}

export function copyBoqItem(item: BOQItem): BOQItem {
  return { ...item };
}

export function copyPaymentConfig(config: PaymentConfig): PaymentConfig {
  return {
    mode: config.mode,
    stages: (config.stages ?? []).map((s) => ({
      ...s,
      entry: { type: s.entry.type, value: s.entry.value },
    })),
    advance: config.advance ? { kind: config.advance.kind, value: config.advance.value } : null,
  };
}

export function copyPaymentStage(stage: PaymentStage): PaymentStage {
  return { ...stage, entry: { type: stage.entry.type, value: stage.entry.value } };
}

export interface SmallWorksSeed {
  workTitle?: string;
  workCategory?: string;
  boq?: BOQItem[];
  scope?: ScopeOfWork;
  payment?: PaymentConfig;
  terms?: EstimateTerm[];
}

/** Builds a fresh Small Works estimate, optionally seeded from a template. */
export function seedSmallWorksEstimate(seed: SmallWorksSeed = {}): SmallWorksEstimate {
  const date = todayInputValue();
  return {
    id: uid(),
    estimateNumber: makeEstimateNumber(date),
    date,
    customerName: '',
    mobileNumber: '',
    workTitle: seed.workTitle ?? '',
    workCategory: seed.workCategory ?? '',
    siteLocation: '',
    description: '',
    boq: (seed.boq ?? []).map(copyBoqItem),
    scope: seed.scope
      ? { includedWorks: seed.scope.includedWorks, excludedWorks: seed.scope.excludedWorks, specifications: seed.scope.specifications }
      : { ...DEFAULT_SMALL_WORKS_SCOPE },
    payment: copyPaymentConfig(
      seed.payment ?? {
        mode: 'percentage',
        stages: DEFAULT_PAYMENT_STAGES.map((s) => ({ ...s })),
        advance: null,
      }
    ),
    terms: (seed.terms ?? []).map((t) => ({ ...t })),
  };
}

/** Builds a fresh Small Works estimate, empty of customer-specific data. */
export function emptySmallWorksEstimate(): SmallWorksEstimate {
  const date = todayInputValue();
  return {
    id: uid(),
    estimateNumber: makeEstimateNumber(date),
    date,
    customerName: '',
    mobileNumber: '',
    workTitle: '',
    workCategory: '',
    siteLocation: '',
    description: '',
    boq: [],
    scope: { ...DEFAULT_SMALL_WORKS_SCOPE },
    payment: {
      mode: 'percentage',
      stages: DEFAULT_PAYMENT_STAGES.map((stage) => ({ ...stage })),
      advance: null,
    },
    terms: [],
  };
}
