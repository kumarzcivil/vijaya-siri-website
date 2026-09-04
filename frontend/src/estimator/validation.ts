import type { BuildingConfiguration } from './config';

export const MAX_PLOT_DIMENSION_FT = 2000;

export const FIELD_LABELS: Record<string, string> = {
  projectName: 'Project Name',
  clientName: 'Client Name',
  location: 'Location',
  siteLength: 'Site Length',
  siteWidth: 'Site Width',
};

export type ValidationErrors = Partial<Record<string, string>>;

export interface PlotDimensionResult {
  valid: boolean;
  valueFt: number | null;
  error: string | null;
}

export function parseDimensionInFeet(value: string): PlotDimensionResult {
  const trimmed = value.trim();
  if (trimmed === '') {
    return { valid: false, valueFt: null, error: 'This field is required.' };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { valid: false, valueFt: null, error: 'Enter a valid number.' };
  }
  if (parsed <= 0) {
    return { valid: false, valueFt: null, error: 'Must be greater than 0.' };
  }
  if (parsed > MAX_PLOT_DIMENSION_FT) {
    return {
      valid: false,
      valueFt: null,
      error: `Must be ${MAX_PLOT_DIMENSION_FT} ft or less.`,
    };
  }
  return { valid: true, valueFt: parsed, error: null };
}

export interface RequiredTextResult {
  valid: boolean;
  value: string;
  error: string | null;
}

export function validateRequiredText(value: string, label: string): RequiredTextResult {
  const trimmed = value.trim();
  if (trimmed === '') {
    return { valid: false, value: '', error: `${label} is required.` };
  }
  return { valid: true, value: trimmed, error: null };
}

export interface CustomAddonInput {
  id: string;
  name: string;
  unit: string;
}

export interface ProjectEstimateInput {
  projectName: string;
  clientName: string;
  location: string;
  siteLength: string;
  siteWidth: string;
  configurationId: string;
  /** Total built-up area (sq ft) entered when "Custom Built-up Area" is selected. */
  customBuiltUpArea: string;
  /** Descriptive number-of-floors value for custom mode ('' until selected). */
  customNumberOfFloors: string;
  /** User-entered whole-number floor count when "Other" is selected for custom mode. */
  customOtherFloorCount: string;
  /** Descriptive building features selected for custom mode (values only). */
  customBuildingFeatures: string[];
  packageId: string;
  projectType: string;
  /** Quantity per add-on id (string, validated + bounds-checked). */
  addonSelections: Record<string, string>;
  /** Explicit checked/selected flag per add-on id. */
  addonSelected: Record<string, boolean>;
  /** User-entered per-unit rate (in rupees) per add-on id. */
  addonRates: Record<string, string>;
  /** User-created custom add-ons (name + unit). */
  customAddons: CustomAddonInput[];
}

export function validateProjectEstimateInput(
  input: ProjectEstimateInput,
  configurations: BuildingConfiguration[]
): { errors: ValidationErrors; input: ProjectEstimateInput } {
  const errors: ValidationErrors = {};

  const projectName = validateRequiredText(input.projectName, 'Project Name');
  if (!projectName.valid && !errors.projectName) {
    errors.projectName = projectName.error ?? 'required';
  }

  const clientName = validateRequiredText(input.clientName, 'Client Name');
  if (!clientName.valid && !errors.clientName) {
    errors.clientName = clientName.error ?? 'required';
  }

  const location = validateRequiredText(input.location, 'Location');
  if (!location.valid && !errors.location) {
    errors.location = location.error ?? 'required';
  }

  const length = parseDimensionInFeet(input.siteLength);
  if (!length.valid && !errors.siteLength) {
    errors.siteLength = length.error ?? 'invalid';
  }

  const width = parseDimensionInFeet(input.siteWidth);
  if (!width.valid && !errors.siteWidth) {
    errors.siteWidth = width.error ?? 'invalid';
  }

  const hasConfig = configurations.some((config) => config.id === input.configurationId);
  if (!hasConfig && !errors.configurationId) {
    errors.configurationId = 'Select a building configuration.';
  }

  return { errors, input };
}

export interface AddonRateResult {
  valid: boolean;
  value: number | null;
  error: string | null;
}

/**
 * Parses a user-entered per-unit add-on rate (in whole rupees).
 * Accepts Indian grouping with thousands separators (e.g. "1,00,000")
 * by stripping non-numeric separators before parsing.
 */
export function parseAddonRate(value: string): AddonRateResult {
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned === '') {
    return { valid: false, value: null, error: 'Rate required for a selected add-on.' };
  }
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    return { valid: false, value: null, error: 'Enter a valid rate.' };
  }
  if (parsed <= 0) {
    return { valid: false, value: null, error: 'Rate must be greater than 0.' };
  }
  return { valid: true, value: parsed, error: null };
}

/**
 * Strips Indian thousands separators (and anything else that is not a digit)
 * from a user-entered number string so "1,00,000" becomes "100000".
 */
export function sanitizeNumericInput(value: string): string {
  return value.replace(/\D/g, '');
}

export interface CustomAddonFormErrors {
  name?: string;
  unit?: string;
  rate?: string;
  quantity?: string;
}

export function validateCustomAddonForm(form: {
  name: string;
  unit: string;
  rate: string;
  quantity: string;
}): { errors: CustomAddonFormErrors; valid: boolean } {
  const errors: CustomAddonFormErrors = {};

  if (!form.name.trim()) {
    errors.name = 'Item Name is required.';
  }

  if (!form.unit.trim()) {
    errors.unit = 'Unit is required.';
  }

  const rate = parseAddonRate(form.rate);
  if (!rate.valid) {
    errors.rate = rate.error ?? 'Enter a valid rate.';
  }

  const qtyCleaned = form.quantity.replace(/\D/g, '');
  const qty = Number(qtyCleaned);
  if (!Number.isFinite(qty) || qty <= 0) {
    errors.quantity = 'Quantity must be greater than 0.';
  }

  return { errors, valid: Object.keys(errors).length === 0 };
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Validates the optional "Other" floor count for the custom built-up area mode.
 * Must be a positive whole number; negative and decimal values are rejected.
 */
export function validateOtherFloorCount(value: string): {
  valid: boolean;
  value: number | null;
  error: string | null;
} {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned === '') {
    return { valid: false, value: null, error: 'Number of floors is required.' };
  }
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { valid: false, value: null, error: 'Enter a positive whole number.' };
  }
  return { valid: true, value: parsed, error: null };
}

/**
 * Resolves the descriptive floor-count label for the custom built-up area mode.
 * Returns null when no valid floor selection exists, otherwise the display label.
 */
export function resolveCustomFloorLabel(
  numberOfFloors: string,
  otherFloorCount: string,
  options: Array<{ value: string; label: string }>
): string | null {
  if (!numberOfFloors) return null;
  if (numberOfFloors === 'other') {
    const cleaned = otherFloorCount.replace(/\D/g, '');
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return `Other (${parsed} floors)`;
  }
  return options.find((option) => option.value === numberOfFloors)?.label ?? numberOfFloors;
}

export function isFieldInvalid(errors: ValidationErrors, field: string): boolean {
  return Boolean(errors[field]);
}