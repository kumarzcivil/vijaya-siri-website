import { useMemo, useState } from 'react';
import {
  CIVIL_WORKS,
  calculateCivilQuantity,
  findCivilWork,
} from '../../estimator/calculations';
import {
  DEFAULT_PRICING,
  calculateAmount,
  getConfiguredRate,
} from '../../estimator/pricing';
import {
  UNITS,
  cumToCft,
  formatNumber,
  sqmToSqft,
} from '../../estimator/units';
import EstimatorSubHeader from './EstimatorSubHeader';
import './AdminShell.css';
import './AdminPage.css';
import './EstimatorModule.css';

const EM_DASH = '\u2014';
const RATE_NOT_CONFIGURED = 'Rate not configured';

function toNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function EstimatorCivilWorksSection() {
  const [workKey, setWorkKey] = useState<string>(CIVIL_WORKS[0].key);
  const [values, setValues] = useState<Record<string, string>>({});

  const work = findCivilWork(workKey) ?? CIVIL_WORKS[0];

  const unitMeta = UNITS[work.unit];

  const measurements = useMemo(
    () =>
      work.inputs.map((input) => ({
        input,
        number: toNumber(values[input.key] ?? ''),
      })),
    [work, values]
  );

  const allMeasured = measurements.every((m) => m.number !== null);
  const quantity =
    allMeasured && measurements.length > 0
      ? calculateCivilQuantity(
          work,
          Object.fromEntries(
            measurements.map((m) => [m.input.key, m.number as number])
          )
        )
      : null;

  const rate = getConfiguredRate(DEFAULT_PRICING, work.key, work.unit);
  const amount = quantity !== null && rate !== null ? calculateAmount(quantity, rate) : null;

  const handleWorkChange = (key: string) => {
    setWorkKey(key);
    setValues({});
  };

  const setMeasurement = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="cc-page est-page">
      <EstimatorSubHeader
        title="Civil Works Calculator"
        subtitle="Calculate quantities and costs for common civil works."
      />

      <div className="est-panel">
        <h2 className="est-panel-title">Work Type</h2>
        <p className="est-panel-desc">
          Select a work type and enter its dimensions in metres to calculate the quantity.
        </p>

        <label className="admin-field est-field">
          <span className="admin-field-label">Civil Work</span>
          <select
            className="admin-input est-select"
            value={work.key}
            onChange={(e) => handleWorkChange(e.target.value)}
          >
            {CIVIL_WORKS.map((def) => (
              <option key={def.key} value={def.key}>
                {def.label}
              </option>
            ))}
          </select>
        </label>

        <div className="est-form-grid--3">
          {work.inputs.map((input) => (
            <label className="admin-field est-field" key={input.key}>
              <span className="admin-field-label">
                {input.label} ({input.symbol}, m)
              </span>
              <input
                type="number"
                className="admin-input"
                min="0"
                step="any"
                placeholder={`${input.symbol} in metres`}
                value={values[input.key] ?? ''}
                onChange={(e) => setMeasurement(input.key, e.target.value)}
                aria-label={`${input.label} in metres`}
              />
            </label>
          ))}
        </div>

        <div className="est-result">
          <span className="est-result-label">Calculated Quantity</span>
          <div className="est-result-value">
            {quantity !== null ? `${formatNumber(quantity)} ${unitMeta.shortLabel}` : EM_DASH}
          </div>
          <p className="est-result-formula">
            {work.formulaLabel} ({unitMeta.label})
            {quantity !== null && work.unit === 'cum' && (
              <>
                {' '}
                &middot; {formatNumber(cumToCft(quantity))} cu.ft
              </>
            )}
            {quantity !== null && work.unit === 'sqm' && (
              <>
                {' '}
                &middot; {formatNumber(sqmToSqft(quantity))} sq.ft
              </>
            )}
          </p>
        </div>

        <div className="est-derived">
          <span className="est-derived-label">Rate &amp; Amount</span>
          <div className="est-derived-value">
            {rate !== null && Number.isFinite(rate.amountPerUnit)
              ? `\u20b9 ${formatNumber(rate.amountPerUnit)} / ${unitMeta.shortLabel}`
              : RATE_NOT_CONFIGURED}
          </div>
          <p className="est-derived-sub">
            Amount: {amount !== null ? `\u20b9 ${formatNumber(amount)}` : EM_DASH}. No amount is
            shown unless a configured rate exists.
          </p>
        </div>
      </div>

      <p className="est-note est-note--center">
        Work category: {work.category}. Rates come from the Pricing &amp; Rates system and are
        never hardcoded into the calculator.
      </p>
    </div>
  );
}