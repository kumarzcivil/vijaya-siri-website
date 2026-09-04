import { useMemo, useState } from 'react';
import { areaOf, perimeterOf, volumeOf } from '../../estimator/calculations';
import { UNITS, cumToCft, formatNumber, sqmToSqft } from '../../estimator/units';
import EstimatorSubHeader from './EstimatorSubHeader';
import './AdminShell.css';
import './AdminPage.css';
import './EstimatorModule.css';

type QuantityMode = 'area' | 'volume' | 'perimeter';

interface ModeDef {
  key: QuantityMode;
  label: string;
  inputs: Array<{ key: string; label: string; symbol: string }>;
  unit: 'sqm' | 'cum' | 'rm';
  formulaLabel: string;
  calculate: (values: Record<string, number>) => number;
}

const MODES: ModeDef[] = [
  {
    key: 'area',
    label: 'Area',
    inputs: [
      { key: 'length', label: 'Length', symbol: 'L' },
      { key: 'width', label: 'Width', symbol: 'W' },
    ],
    unit: 'sqm',
    formulaLabel: 'Length \u00d7 Width = Area',
    calculate: (v) => areaOf(v.length, v.width),
  },
  {
    key: 'volume',
    label: 'Volume',
    inputs: [
      { key: 'length', label: 'Length', symbol: 'L' },
      { key: 'width', label: 'Width', symbol: 'W' },
      { key: 'height', label: 'Height', symbol: 'H' },
    ],
    unit: 'cum',
    formulaLabel: 'Length \u00d7 Width \u00d7 Height = Volume',
    calculate: (v) => volumeOf(v.length, v.width, v.height),
  },
  {
    key: 'perimeter',
    label: 'Perimeter',
    inputs: [
      { key: 'length', label: 'Length', symbol: 'L' },
      { key: 'width', label: 'Width', symbol: 'W' },
    ],
    unit: 'rm',
    formulaLabel: '2 \u00d7 (Length + Width) = Perimeter',
    calculate: (v) => perimeterOf(v.length, v.width),
  },
];

function toNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function EstimatorQuantitySection() {
  const [modeKey, setModeKey] = useState<QuantityMode>('area');
  const [values, setValues] = useState<Record<string, string>>({});

  const mode = MODES.find((m) => m.key === modeKey) ?? MODES[0];

  const measurements = useMemo(
    () =>
      mode.inputs.map((input) => ({
        input,
        number: toNumber(values[input.key] ?? ''),
      })),
    [mode, values]
  );

  const allMeasured = measurements.every((m) => m.number !== null);
  const quantity =
    allMeasured && measurements.length > 0
      ? mode.calculate(
          Object.fromEntries(
            measurements.map((m) => [m.input.key, m.number as number])
          )
        )
      : null;

  const handleModeChange = (key: QuantityMode) => {
    setModeKey(key);
    setValues({});
  };

  const setMeasurement = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="cc-page est-page">
      <EstimatorSubHeader
        title="Quantity Calculator"
        subtitle="Calculate construction quantities from dimensions and measurements."
      />

      <div className="est-panel">
        <h2 className="est-panel-title">Quantity Calculation</h2>
        <p className="est-panel-desc">
          Choose a calculation type, enter dimensions in metres, and read the derived quantity.
        </p>

        <label className="admin-field est-field">
          <span className="admin-field-label">Calculation</span>
          <select
            className="admin-input est-select"
            value={mode.key}
            onChange={(e) => handleModeChange(e.target.value as QuantityMode)}
          >
            {MODES.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <div className="est-form-grid--3">
          {mode.inputs.map((input) => (
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
            {quantity !== null
              ? `${formatNumber(quantity)} ${UNITS[mode.unit].shortLabel}`
              : '\u2014'}
          </div>
          <p className="est-result-formula">
            {mode.formulaLabel} ({UNITS[mode.unit].label})
            {quantity !== null && mode.unit === 'cum' && (
              <>
                {' '}
                &middot; {formatNumber(cumToCft(quantity))} cu.ft
              </>
            )}
            {quantity !== null && mode.unit === 'sqm' && (
              <>
                {' '}
                &middot; {formatNumber(sqmToSqft(quantity))} sq.ft
              </>
            )}
          </p>
        </div>
      </div>

      <p className="est-note est-note--center">
        The quantity calculator computes measurements only. It does not convert quantities into
        amounts.
      </p>
    </div>
  );
}