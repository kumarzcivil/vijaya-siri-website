import { useState } from 'react';
import { CIVIL_WORKS, findCivilWork } from '../../estimator/calculations';
import { UNITS, formatNumber } from '../../estimator/units';
import EstimatorSubHeader from './EstimatorSubHeader';
import './AdminShell.css';
import './AdminPage.css';
import './EstimatorModule.css';

const EM_DASH = '\u2014';
const NOT_CONFIGURED = 'Not configured';

function toNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const MATERIAL_ROWS = ['Cement', 'Sand', 'Aggregate / Metal', 'Steel', 'Bricks / Blocks'];

export default function EstimatorMaterialSection() {
  const [workKey, setWorkKey] = useState<string>(CIVIL_WORKS[0].key);
  const [quantity, setQuantity] = useState('');

  const work = findCivilWork(workKey) ?? CIVIL_WORKS[0];
  const measured = toNumber(quantity);
  const unitMeta = UNITS[work.unit];

  const handleWorkChange = (key: string) => {
    setWorkKey(key);
    setQuantity('');
  };

  return (
    <div className="cc-page est-page">
      <EstimatorSubHeader
        title="Material Calculator"
        subtitle="Estimate material quantities for selected construction work."
      />

      <div className="est-panel">
        <h2 className="est-panel-title">Material Estimate</h2>
        <p className="est-panel-desc">
          Select a work type and enter the measured quantity. Material quantities are derived
          from configured consumption values.
        </p>

        <div className="est-form-grid">
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
          <label className="admin-field est-field">
            <span className="admin-field-label">Measured Quantity ({unitMeta.shortLabel})</span>
            <input
              type="number"
              className="admin-input"
              min="0"
              step="any"
              placeholder={`Quantity in ${unitMeta.label.toLowerCase()}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
        </div>

        <div className="est-derived">
          <span className="est-derived-label">Measured Quantity</span>
          <div className="est-derived-value">
            {measured !== null ? `${formatNumber(measured)} ${unitMeta.shortLabel}` : EM_DASH}
          </div>
        </div>

        <div className="est-table-scroll">
          <table className="est-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MATERIAL_ROWS.map((material) => (
                <tr key={material}>
                  <td>{material}</td>
                  <td className="est-table-empty">{EM_DASH}</td>
                  <td className="est-table-qty est-table-empty">{EM_DASH}</td>
                  <td>
                    <span className="est-rate-chip">{NOT_CONFIGURED}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="est-note">
          Material quantities are not invented. Consumption values will be connected with the
          Pricing &amp; Rates configuration.
        </p>
      </div>
    </div>
  );
}