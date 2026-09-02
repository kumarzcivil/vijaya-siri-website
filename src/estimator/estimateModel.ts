import type {
  BuildingConfiguration,
  ConstructionPackage,
  MilestoneDef,
  OptionalAddon,
} from './config';
import {
  buildingConfigurations as defaultConfigurations,
  constructionPackages as defaultPackages,
  floorCoverage as defaultFloorCoverage,
  floorCountOptions as defaultFloorCountOptions,
  generatePaymentMilestones,
  optionalAddons as defaultAddons,
} from './config';
import type { ProjectEstimateInput } from './validation';
import {
  resolveCustomFloorLabel,
  sanitizeNumericInput,
  validateProjectEstimateInput,
} from './validation';
import {
  calculateAddonAmount,
  calculateAddonTotal,
  calculateBuiltUpArea,
  calculateEstimateCost,
  calculateMilestoneAmounts,
  calculatePlotArea,
  resolveEffectiveAddonRate,
} from './engine';

export interface MilestoneRow {
  id: string;
  name: string;
  percent: number;
  description: string;
  amount: number;
  status: 'Upcoming';
}

export interface AddonEstimateRow {
  id: string;
  name: string;
  unit: string;
  /** Effective per-unit rate (user-entered, else catalog configured). */
  rate: number | null;
  /** Whether the user explicitly selected (checked) this add-on. */
  selected: boolean;
  /** Sanitized quantity text from the input. */
  quantityText: string;
  quantity: number;
  /** Amount = quantity × rate, only when selected and rate+quantity valid. */
  amount: number | null;
  /** True for user-created custom add-ons. */
  isCustom: boolean;
}

/**
 * Derived set of add-ons that are selected AND have a valid rate AND quantity.
 * Used by both the on-screen Selected Add-ons summary and the Print/PDF so the
 * two can never disagree.
 */
export function getSelectedAddons(addons: AddonEstimateRow[]): AddonEstimateRow[] {
  return addons.filter(
    (addon) => addon.selected && addon.rate !== null && addon.quantity > 0
  );
}

export interface EstimateModel {
  valid: boolean;
  reference: string;
  generatedOn: string;
  projectName: string;
  clientName: string;
  location: string;
  projectType: string;
  configuration: BuildingConfiguration;
  /** True when the custom built-up area option is selected. */
  isCustomConfiguration: boolean;
  /** Parsed custom built-up area (0 when not custom or invalid). */
  customBuiltUpArea: number;
  /** Descriptive number-of-floors value for custom mode ('' when not set). */
  customNumberOfFloors: string;
  /** Descriptive floor-count label for custom mode (null when not set/invalid). */
  customFloorLabel: string | null;
  /** Descriptive "Other" floor count for custom mode (null when not set). */
  customOtherFloorCount: number | null;
  /** Descriptive building features selected for custom mode (values only). */
  customBuildingFeatures: string[];
  /** False when a normal configuration has unconfigured floor coverage. */
  builtUpConfigured: boolean;
  /** Human-readable configuration problem (coverage/custom area). Null when OK. */
  configurationError: string | null;
  selectedPackage: ConstructionPackage;
  plotArea: number;
  builtUpArea: number;
  perFloorBuiltUp: number[];
  ratePerSqft: number;
  /** Base Construction Cost = built-up area × package rate. */
  estimateCost: number;
  addons: AddonEstimateRow[];
  /** Sum of amounts across SELECTED add-ons with valid rate+quantity. */
  addonTotal: number;
  /** Sum of SELECTED add-on amounts + base construction cost. */
  projectTotal: number;
  addonsConfigured: boolean;
  milestones: MilestoneRow[];
  milestoneTotalPaid: number;
}

const STATUS_UPCOMING = 'Upcoming' as const;

export function createEstimateReference(date: Date, sequence = 1): string {
  const year = date.getFullYear();
  const padded = String(sequence % 10000).padStart(4, '0');
  return `VS-EST-${year}-${padded}`;
}

export interface BuildEstimateModelOptions {
  reference?: string | null;
  sequence?: number;
  generatedOn?: Date;
}

export function buildEstimateModel(
  input: ProjectEstimateInput,
  options: BuildEstimateModelOptions = {},
  packages: ConstructionPackage[] = defaultPackages,
  configurations: BuildingConfiguration[] = defaultConfigurations,
  floorCoverageValues = defaultFloorCoverage,
  milestoneDefs?: MilestoneDef[],
  addonCatalog: OptionalAddon[] = defaultAddons,
  floorCountOpts = defaultFloorCountOptions
): EstimateModel {
  const generatedOn = options.generatedOn ?? new Date();
  const reference =
    options.reference !== null && options.reference !== undefined
      ? options.reference
      : createEstimateReference(generatedOn, options.sequence ?? 1);

  const normalized = {
    ...input,
    projectName: input.projectName.trim(),
    clientName: input.clientName.trim(),
    location: input.location.trim(),
  };

  const validation = validateProjectEstimateInput(normalized, configurations);
  const isInvalid = Object.keys(validation.errors).length > 0;

  const selectedConfiguration =
    configurations.find((config) => config.id === input.configurationId) ??
    configurations[0];

  const selectedPackage =
    packages.find((pkg) => pkg.id === input.packageId) ?? packages[0];

  const isCustomConfiguration = selectedConfiguration?.isCustom === true;

  const customNumberOfFloors = isCustomConfiguration
    ? (input.customNumberOfFloors ?? '')
    : '';
  const customNumberOfFloorsMap: Record<string, number> = {
    ground: 1,
    g1: 2,
    g2: 3,
    g3: 4,
    g4: 5,
  };
  const customOtherClean = (input.customOtherFloorCount ?? '').replace(/\D/g, '');
  const customFloorCount = isCustomConfiguration
    ? customNumberOfFloors === 'other'
      ? Number(customOtherClean) > 0
        ? Number(customOtherClean)
        : null
      : customNumberOfFloorsMap[customNumberOfFloors] ?? null
    : null;
  const customOtherFloorCount = isCustomConfiguration
    ? Number(customOtherClean) > 0
      ? Number(customOtherClean)
      : null
    : null;
  const customFloorLabel = isCustomConfiguration
    ? resolveCustomFloorLabel(
        customNumberOfFloors,
        input.customOtherFloorCount ?? '',
        floorCountOpts
      )
    : null;
  const customBuildingFeatures = isCustomConfiguration
    ? input.customBuildingFeatures ?? []
    : [];

  const lengthFt = Number(normalized.siteLength);
  const widthFt = Number(normalized.siteWidth);
  const plotArea = Number.isFinite(lengthFt) && Number.isFinite(widthFt) ? calculatePlotArea(lengthFt, widthFt) : 0;

  // --- Building configuration: configured coverage OR custom built-up area ---
  const customBuiltupText = sanitizeNumericInput(input.customBuiltUpArea ?? '');
  const customBuiltUpArea = Number(customBuiltupText);

  let builtUpConfigured = true;
  let configurationError: string | null = null;
  let builtUpTotal = 0;
  let perFloorBuiltUp: number[] = [];

  if (isCustomConfiguration) {
    const customValid =
      customBuiltupText !== '' && Number.isFinite(customBuiltUpArea) && customBuiltUpArea > 0;
    builtUpConfigured = customValid;
    if (!customValid) {
      configurationError = 'Enter a valid custom built-up area.';
      perFloorBuiltUp = [];
    } else {
      perFloorBuiltUp = [customBuiltUpArea];
      builtUpTotal = customBuiltUpArea;
    }
  } else if (selectedConfiguration) {
    const missing = selectedConfiguration.floorKeys.filter((key) => {
      const coverage = floorCoverageValues[key];
      return coverage === undefined || coverage <= 0;
    });
    if (missing.length > 0) {
      builtUpConfigured = false;
      configurationError = `Coverage is not configured for ${selectedConfiguration.label}.`;
      perFloorBuiltUp = selectedConfiguration.floorKeys.map(() => 0);
    } else {
      const builtUp = calculateBuiltUpArea(plotArea, floorCoverageValues, selectedConfiguration.floorKeys);
      perFloorBuiltUp = builtUp.perFloor;
      builtUpTotal = builtUp.total;
    }
  }

  const invalid = isInvalid || !builtUpConfigured;

  const builtUp = { total: builtUpTotal, perFloor: perFloorBuiltUp };

  const estimateCost = invalid
    ? 0
    : calculateEstimateCost(builtUp.total, selectedPackage?.rate ?? 0);

  const selectedFlag = input.addonSelected ?? {};
  const rateTexts = input.addonRates ?? {};
  const userRateText = (id: string) => rateTexts[id] ?? '';

  const buildAddonRow = (
    id: string,
    name: string,
    unit: string,
    catalogRate: number | null,
    custom: boolean
  ): AddonEstimateRow => {
    const quantityText = (input.addonSelections ?? {})[id] ?? '';
    const selected = Boolean(selectedFlag[id]);
    const effectiveRate = resolveEffectiveAddonRate(userRateText(id), catalogRate);

    const cleanedQty = quantityText.replace(/\D/g, '');
    const quantity = Number(cleanedQty);
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;

    // A selected add-on still requires a valid rate and quantity to produce an amount.
    const amount = selected ? calculateAddonAmount(effectiveRate, safeQuantity) : null;

    return {
      id,
      name,
      unit,
      rate: effectiveRate,
      selected,
      quantityText: cleanedQty,
      quantity: safeQuantity,
      amount,
      isCustom: custom,
    };
  };

  const catalogAddons = addonCatalog.map((addon) =>
    buildAddonRow(addon.id, addon.name, addon.unit, addon.rate, false)
  );

  const customAddons = (input.customAddons ?? []).map((custom) =>
    buildAddonRow(custom.id, custom.name.trim(), custom.unit.trim(), null, true)
  );

  const addons: AddonEstimateRow[] = [...catalogAddons, ...customAddons];

  const addonTotal = invalid
    ? 0
    : calculateAddonTotal(
        addons
          .filter((addon) => addon.selected)
          .map((addon) => ({ rate: addon.rate, quantity: addon.quantity }))
      );

  const projectTotal = invalid ? 0 : estimateCost + addonTotal;

  const effectiveMilestoneDefs =
    milestoneDefs ?? generatePaymentMilestones(selectedConfiguration, { customFloorCount });

  const milestoneRows: MilestoneRow[] = invalid
    ? effectiveMilestoneDefs.map((def) => ({
        id: def.id,
        name: def.name,
        percent: def.percent,
        description: def.description,
        amount: 0,
        status: STATUS_UPCOMING,
      }))
    : calculateMilestoneAmounts(projectTotal, effectiveMilestoneDefs).map(({ def, amount }) => ({
        id: def.id,
        name: def.name,
        percent: def.percent,
        description: def.description,
        amount,
        status: STATUS_UPCOMING,
      }));

  const milestoneTotalPaid = milestoneRows.reduce((sum, row) => sum + row.amount, 0);

  return {
    valid: !invalid,
    reference,
    generatedOn: generatedOn.toISOString(),
    projectName: normalized.projectName,
    clientName: normalized.clientName,
    location: normalized.location,
    projectType: input.projectType,
    configuration: selectedConfiguration,
    isCustomConfiguration,
    customBuiltUpArea,
    customNumberOfFloors,
    customFloorLabel,
    customOtherFloorCount,
    customBuildingFeatures,
    builtUpConfigured,
    configurationError,
    selectedPackage: selectedPackage,
    plotArea,
    builtUpArea: builtUp.total,
    perFloorBuiltUp: builtUp.perFloor,
    ratePerSqft: selectedPackage?.rate ?? 0,
    estimateCost,
    addons,
    addonTotal,
    projectTotal,
    addonsConfigured: addons.some((addon) => addon.selected),
    milestones: milestoneRows,
    milestoneTotalPaid,
  };
}