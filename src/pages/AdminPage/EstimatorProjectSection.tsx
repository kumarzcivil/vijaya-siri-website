import { useMemo, useRef, useState } from 'react';
import {
  DEMO_RATES_NOTE,
  SCOPE_CHANGE_NOTE,
  buildingConfigurations,
  buildingFeatures,
  constructionPackages,
  exclusions,
  floorCountOptions,
  inclusions,
} from '../../estimator/config';
import { buildEstimateModel, createEstimateReference, getSelectedAddons } from '../../estimator/estimateModel';
import type { CustomAddonFormErrors, ProjectEstimateInput } from '../../estimator/validation';
import {
  parseAddonRate,
  parseDimensionInFeet,
  sanitizeNumericInput,
  validateCustomAddonForm,
  validateOtherFloorCount,
  validateRequiredText,
} from '../../estimator/validation';
import { formatINR, formatNumber } from '../../estimator/units';
import {
  milestoneScheduleIsValid,
  milestoneTotalPercent,
} from '../../estimator/engine';
import EstimatorSubHeader from './EstimatorSubHeader';
import './AdminShell.css';
import './AdminPage.css';
import './EstimatorModule.css';

type ProjectType = 'new-home' | 'renovation' | 'commercial' | 'civil-works';

const PROJECT_TYPES: Array<{ value: ProjectType; label: string }> = [
  { value: 'new-home', label: 'New Home' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'civil-works', label: 'Civil Works' },
];

const FLOOR_LABELS: Record<string, string> = {
  ground: 'Ground Floor',
  first: 'First Floor',
  second: 'Second Floor',
};

const STEPS = [
  { n: 1, label: 'Project Details' },
  { n: 2, label: 'Building Configuration' },
  { n: 3, label: 'Construction Package' },
  { n: 4, label: 'Estimate Summary' },
  { n: 5, label: 'Scope & Payment' },
  { n: 6, label: 'Print' },
];

const EM_DASH = '\u2014';
const INDICATIVE_LABEL = 'Indicative Construction Estimate';

const DISCLAIMER =
  'All figures are indicative and provided solely to help you understand the cost structure and financing requirements. Actual costs may vary depending on site conditions, market prices, design, specification, material and labour availability, and other factors. A detailed BOQ and final quotation prepared by Vijaya Siri Projects should be treated as the basis for commercial discussions.';

const PAYMENT_PRINCIPLE =
  'Payments are tied to physical milestones on site. Each milestone amount is released only after the corresponding work item is completed and verified on site. An executed agreement, the approved drawings, and this schedule together form the payment basis. The final handover amount is released after snagging and joint inspection.';

const INITIAL_INPUTS: ProjectEstimateInput = {
  projectName: '',
  clientName: '',
  location: '',
  siteLength: '',
  siteWidth: '',
  configurationId: 'g-plus-1',
  customBuiltUpArea: '',
  customNumberOfFloors: '',
  customOtherFloorCount: '',
  customBuildingFeatures: [],
  packageId: 'standard',
  projectType: 'new-home',
  addonSelections: {},
  addonSelected: {},
  addonRates: {},
  customAddons: [],
};

function formatDateLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return EM_DASH;
  }
}

export default function EstimatorProjectSection() {
  const [inputs, setInputs] = useState<ProjectEstimateInput>(INITIAL_INPUTS);
  const [reference] = useState(() => createEstimateReference(new Date(), 1));

  const model = useMemo(
    () => buildEstimateModel(inputs, { reference }),
    [inputs, reference]
  );

  const config = model.configuration;
  const floorLabels = config.floorKeys.map((key) => FLOOR_LABELS[key] ?? key);
  const customAreaNum = Number(inputs.customBuiltUpArea);
  const customAreaInvalid =
    config.isCustom && (!Number.isFinite(customAreaNum) || customAreaNum <= 0);

  const [customConfigTouched, setCustomConfigTouched] = useState(false);
  const [customConfigErrors, setCustomConfigErrors] = useState<{
    numberOfFloors?: string;
    otherFloorCount?: string;
  }>({});

  const customFloorsInvalid = config.isCustom && inputs.customNumberOfFloors === '';
  const customOtherInvalid =
    config.isCustom &&
    inputs.customNumberOfFloors === 'other' &&
    !validateOtherFloorCount(inputs.customOtherFloorCount).valid;

  const validateCustomConfig = () => {
    const next: { numberOfFloors?: string; otherFloorCount?: string } = {};
    if (!config.isCustom) {
      setCustomConfigErrors({});
      return true;
    }
    if (inputs.customNumberOfFloors === '') {
      next.numberOfFloors = 'Select the number of floors.';
    } else if (
      inputs.customNumberOfFloors === 'other' &&
      !validateOtherFloorCount(inputs.customOtherFloorCount).valid
    ) {
      next.otherFloorCount =
        validateOtherFloorCount(inputs.customOtherFloorCount).error ?? 'Enter a valid floor count.';
    }
    setCustomConfigErrors(next);
    return Object.keys(next).length === 0;
  };

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    const projectName = validateRequiredText(inputs.projectName, 'Project Name');
    if (!projectName.valid) next.projectName = projectName.error ?? 'required';
    const clientName = validateRequiredText(inputs.clientName, 'Client Name');
    if (!clientName.valid) next.clientName = clientName.error ?? 'required';
    const location = validateRequiredText(inputs.location, 'Location');
    if (!location.valid) next.location = location.error ?? 'required';
    const length = parseDimensionInFeet(inputs.siteLength);
    if (!length.valid) next.siteLength = length.error ?? 'invalid';
    const width = parseDimensionInFeet(inputs.siteWidth);
    if (!width.valid) next.siteWidth = width.error ?? 'invalid';
    return next;
  }, [inputs.projectName, inputs.clientName, inputs.location, inputs.siteLength, inputs.siteWidth]);

  const step1Done = !errors.projectName && !errors.clientName && !errors.location;
  const step2Done = !errors.siteLength && !errors.siteWidth;

  const setField = (key: keyof ProjectEstimateInput, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const setCustomNumberOfFloors = (value: string) => {
    setInputs((prev) => ({ ...prev, customNumberOfFloors: value }));
  };

  const setCustomOtherFloorCount = (value: string) => {
    setInputs((prev) => ({
      ...prev,
      customOtherFloorCount: sanitizeNumericInput(value),
    }));
  };

  const toggleBuildingFeature = (featureValue: string) => {
    setInputs((prev) => {
      const current = prev.customBuildingFeatures ?? [];
      const next = current.includes(featureValue)
        ? current.filter((item) => item !== featureValue)
        : [...current, featureValue];
      return { ...prev, customBuildingFeatures: next };
    });
  };

  const setAddonQuantity = (addonId: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      addonSelections: { ...prev.addonSelections, [addonId]: sanitizeNumericInput(value) },
    }));
  };

  const handleSelectAddon = (addonId: string) => {
    if (!addonId) return;
    setInputs((prev) => {
      if (prev.addonSelected[addonId]) return prev;
      return {
        ...prev,
        addonSelected: { ...prev.addonSelected, [addonId]: true },
      };
    });
  };

  const setAddonRate = (addonId: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      addonRates: { ...prev.addonRates, [addonId]: sanitizeNumericInput(value) },
    }));
  };

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    unit: '',
    rate: '',
    quantity: '',
  });
  const [customFormErrors, setCustomFormErrors] = useState<CustomAddonFormErrors>(
    {}
  );
  const customIdRef = useRef(1);

  const setCustomFormField = (key: keyof typeof customForm, value: string) => {
    setCustomForm((prev) => ({
      ...prev,
      [key]:
        key === 'rate' || key === 'quantity'
          ? sanitizeNumericInput(value)
          : value,
    }));
  };

  const removeAddon = (addonId: string) => {
    setInputs((prev) => {
      const addonSelections = { ...prev.addonSelections };
      const addonSelected = { ...prev.addonSelected };
      const addonRates = { ...prev.addonRates };
      delete addonSelections[addonId];
      delete addonSelected[addonId];
      delete addonRates[addonId];
      return {
        ...prev,
        customAddons: prev.customAddons.filter((item) => item.id !== addonId),
        addonSelections,
        addonSelected,
        addonRates,
      };
    });
  };

  const handleAddCustomAddon = () => {
    const { errors, valid } = validateCustomAddonForm(customForm);
    setCustomFormErrors(errors);
    if (!valid) return;

    const id = `custom_${customIdRef.current}`;
    customIdRef.current += 1;

    setInputs((prev) => ({
      ...prev,
      customAddons: [
        ...prev.customAddons,
        { id, name: customForm.name.trim(), unit: customForm.unit.trim() },
      ],
      addonSelected: { ...prev.addonSelected, [id]: true },
      addonRates: { ...prev.addonRates, [id]: sanitizeNumericInput(customForm.rate) },
      addonSelections: {
        ...prev.addonSelections,
        [id]: sanitizeNumericInput(customForm.quantity),
      },
    }));
    setCustomForm({ name: '', unit: '', rate: '', quantity: '' });
    setCustomFormErrors({});
    setShowCustomForm(false);
  };

  const resetForm = () => {
    setInputs(INITIAL_INPUTS);
    setCustomForm({ name: '', unit: '', rate: '', quantity: '' });
    setCustomFormErrors({});
    setShowCustomForm(false);
    setCustomConfigTouched(false);
    setCustomConfigErrors({});
  };

  const selectedAddons = useMemo(() => getSelectedAddons(model.addons), [model.addons]);
  const selectedList = useMemo(
    () => model.addons.filter((addon) => addon.selected),
    [model.addons]
  );

  const selectedFeatureLabels = useMemo(
    () =>
      (model.customBuildingFeatures ?? [])
        .map((value) => buildingFeatures.find((feature) => feature.value === value)?.label)
        .filter((label): label is string => Boolean(label)),
    [model.customBuildingFeatures]
  );

  const builtUpFormula = `${formatNumber(model.builtUpArea)} sq ft \u00d7 ${formatINR(
    model.ratePerSqft
  )}/sq ft = ${formatINR(model.estimateCost)}`;

  return (
    <div className="cc-page est-page est-app-ui">
      <EstimatorSubHeader
        title="Project Estimator"
        subtitle="Guided workflow that converts site dimensions and specification inputs into an indicative construction estimate with an indicative payment milestone schedule."
      />

      <ol className="est-steps" aria-label="Estimate steps">
        {STEPS.map((step) => {
          const done =
            (step.n === 1 && step1Done) ||
            (step.n === 2 && step2Done) ||
            (step.n >= 3 && step.n <= 5 && model.valid);
          return (
            <li
              key={step.n}
              className={`est-step-chip${step.n === 6 ? ' est-step-chip--print' : ''}${
                done ? ' est-step-chip--done' : ''
              }`}
            >
              <span className="est-step-num" aria-hidden="true">
                {done ? '\u2713' : step.n}
              </span>
              <span className="est-step-label">{step.label}</span>
            </li>
          );
        })}
      </ol>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 1 Â· PROJECT DETAILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="est-panel est-step-panel" aria-labelledby="est-step-1-title">
        <div className="est-step-heading">
          <span className="est-step-kicker">Step 1</span>
          <h2 id="est-step-1-title" className="est-panel-title">
            Project Details &amp; Site Dimensions
          </h2>
        </div>
        <p className="est-panel-desc">
          Basic project information and site dimensions in feet. Marked fields are required.
        </p>

        <div className="est-form-grid">
          <label className="admin-field est-field">
            <span className="admin-field-label">Project Name *</span>
            <input
              type="text"
              className={`admin-input${errors.projectName ? ' est-input-invalid' : ''}`}
              placeholder="e.g. Anand Residence"
              value={inputs.projectName}
              onChange={(e) => setField('projectName', e.target.value)}
            />
            {errors.projectName && <span className="est-error">{errors.projectName}</span>}
          </label>
          <label className="admin-field est-field">
            <span className="admin-field-label">Client Name *</span>
            <input
              type="text"
              className={`admin-input${errors.clientName ? ' est-input-invalid' : ''}`}
              placeholder="Client name"
              value={inputs.clientName}
              onChange={(e) => setField('clientName', e.target.value)}
            />
            {errors.clientName && <span className="est-error">{errors.clientName}</span>}
          </label>
          <label className="admin-field est-field">
            <span className="admin-field-label">Location *</span>
            <input
              type="text"
              className={`admin-input${errors.location ? ' est-input-invalid' : ''}`}
              placeholder="Project location"
              value={inputs.location}
              onChange={(e) => setField('location', e.target.value)}
            />
            {errors.location && <span className="est-error">{errors.location}</span>}
          </label>
          <label className="admin-field est-field">
            <span className="admin-field-label">Construction Type</span>
            <select
              className="admin-input est-select"
              value={inputs.projectType}
              onChange={(e) => setField('projectType', e.target.value)}
            >
              {PROJECT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="est-subgrid">
          <label className="admin-field est-field">
            <span className="admin-field-label">Site Length (ft) *</span>
            <input
              type="text"
              inputMode="decimal"
              className={`admin-input${errors.siteLength ? ' est-input-invalid' : ''}`}
              placeholder="e.g. 30"
              value={inputs.siteLength}
              onChange={(e) => setField('siteLength', e.target.value)}
            />
            {errors.siteLength && <span className="est-error">{errors.siteLength}</span>}
          </label>
          <label className="admin-field est-field">
            <span className="admin-field-label">Site Width (ft) *</span>
            <input
              type="text"
              inputMode="decimal"
              className={`admin-input${errors.siteWidth ? ' est-input-invalid' : ''}`}
              placeholder="e.g. 40"
              value={inputs.siteWidth}
              onChange={(e) => setField('siteWidth', e.target.value)}
            />
            {errors.siteWidth && <span className="est-error">{errors.siteWidth}</span>}
          </label>
        </div>

        <div className="est-derived">
          <div className="est-derived-cell">
            <span className="est-derived-label">Plot Area</span>
            <div className="est-derived-value">
              {model.valid ? `${formatNumber(model.plotArea)} sq ft` : EM_DASH}
            </div>
            <p className="est-derived-sub">
              Length &times; Width. A {formatNumber(30)}&times;{formatNumber(40)} ft plot
              yields {formatNumber(model.plotArea || 1200)} sq ft.
            </p>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 2 Â· BUILDING CONFIGURATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="est-panel est-step-panel" aria-labelledby="est-step-2-title">
        <div className="est-step-heading">
          <span className="est-step-kicker">Step 2</span>
          <h2 id="est-step-2-title" className="est-panel-title">
            Building Configuration
          </h2>
        </div>
        <p className="est-panel-desc">
          Choose how many floors the structure will have. Built-up area is derived from the
          plot area using configured floor-coverage factors &mdash; it is never assumed to
          equal the plot area.
        </p>

        <div className="est-bcf">
          <label className="est-bcf-field">
            <span className="est-bcf-label">Building Configuration</span>
            <select
              aria-label="Building Configuration"
              value={inputs.configurationId}
              onChange={(e) => setField('configurationId', e.target.value)}
            >
              {buildingConfigurations.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} &mdash; {option.description}
                </option>
              ))}
            </select>
          </label>
        </div>

        {config.isCustom && (
          <div className="est-custom-area">
            <label className="est-custom-area-field">
              <span className="est-custom-area-label">CUSTOM BUILT-UP AREA</span>
              <div className="est-custom-area-row">
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Custom Built-up Area in square feet"
                  className={`admin-input${customAreaInvalid ? ' est-input-invalid' : ''}`}
                  placeholder="Enter built-up area"
                  value={inputs.customBuiltUpArea}
                  onChange={(e) =>
                    setField('customBuiltUpArea', sanitizeNumericInput(e.target.value))
                  }
                />
                <span className="est-custom-area-unit">sq ft</span>
              </div>
              <span className="est-custom-area-help">
                This value will be used directly for the estimate.
              </span>
              {customAreaInvalid && (
                <span className="est-error">Enter a valid custom built-up area.</span>
              )}
            </label>

            <div className="est-custom-cfg" role="group" aria-label="Custom built-up area details">
              <label className="est-bcf-field">
                <span className="est-bcf-label">Number of Floors</span>
                <select
                  aria-label="Number of Floors"
                  className={customConfigTouched && customFloorsInvalid ? 'est-bcf-select-invalid' : ''}
                  value={inputs.customNumberOfFloors}
                  onChange={(e) => {
                    setCustomNumberOfFloors(e.target.value);
                    setCustomConfigTouched(true);
                  }}
                >
                  <option value="" disabled>
                    Select number of floors
                  </option>
                  {floorCountOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {customConfigTouched && customConfigErrors.numberOfFloors && (
                  <span className="est-error">{customConfigErrors.numberOfFloors}</span>
                )}
              </label>

              {inputs.customNumberOfFloors === 'other' && (
                <label className="est-bcf-field est-custom-other">
                  <span className="est-bcf-label">Other &mdash; Number of Floors</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Other number of floors"
                    className={`admin-input${
                      customConfigTouched && customOtherInvalid ? ' est-input-invalid' : ''
                    }`}
                    placeholder="Enter number of floors"
                    value={inputs.customOtherFloorCount}
                    onChange={(e) => setCustomOtherFloorCount(e.target.value)}
                  />
                  {customConfigTouched && customConfigErrors.otherFloorCount && (
                    <span className="est-error">{customConfigErrors.otherFloorCount}</span>
                  )}
                </label>
              )}

              <div className="est-custom-features">
                <span className="est-bcf-label">Building Features</span>
                <div className="est-custom-features-grid">
                  {buildingFeatures.map((feature) => {
                    const checked = (inputs.customBuildingFeatures ?? []).includes(
                      feature.value
                    );
                    return (
                      <label
                        key={feature.value}
                        className={`est-custom-feature${
                          checked ? ' est-custom-feature--checked' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="est-addon-checkbox"
                          checked={checked}
                          onChange={() => toggleBuildingFeature(feature.value)}
                        />
                        <span>{feature.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="est-builtup-summary">
          <div className="est-builtup-summary-head">Built-up Area</div>
          {config.isCustom ? (
            <div className="est-builtup-summary-body">
              <div className="est-builtup-total">
                {model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}
              </div>
              <ul className="est-per-floor">
                <li>
                  <span>Custom built-up area</span>
                  <span>
                    {model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}
                  </span>
                </li>
              </ul>
            </div>
          ) : model.builtUpConfigured ? (
            <div className="est-builtup-summary-body">
              <div className="est-builtup-total">
                {model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}
              </div>
              <ul className="est-per-floor">
                {model.perFloorBuiltUp.map((area, index) => (
                  <li key={floorLabels[index] ?? index}>
                    <span>{floorLabels[index]}</span>
                    <span>{formatNumber(area)} sq ft</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="est-builtup-summary-body est-builtup-summary-body--required">
              <span className="est-builtup-config-label">{config.label}</span>
              <div className="est-builtup-required">
                <strong>Configuration required</strong>
                <p>Floor coverage factors for {config.label} have not been configured yet.</p>
              </div>
              <p className="est-note est-builtup-required-note">
                This estimate can be completed once an administrator adds the floor coverage
                for {config.label} in the Control Center configuration.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 3 Â· CONSTRUCTION PACKAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="est-panel est-step-panel" aria-labelledby="est-step-3-title">
        <div className="est-step-heading">
          <span className="est-step-kicker">Step 3</span>
          <h2 id="est-step-3-title" className="est-panel-title">
            Construction Package
          </h2>
        </div>
        <p className="est-panel-desc">
          Select a specification package. The per-sq-ft rate drives the cost calculation.
        </p>

        <div className="est-options est-options--packages" role="radiogroup" aria-label="Construction package">
          {constructionPackages.map((option) => {
            const selected = inputs.packageId === option.id;
            return (
              <label
                key={option.id}
                className={`est-option est-option--package${selected ? ' est-option--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="est-package"
                  className="est-option-input"
                  checked={selected}
                  onChange={() => setField('packageId', option.id)}
                />
                <span className="est-option-title">{option.name}</span>
                <span className="est-option-price">
                  {formatINR(option.rate)}
                  <span className="est-option-price-unit">/sq ft</span>
                </span>
                <span className="est-option-sub">{option.description}</span>
              </label>
            );
          })}
        </div>

        <p className="est-note">{DEMO_RATES_NOTE}</p>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 4 Â· ESTIMATE SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="est-panel est-step-panel" aria-labelledby="est-step-4-title">
        <div className="est-step-heading">
          <span className="est-step-kicker">Step 4</span>
          <h2 id="est-step-4-title" className="est-panel-title">
            Estimate Summary
          </h2>
        </div>
        <p className="est-panel-desc">
          Derived cost built from built-up area and the selected package rate. Amounts are
          rounded to whole rupees.
        </p>

        <div className="est-result">
          <span className="est-result-label">{INDICATIVE_LABEL}</span>
          <div className="est-result-value">
            {model.valid ? formatINR(model.estimateCost) : EM_DASH}
          </div>
          <p className="est-result-formula">
            {model.valid
              ? builtUpFormula
              : 'Enter valid project and site details to compute the cost.'}
          </p>
        </div>

        {config.isCustom && (
          <div className="est-custom-summary">
            <div className="est-custom-summary-head">Building Configuration</div>
            <div className="est-custom-summary-body">
              <div className="est-custom-summary-row">
                <span>Configuration</span>
                <strong>Custom Built-up Area</strong>
              </div>
              <div className="est-custom-summary-row">
                <span>Total Built-up Area</span>
                <strong>
                  {model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}
                </strong>
              </div>
              <div className="est-custom-summary-row">
                <span>Number of Floors</span>
                <strong>{model.customFloorLabel ?? EM_DASH}</strong>
              </div>
              {selectedFeatureLabels.length > 0 && (
                <div className="est-custom-summary-features">
                  <span className="est-custom-summary-features-label">Building Features</span>
                  <ul className="est-custom-summary-features-list">
                    {selectedFeatureLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="est-addons">
          <div className="est-addons-header">
            <h3 className="est-addons-title">Optional Add-ons</h3>
            <p className="est-addons-subtitle">
              Select optional items to include in your estimate.
            </p>
          </div>

          <div className="est-addons-toolbar">
            <label className="est-addon-select">
              <span className="sr-only">Select an optional add-on</span>
              <select
                aria-label="Select an optional add-on"
                value=""
                onChange={(e) => {
                  handleSelectAddon(e.target.value);
                  e.target.blur();
                }}
              >
                <option value="" disabled>
                  Select an add-on
                </option>
                {model.addons
                  .filter((addon) => !addon.isCustom)
                  .map((addon) => (
                    <option
                      key={addon.id}
                      value={addon.id}
                      disabled={Boolean(inputs.addonSelected[addon.id])}
                    >
                      {addon.name}
                      {inputs.addonSelected[addon.id] ? ' (Added)' : ''}
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="button"
              className="btn btn-outline est-addons-add-btn"
              onClick={() => setShowCustomForm((prev) => !prev)}
              aria-expanded={showCustomForm}
            >
              <span aria-hidden="true">+</span> Custom Add-on
            </button>
          </div>

          {/* Custom add-on form */}
          {showCustomForm && (
            <div className="est-custom-form" role="group" aria-label="Add custom add-on">
              <div className="est-custom-form-grid">
                <label className="admin-field est-field">
                  <span className="admin-field-label">Item Name *</span>
                  <input
                    type="text"
                    className={`admin-input${customFormErrors.name ? ' est-input-invalid' : ''}`}
                    placeholder="e.g. Rainwater Harvesting"
                    value={customForm.name}
                    onChange={(e) => setCustomFormField('name', e.target.value)}
                  />
                  {customFormErrors.name && (
                    <span className="est-error">{customFormErrors.name}</span>
                  )}
                </label>
                <label className="admin-field est-field">
                  <span className="admin-field-label">Unit *</span>
                  <input
                    type="text"
                    className={`admin-input${customFormErrors.unit ? ' est-input-invalid' : ''}`}
                    placeholder="e.g. set"
                    value={customForm.unit}
                    onChange={(e) => setCustomFormField('unit', e.target.value)}
                  />
                  {customFormErrors.unit && (
                    <span className="est-error">{customFormErrors.unit}</span>
                  )}
                </label>
                <label className="admin-field est-field">
                  <span className="admin-field-label">Rate / Unit (\u20b9) *</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`admin-input${customFormErrors.rate ? ' est-input-invalid' : ''}`}
                    placeholder="e.g. 25000"
                    value={customForm.rate}
                    onChange={(e) => setCustomFormField('rate', e.target.value)}
                  />
                  {customFormErrors.rate && (
                    <span className="est-error">{customFormErrors.rate}</span>
                  )}
                </label>
                <label className="admin-field est-field">
                  <span className="admin-field-label">Quantity *</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`admin-input${customFormErrors.quantity ? ' est-input-invalid' : ''}`}
                    placeholder="Qty"
                    value={customForm.quantity}
                    onChange={(e) => setCustomFormField('quantity', e.target.value)}
                  />
                  {customFormErrors.quantity && (
                    <span className="est-error">{customFormErrors.quantity}</span>
                  )}
                </label>
              </div>
              <div className="est-custom-form-actions">
                <button type="button" className="btn btn-primary" onClick={handleAddCustomAddon}>
                  Add Add-on
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomForm({ name: '', unit: '', rate: '', quantity: '' });
                    setCustomFormErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Selected add-ons (only selected items) */}
          <div className="est-selected-addons" aria-live="polite">
            <h4 className="est-selected-addons-heading">Selected Items</h4>
            {selectedList.length > 0 ? (
              <ul className="est-selected-addon-list">
                {selectedList.map((addon) => {
                  const userRate = inputs.addonRates[addon.id] ?? '';
                  const rateInvalid = userRate.length > 0 && !parseAddonRate(userRate).valid;
                  const qtyInvalid = addon.quantityText.length > 0 && addon.quantity <= 0;
                  const validAmount = addon.amount !== null;
                  return (
                    <li key={addon.id} className="est-selected-addon-card">
                      <div className="est-selected-addon-head">
                        <div className="est-selected-addon-meta">
                          <span className="est-selected-addon-name">{addon.name}</span>
                          <span className="est-selected-addon-unit">Unit: {addon.unit}</span>
                        </div>
                        <button
                          type="button"
                          className="est-addon-remove"
                          aria-label={`Remove ${addon.name}`}
                          onClick={() => removeAddon(addon.id)}
                        >
                          Remove
                          <span aria-hidden="true"> &times;</span>
                        </button>
                      </div>
                      <div className="est-selected-addon-fields">
                        <label className="est-selected-addon-field">
                          <span className="est-selected-addon-label">Rate / Unit (\u20b9)</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label={`Rate for ${addon.name}`}
                            className={`admin-input${rateInvalid || userRate.length === 0 ? ' est-input-invalid' : ''}`}
                            placeholder="Enter rate"
                            value={userRate}
                            onChange={(e) => setAddonRate(addon.id, e.target.value)}
                          />
                          {rateInvalid && <span className="est-error">Rate &gt; 0 required.</span>}
                        </label>
                        <label className="est-selected-addon-field">
                          <span className="est-selected-addon-label">Quantity</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label={`Quantity for ${addon.name}`}
                            className={`admin-input${qtyInvalid ? ' est-input-invalid' : ''}`}
                            placeholder="Qty"
                            value={inputs.addonSelections[addon.id] ?? ''}
                            onChange={(e) => setAddonQuantity(addon.id, e.target.value)}
                          />
                          {qtyInvalid && <span className="est-error">Quantity &gt; 0.</span>}
                        </label>
                        <div className="est-selected-addon-amount">
                          <span className="est-selected-addon-label">Amount</span>
                          <strong>{validAmount ? formatINR(addon.amount as number) : EM_DASH}</strong>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="est-empty">No optional add-ons selected.</p>
            )}
          </div>

          <p className="est-note">
            Add-on rates are entered for this estimate and do not represent verified
            commercial rates. An add-on contributes to the estimate only when it is selected
            with a valid rate and quantity.
          </p>
        </div>

        {/* Selected add-ons running total */}
        {selectedAddons.length > 0 && (
          <div className="est-addon-total">
            <span>Selected Add-ons Total</span>
            <strong>{formatINR(model.addonTotal)}</strong>
          </div>
        )}

        {/* Estimate totals */}
        <div className="est-totals est-totals--summary">
          <div className="est-totals-row">
            <span>Base Construction Cost</span>
            <span className="est-totals-value">
              {model.valid ? formatINR(model.estimateCost) : EM_DASH}
            </span>
          </div>
          <div className="est-totals-row">
            <span>Selected Add-ons</span>
            <span className="est-totals-value">
              {model.valid ? formatINR(model.addonTotal) : EM_DASH}
            </span>
          </div>
          <div className="est-totals-row est-totals-row--total">
            <span>Estimated Project Total</span>
            <span className="est-totals-value est-totals-value--accent">
              {model.valid ? formatINR(model.projectTotal) : EM_DASH}
            </span>
          </div>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 5 Â· SCOPE AND PAYMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="est-panel est-step-panel" aria-labelledby="est-step-5-title">
        <div className="est-step-heading">
          <span className="est-step-kicker">Step 5</span>
          <h2 id="est-step-5-title" className="est-panel-title">
            Scope of Works &amp; Payment Milestones
          </h2>
        </div>

        <div className="est-milestone-block">
          <div className="est-addon-head">
            <span className="est-panel-title">Payment Milestones</span>
            <span className="est-addon-note">Sum = 100% of the estimate</span>
          </div>

          <div className="est-milestone-estimate">
            <span>Project Estimate</span>
            <strong>{model.valid ? formatINR(model.projectTotal) : EM_DASH}</strong>
          </div>

          {!milestoneScheduleIsValid(model.milestones) && (
            <p className="est-note est-warning">Milestone percentages must total 100%.</p>
          )}

          <div className="est-table-scroll">
            <table className="est-table est-table--milestones">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>%</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {model.milestones.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="est-milestone-name">{row.name}</span>
                      <span className="est-milestone-desc">{row.description}</span>
                    </td>
                    <td className="est-table-qty">{formatNumber(row.percent)}%</td>
                    <td className="est-table-amount">
                      {model.valid ? formatINR(row.amount) : EM_DASH}
                    </td>
                    <td>
                      <span className="est-status-chip">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="est-milestone-total">
            <span>
              Total Payment Schedule
              <small>{formatNumber(milestoneTotalPercent(model.milestones))}%</small>
            </span>
            <strong>{model.valid ? formatINR(model.milestoneTotalPaid) : EM_DASH}</strong>
          </div>
        </div>

        <p className="est-note">{PAYMENT_PRINCIPLE}</p>

        <details className="est-scope" open>
          <summary>Scope of Works &mdash; Included</summary>
          <div className="est-scope-grid">
            {inclusions.map((section) => (
              <div key={section.title} className="est-scope-section">
                <h3 className="est-scope-title">{section.title}</h3>
                <ul className="est-scope-items">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <details className="est-scope">
          <summary>Scope of Works &mdash; Excluded</summary>
          <div className="est-scope-grid">
            {exclusions.map((section) => (
              <div key={section.title} className="est-scope-section">
                <h3 className="est-scope-title">{section.title}</h3>
                <ul className="est-scope-items">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="est-note">{SCOPE_CHANGE_NOTE}</p>
        </details>

        <p className="est-note">{DISCLAIMER}</p>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ STEP 6 Â· PRINT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="est-panel est-step-panel" aria-labelledby="est-step-6-title">
        <div className="est-step-heading">
          <span className="est-step-kicker">Step 6</span>
          <h2 id="est-step-6-title" className="est-panel-title">
            Review &amp; Print Estimate
          </h2>
        </div>
        <p className="est-panel-desc">
          Print or save this estimate as a PDF using your browser&rsquo;s print dialog. A
          print-ready summary sheet is generated in A4.
        </p>

        <div className="est-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setCustomConfigTouched(true);
              if (validateCustomConfig()) {
                window.print();
              }
            }}
          >
            Print Estimate
          </button>
          <button type="button" className="btn btn-outline" onClick={resetForm}>
            Reset Form
          </button>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ PRINT DOCUMENT (hidden on screen; shown in @media print) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="est-print-sheet" aria-hidden="true">
        {/* Branded header */}
        <header className="est-pr-head">
          <div className="est-pr-head-logo">
            <img
              src="/assests/brand/vijaya-siri-logo-header-transparent.svg"
              alt="Vijaya Siri Projects"
            />
          </div>
          <div className="est-pr-head-main">
            <div className="est-pr-eyebrow">Vijaya Siri Projects</div>
            <h1 className="est-pr-title">Construction Cost Estimate</h1>
            <div className="est-pr-subtitle">{INDICATIVE_LABEL}</div>
          </div>
          <div className="est-pr-head-meta">
            <div className="est-pr-meta-chip">
              <span className="est-pr-label">Estimate Reference</span>
              <span className="est-pr-value">{model.reference}</span>
            </div>
            <div className="est-pr-meta-chip">
              <span className="est-pr-label">Estimate Date</span>
              <span className="est-pr-value">{formatDateLabel(model.generatedOn)}</span>
            </div>
          </div>
        </header>

        <div className="est-pr-band">Indicative Estimate</div>

        {/* Project Details */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Project Details</h2>
          <div className="est-pr-grid est-pr-grid--2col">
            <div className="est-pr-kv">
              <span>Project Name</span>
              <strong>{model.projectName.trim() || EM_DASH}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Client Name</span>
              <strong>{model.clientName.trim() || EM_DASH}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Location</span>
              <strong>{model.location.trim() || EM_DASH}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Construction Type</span>
              <strong>
                {PROJECT_TYPES.find((t) => t.value === model.projectType)?.label ?? EM_DASH}
              </strong>
            </div>
          </div>
        </section>

        {/* Site & Area */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Site &amp; Area Details</h2>
          <div className="est-pr-grid est-pr-grid--3col">
            <div className="est-pr-kv">
              <span>Plot Length</span>
              <strong>
                {model.valid ? `${formatNumber(Number(inputs.siteLength))} ft` : EM_DASH}
              </strong>
            </div>
            <div className="est-pr-kv">
              <span>Plot Width</span>
              <strong>
                {model.valid ? `${formatNumber(Number(inputs.siteWidth))} ft` : EM_DASH}
              </strong>
            </div>
            <div className="est-pr-kv">
              <span>Plot Area</span>
              <strong>{model.valid ? `${formatNumber(model.plotArea)} sq ft` : EM_DASH}</strong>
            </div>
          </div>
          <p className="est-pr-calc">
            Plot area:{' '}
            {model.valid
              ? `${formatNumber(Number(inputs.siteLength))} ft \u00d7 ${formatNumber(
                  Number(inputs.siteWidth)
                )} ft = ${formatNumber(model.plotArea)} sq ft`
              : 'Plot area calculation appears once valid site dimensions are entered.'}
          </p>

          <h3 className="est-pr-subhead">
            Built-up Area{model.valid ? ` \u00b7 ${model.configuration.label}` : ''}
          </h3>
          {model.configuration?.isCustom ? (
            <table className="est-pr-table">
              <thead>
                <tr>
                  <th>Floor</th>
                  <th>Built-up Area</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Custom built-up area</td>
                  <td>{model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}</td>
                </tr>
                <tr className="est-pr-total-row">
                  <td>Total Built-up Area</td>
                  <td>{model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}</td>
                </tr>
              </tbody>
            </table>
          ) : model.builtUpConfigured ? (
            <table className="est-pr-table">
              <thead>
                <tr>
                  <th>Floor</th>
                  <th>Built-up Area</th>
                </tr>
              </thead>
              <tbody>
                {model.valid
                  ? model.perFloorBuiltUp.map((area, index) => (
                      <tr key={floorLabels[index] ?? index}>
                        <td>{floorLabels[index]}</td>
                        <td>{formatNumber(area)} sq ft</td>
                      </tr>
                    ))
                  : floorLabels.map((label) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td>{EM_DASH}</td>
                      </tr>
                    ))}
                <tr className="est-pr-total-row">
                  <td>Total Built-up Area</td>
                  <td>{model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="est-pr-note">
              Configuration required: floor coverage factors for{' '}
              {model.configuration.label} have not been configured yet.
            </p>
          )}
        </section>

        {/* Configuration & Package */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Construction Configuration &amp; Package</h2>
          <div className="est-pr-grid est-pr-grid--3col">
            <div className="est-pr-kv">
              <span>Configuration</span>
              <strong>{model.configuration.label}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Package</span>
              <strong>{model.selectedPackage.name}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Rate</span>
              <strong>{formatINR(model.ratePerSqft)}/sq ft</strong>
            </div>
          </div>

          {model.configuration?.isCustom && (
            <div className="est-pr-custom-info">
              <div className="est-pr-kv-row">
                <div className="est-pr-kv">
                  <span>Total Built-up Area</span>
                  <strong>
                    {model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}
                  </strong>
                </div>
                <div className="est-pr-kv">
                  <span>Number of Floors</span>
                  <strong>{model.customFloorLabel ?? EM_DASH}</strong>
                </div>
              </div>
              {selectedFeatureLabels.length > 0 && (
                <div className="est-pr-features">
                  <strong className="est-pr-features-title">Building Features</strong>
                  <ul className="est-pr-features-list">
                    {selectedFeatureLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Estimated Construction Cost */}
        <section className="est-pr-section">
          <div className="est-pr-cost">
            <div className="est-pr-cost-head">Estimated Construction Cost</div>
            <div className="est-pr-cost-body">
              <div className="est-pr-cost-line">
                <span>Built-up Area</span>
                <span>{model.valid ? `${formatNumber(model.builtUpArea)} sq ft` : EM_DASH}</span>
              </div>
              <div className="est-pr-cost-line">
                <span>Package</span>
                <span>{model.selectedPackage.name}</span>
              </div>
              <div className="est-pr-cost-line">
                <span>Rate</span>
                <span>{formatINR(model.ratePerSqft)}/sq ft</span>
              </div>
              <div className="est-pr-formula">
                {model.valid
                  ? `${formatNumber(model.builtUpArea)} sq ft \u00d7 ${formatINR(
                      model.ratePerSqft
                    )}/sq ft`
                  : 'Enter valid details in the estimator to compute the cost.'}
              </div>
              <div className="est-pr-total-line">
                <span className="est-pr-total-label">Total Indicative Estimate</span>
                <span className="est-pr-total-value">
                  {model.valid ? formatINR(model.estimateCost) : EM_DASH}
                </span>
              </div>
            </div>
          </div>
          <p className="est-pr-indicative">
            <strong>Indicative Estimate.</strong> This is an indicative estimate based on the
            selected inputs. Final pricing will depend on the approved drawings, BOQ,
            specifications, site conditions, inclusions/exclusions and final construction
            agreement.
          </p>
        </section>

        {/* Milestone Payment Schedule */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Milestone Payment Schedule</h2>
          <table className="est-pr-table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>%</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {model.milestones.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{formatNumber(row.percent)}%</td>
                  <td>{model.valid ? formatINR(row.amount) : EM_DASH}</td>
                  <td className="est-pr-status">{row.status}</td>
                </tr>
              ))}
              <tr className="est-pr-total-row">
                <td>Total</td>
                <td>100%</td>
                <td>{model.valid ? formatINR(model.milestoneTotalPaid) : EM_DASH}</td>
                <td />
              </tr>
            </tbody>
          </table>
          <p className="est-pr-note">
            Milestone percentages total exactly 100% and milestone amounts total exactly the
            estimated cost.
          </p>
        </section>

        {/* Milestone-Based Payments */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Milestone-Based Payments</h2>
          <div className="est-pr-flow">
            <div className="est-pr-flow-step">Work Completed</div>
            <div className="est-pr-flow-arrow">{'\u2192'}</div>
            <div className="est-pr-flow-step">Verified</div>
            <div className="est-pr-flow-arrow">{'\u2192'}</div>
            <div className="est-pr-flow-step">Payment</div>
          </div>
          <p className="est-pr-note">
            The agreed construction milestone is completed. The completed work is inspected
            and documented. The corresponding milestone amount becomes payable according to
            the applicable agreement. Payments are released only after each work item is
            completed and verified on site.
          </p>
        </section>

        {/* Included in Estimate */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Included in Estimate</h2>
          <div className="est-pr-scope-grid">
            {inclusions.map((group) => (
              <div key={group.title} className="est-pr-category">
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Excluded from Estimate */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Excluded from Estimate</h2>
          <div className="est-pr-scope-grid">
            {exclusions.map((group) => (
              <div key={group.title} className="est-pr-category">
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="est-pr-note">{SCOPE_CHANGE_NOTE}</p>
        </section>

        {/* Optional Add-ons */}
        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Optional Add-ons</h2>
          {selectedAddons.length > 0 ? (
            <>
              <table className="est-pr-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAddons.map((addon) => (
                    <tr key={addon.id}>
                      <td>{addon.name}</td>
                      <td>{formatNumber(addon.quantity)}</td>
                      <td>{addon.unit}</td>
                      <td>{formatINR(addon.rate as number)}</td>
                      <td className="est-pr-amt">{formatINR(addon.amount as number)}</td>
                    </tr>
                  ))}
                  <tr className="est-pr-total-row">
                    <td colSpan={4}>Selected Add-ons Total</td>
                    <td className="est-pr-amt">{formatINR(model.addonTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="est-pr-cost est-pr-cost--summary">
                <div className="est-pr-cost-body">
                  <div className="est-pr-cost-line">
                    <span>Base Construction Cost</span>
                    <span>{model.valid ? formatINR(model.estimateCost) : EM_DASH}</span>
                  </div>
                  <div className="est-pr-cost-line">
                    <span>Selected Add-ons</span>
                    <span>{model.valid ? formatINR(model.addonTotal) : EM_DASH}</span>
                  </div>
                  <div className="est-pr-total-line">
                    <span className="est-pr-total-label">Estimated Project Total</span>
                    <span className="est-pr-total-value">
                      {model.valid ? formatINR(model.projectTotal) : EM_DASH}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="est-pr-note">No optional add-ons selected.</p>
              <div className="est-pr-cost est-pr-cost--summary">
                <div className="est-pr-cost-body">
                  <div className="est-pr-cost-line">
                    <span>Base Construction Cost</span>
                    <span>{model.valid ? formatINR(model.estimateCost) : EM_DASH}</span>
                  </div>
                  <div className="est-pr-cost-line">
                    <span>Selected Add-ons</span>
                    <span>{model.valid ? formatINR(model.addonTotal) : EM_DASH}</span>
                  </div>
                  <div className="est-pr-total-line">
                    <span className="est-pr-total-label">Estimated Project Total</span>
                    <span className="est-pr-total-value">
                      {model.valid ? formatINR(model.projectTotal) : EM_DASH}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Important Disclaimer */}
        <section className="est-pr-section">
          <div className="est-pr-disclaimer">
            <h2 className="est-pr-disclaimer-title">Important Disclaimer</h2>
            <p>
              This is an indicative estimate and is not a final quotation or construction
              contract. Final pricing will be determined from the approved drawings, BOQ,
              specifications, site conditions, inclusions/exclusions and construction
              agreement.
            </p>
          </div>
        </section>

        <div className="est-pr-endline">
          Prepared on this device &middot; Generated {formatDateLabel(model.generatedOn)}
          &middot; Reference {model.reference} &middot; No commercial commitment.
        </div>
      </div>

      {/* Repeating per-page footer (print only) */}
      <div className="est-print-footer" aria-hidden="true">
        <span className="est-prf-brand">VIJAYA SIRI PROJECTS</span>
        <span className="est-prf-sep">|</span>
        <span>Construction Cost Estimate</span>
        <span className="est-prf-sep">|</span>
        <span>Ref: {model.reference}</span>
        <span className="est-prf-sep">|</span>
        <span>Generated: {formatDateLabel(model.generatedOn)}</span>
      </div>
    </div>
  );
}
