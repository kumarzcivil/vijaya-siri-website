import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import { getSmallWorksTemplateById } from '../../data/smallWorksTemplates';
import type { SmallWorksTemplate } from '../../data/smallWorksTemplates';
import {
  boqItemAmount,
  boqSubtotal,
  EM_DASH,
  estimateTotal,
  formatDateLabel,
  paymentErrorMessage,
  resolvePaymentRows,
  seedSmallWorksEstimate,
  SMALL_WORKS_CATEGORIES,
  SMALL_WORKS_UNITS,
  uid,
} from '../../estimator/smallWorks';
import { formatINR, formatNumber } from '../../estimator/units';
import type {
  BOQItem,
  EstimateTerm,
  PaymentConfig,
  PaymentStage,
  ScopeOfWork,
  SmallWorksEstimate,
  SmallWorksUnit,
} from '../../estimator/smallWorks';
import EstimatorSubHeader from './EstimatorSubHeader';
import './AdminShell.css';
import './ControlCenterModules.css';
import './EstimatorModule.css';
import './SmallWorksEstimator.css';

const MODE_LABELS: Record<string, string> = {
  percentage: 'Milestone Based (Percent)',
  'advance-balance': 'Advance + Balance',
  custom: 'Custom Schedule',
};

interface BoqDraft {
  description: string;
  category: string;
  unit: SmallWorksUnit;
  quantity: string;
  rate: string;
  specification: string;
  remarks: string;
}

interface StageDraft {
  name: string;
  description: string;
  entryType: 'percent' | 'amount';
  value: string;
}

interface TermDraft {
  title: string;
  description: string;
}

function freshBoqDraft(): BoqDraft {
  return {
    description: '',
    category: '',
    unit: 'Each',
    quantity: '0',
    rate: '0',
    specification: '',
    remarks: '',
  };
}

function freshStageDraft(): StageDraft {
  return {
    name: '',
    description: '',
    entryType: 'percent',
    value: '',
  };
}

function freshTermDraft(): TermDraft {
  return { title: '', description: '' };
}

function toPositiveNumber(value: string): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export default function SmallWorksEstimatorSection() {
  const { templateId } = useParams<{ templateId?: string }>();

  const [estimate, setEstimate] = useState<SmallWorksEstimate>(() => {
    const template = templateId ? getSmallWorksTemplateById(templateId) : null;
    return seedFromTemplate(template);
  });

  const [editingBoqId, setEditingBoqId] = useState<string | null>(null);
  const [addingBoq, setAddingBoq] = useState(false);
  const [boqDraft, setBoqDraft] = useState<BoqDraft>(freshBoqDraft());

  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [addingStage, setAddingStage] = useState(false);
  const [stageDraft, setStageDraft] = useState<StageDraft>(freshStageDraft());

  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [addingTerm, setAddingTerm] = useState(false);
  const [termDraft, setTermDraft] = useState<TermDraft>(freshTermDraft());

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<'boq' | 'stage' | 'term' | null>(null);

  const total = estimateTotal(estimate);
  const paymentRows = useMemo(
    () => resolvePaymentRows(total, estimate.payment),
    [total, estimate.payment]
  );
  const paymentError = paymentErrorMessage(estimate.payment);

  function updateEstimate(patch: Partial<SmallWorksEstimate>) {
    setEstimate((prev) => ({ ...prev, ...patch }));
  }

  function updateScope(patch: Partial<ScopeOfWork>) {
    updateEstimate({ scope: { ...estimate.scope, ...patch } });
  }

  function updatePayment(patch: Partial<PaymentConfig>) {
    updateEstimate({ payment: { ...estimate.payment, ...patch } });
  }

  // ---------- BOQ ----------
  function beginAddBoq() {
    setBoqDraft(freshBoqDraft());
    setAddingBoq(true);
    setEditingBoqId(null);
  }

  function beginEditBoq(item: BOQItem) {
    setBoqDraft({
      description: item.description,
      category: item.category,
      unit: item.unit,
      quantity: `${item.quantity}`,
      rate: `${item.rate}`,
      specification: item.specification,
      remarks: item.remarks,
    });
    setEditingBoqId(item.id);
    setAddingBoq(false);
  }

  function saveBoq() {
    const qty = toPositiveNumber(boqDraft.quantity);
    const rate = toPositiveNumber(boqDraft.rate);
    if (!boqDraft.description.trim()) return;
    if (qty === null || qty < 0 || rate === null || rate < 0) return;

    const item: BOQItem = {
      id: editingBoqId ?? uid(),
      description: boqDraft.description.trim(),
      category: boqDraft.category,
      unit: boqDraft.unit,
      quantity: qty,
      rate,
      specification: boqDraft.specification.trim(),
      remarks: boqDraft.remarks.trim(),
    };

    if (editingBoqId) {
      updateEstimate({
        boq: estimate.boq.map((it) => (it.id === editingBoqId ? item : it)),
      });
    } else {
      updateEstimate({ boq: [...estimate.boq, item] });
    }
    cancelBoq();
  }

  function cancelBoq() {
    setEditingBoqId(null);
    setAddingBoq(false);
  }

  function askDeleteBoq(id: string) {
    setConfirmKind('boq');
    setConfirmDeleteId(id);
  }

  function confirmDelete() {
    if (!confirmKind || !confirmDeleteId) return;
    if (confirmKind === 'boq') {
      updateEstimate({ boq: estimate.boq.filter((it) => it.id !== confirmDeleteId) });
    } else if (confirmKind === 'stage') {
      updatePayment({ stages: estimate.payment.stages.filter((s) => s.id !== confirmDeleteId) });
      if (editingStageId === confirmDeleteId) {
        setEditingStageId(null);
        setAddingStage(false);
      }
    } else if (confirmKind === 'term') {
      updateEstimate({ terms: estimate.terms.filter((t) => t.id !== confirmDeleteId) });
      if (editingTermId === confirmDeleteId) {
        setEditingTermId(null);
        setAddingTerm(false);
      }
    }
    setConfirmDeleteId(null);
    setConfirmKind(null);
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
    setConfirmKind(null);
  }

  function moveBoq(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= estimate.boq.length) return;
    const next = [...estimate.boq];
    [next[index], next[target]] = [next[target], next[index]];
    updateEstimate({ boq: next });
  }

  // ---------- Payment ----------
  function beginAddStage() {
    setStageDraft(freshStageDraft());
    setAddingStage(true);
    setEditingStageId(null);
  }

  function beginEditStage(stage: PaymentStage) {
    setStageDraft({
      name: stage.name,
      description: stage.description,
      entryType: stage.entry.type,
      value: `${stage.entry.value}`,
    });
    setEditingStageId(stage.id);
    setAddingStage(false);
  }

  function saveStage() {
    const value = toPositiveNumber(stageDraft.value);
    if (!stageDraft.name.trim()) return;
    if (value === null || value < 0) return;

    const stage: PaymentStage = {
      id: editingStageId ?? uid(),
      name: stageDraft.name.trim(),
      description: stageDraft.description.trim(),
      entry: { type: stageDraft.entryType, value },
    };

    if (editingStageId) {
      updatePayment({
        stages: estimate.payment.stages.map((s) =>
          s.id === editingStageId ? stage : s
        ),
      });
    } else {
      updatePayment({ stages: [...estimate.payment.stages, stage] });
    }
    cancelStage();
  }

  function cancelStage() {
    setEditingStageId(null);
    setAddingStage(false);
  }

  function moveStage(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= estimate.payment.stages.length) return;
    const next = [...estimate.payment.stages];
    [next[index], next[target]] = [next[target], next[index]];
    updatePayment({ stages: next });
  }

  function changeMode(mode: PaymentConfig['mode']) {
    updatePayment({ mode });
  }

  // ---------- Terms ----------
  function beginAddTerm() {
    setTermDraft(freshTermDraft());
    setAddingTerm(true);
    setEditingTermId(null);
  }

  function beginEditTerm(term: EstimateTerm) {
    setTermDraft({ title: term.title, description: term.description });
    setEditingTermId(term.id);
    setAddingTerm(false);
  }

  function saveTerm() {
    if (!termDraft.title.trim()) return;
    const term: EstimateTerm = {
      id: editingTermId ?? uid(),
      title: termDraft.title.trim(),
      description: termDraft.description.trim(),
    };
    if (editingTermId) {
      updateEstimate({
        terms: estimate.terms.map((t) => (t.id === editingTermId ? term : t)),
      });
    } else {
      updateEstimate({ terms: [...estimate.terms, term] });
    }
    cancelTerm();
  }

  function cancelTerm() {
    setEditingTermId(null);
    setAddingTerm(false);
  }

  function moveTerm(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= estimate.terms.length) return;
    const next = [...estimate.terms];
    [next[index], next[target]] = [next[target], next[index]];
    updateEstimate({ terms: next });
  }

  return (
    <div className="cc-page est-page sw-page">
      <EstimatorSubHeader
        title="Quotation"
        subtitle="Detailed quotation for small works, repairs and renovations."
      />

      <div className="sw-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.print()}
        >
          Print Quotation
        </button>
        <button type="button" className="btn btn-outline" onClick={resetForm}>
          Reset Form
        </button>
      </div>

      {/* ------------ Quotation Details ------------ */}
      <section className="est-panel">
        <div className="est-step-heading">
          <span className="est-step-kicker">Estimate</span>
          <h2 id="sw-details-title" className="est-panel-title">Quotation Details</h2>
        </div>
        <p className="est-panel-desc">
          Customer and work identification used on the printed estimate.
        </p>
        <div className="est-form-grid">
          <label className="admin-field est-field">
            <span className="est-field-label">Quotation Number</span>
            <input
              className="admin-input"
              value={estimate.estimateNumber}
              readOnly
              aria-label="Estimate reference"
            />
          </label>
          <label className="admin-field est-field">
            <span className="est-field-label">Estimate Date</span>
            <input
              type="date"
              className="admin-input"
              value={estimate.date}
              onChange={(e) => updateEstimate({ date: e.target.value })}
            />
          </label>
          <label className="admin-field est-field">
            <span className="est-field-label">Customer Name</span>
            <input
              className="admin-input"
              value={estimate.customerName}
              placeholder="e.g. Mr. Kumar"
              onChange={(e) => updateEstimate({ customerName: e.target.value })}
            />
          </label>
          <label className="admin-field est-field">
            <span className="est-field-label">Mobile Number</span>
            <input
              className="admin-input"
              value={estimate.mobileNumber}
              placeholder="e.g. 98765 43210"
              inputMode="tel"
              onChange={(e) => updateEstimate({ mobileNumber: e.target.value })}
            />
          </label>
          <label className="admin-field est-field">
            <span className="est-field-label">Work Title</span>
            <input
              className="admin-input"
              value={estimate.workTitle}
              placeholder="e.g. Bathroom Renovation"
              onChange={(e) => updateEstimate({ workTitle: e.target.value })}
            />
          </label>
          <label className="admin-field est-field">
            <span className="est-field-label">Work Category</span>
            <select
              className="admin-input est-select"
              value={estimate.workCategory}
              onChange={(e) => updateEstimate({ workCategory: e.target.value })}
            >
              <option value="">Select category</option>
              {SMALL_WORKS_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field est-field est-field--wide">
            <span className="est-field-label">Site Location</span>
            <input
              className="admin-input"
              value={estimate.siteLocation}
              placeholder="e.g. 12, Gandhi Street, Chennai"
              onChange={(e) => updateEstimate({ siteLocation: e.target.value })}
            />
          </label>
          <label className="admin-field est-field est-field--wide">
            <span className="est-field-label">Work Description</span>
            <textarea
              className="admin-input sw-textarea"
              value={estimate.description}
              placeholder="Brief description of the work to be carried out."
              onChange={(e) => updateEstimate({ description: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* ------------ BOQ ------------ */}
      <section className="est-panel">
        <div className="est-step-heading">
          <span className="est-step-kicker">Bill of Quantities</span>
          <h2 id="sw-boq-title" className="est-panel-title">BOQ Items</h2>
        </div>
        <p className="est-panel-desc">
          Add the items of work. Amount = Quantity × Rate. The subtotal is
          calculated automatically — it is never edited by hand.
        </p>

        <div className="est-table-scroll">
          <table className="est-table sw-boq-table">
            <thead>
              <tr>
                <th className="sw-col-no">No</th>
                <th>Description</th>
                <th className="sw-col-unit">Unit</th>
                <th className="sw-col-num">Qty</th>
                <th className="sw-col-num">Rate</th>
                <th className="sw-col-num">Amount</th>
                <th className="sw-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimate.boq.length === 0 && !addingBoq && (
                <tr>
                  <td colSpan={7} className="est-table-empty">
                    No BOQ items yet. Add an item to begin building the estimate.
                  </td>
                </tr>
              )}
              {estimate.boq.map((item, index) =>
                editingBoqId === item.id ? (
                  <BoqEditRow
                    key={item.id}
                    draft={boqDraft}
                    onChange={setBoqDraft}
                    onSave={saveBoq}
                    onCancel={cancelBoq}
                  />
                ) : (
                  <tr key={item.id}>
                    <td className="sw-col-no">{index + 1}</td>
                    <td>
                      <div className="sw-boq-desc">{item.description}</div>
                      {item.specification && (
                        <div className="sw-boq-sub">Spec: {item.specification}</div>
                      )}
                      {item.remarks && <div className="sw-boq-sub">{item.remarks}</div>}
                    </td>
                    <td>{item.unit}</td>
                    <td className="est-table-qty">{formatNumber(item.quantity)}</td>
                    <td className="est-table-qty">{formatINR(item.rate)}</td>
                    <td className="est-table-amount">{formatINR(boqItemAmount(item))}</td>
                    <td>
                      <div className="sw-row-actions">
                        <button
                          type="button"
                          className="sw-icon-btn"
                          title="Move up"
                          disabled={index === 0}
                          onClick={() => moveBoq(index, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="sw-icon-btn"
                          title="Move down"
                          disabled={index === estimate.boq.length - 1}
                          onClick={() => moveBoq(index, 1)}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="sw-icon-btn"
                          title="Edit"
                          onClick={() => beginEditBoq(item)}
                        >
                          <Icon name="wrench" size={16} />
                        </button>
                        <button
                          type="button"
                          className="sw-icon-btn sw-icon-btn--danger"
                          title="Delete"
                          onClick={() => askDeleteBoq(item.id)}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
              {addingBoq && (
                <BoqEditRow
                  key="__add__"
                  draft={boqDraft}
                  onChange={setBoqDraft}
                  onSave={saveBoq}
                  onCancel={cancelBoq}
                />
              )}
            </tbody>
            {estimate.boq.length > 0 && (
              <tfoot>
                <tr className="est-table-total-row">
                  <td colSpan={5}>BOQ Subtotal</td>
                  <td className="est-table-amount">{formatINR(boqSubtotal(estimate.boq))}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {addingBoq || editingBoqId ? null : (
          <button type="button" className="sw-add-btn" onClick={beginAddBoq}>
            <span aria-hidden="true">+</span> Add BOQ Item
          </button>
        )}
      </section>

      {/* ------------ Scope of Work ------------ */}
      <section className="est-panel">
        <div className="est-step-heading">
          <span className="est-step-kicker">Scope</span>
          <h2 id="sw-scope-title" className="est-panel-title">Scope of Work</h2>
        </div>
        <p className="est-panel-desc">
          Define what is included, what is excluded and the general specifications.
        </p>
        <div className="est-form-grid">
          <label className="admin-field est-field est-field--wide">
            <span className="est-field-label">Included Works</span>
            <textarea
              className="admin-input sw-textarea"
              value={estimate.scope.includedWorks}
              placeholder="Work included in this estimate..."
              onChange={(e) => updateScope({ includedWorks: e.target.value })}
            />
          </label>
          <label className="admin-field est-field est-field--wide">
            <span className="est-field-label">Excluded Works</span>
            <textarea
              className="admin-input sw-textarea"
              value={estimate.scope.excludedWorks}
              placeholder="Work excluded from this estimate..."
              onChange={(e) => updateScope({ excludedWorks: e.target.value })}
            />
          </label>
          <label className="admin-field est-field est-field--wide">
            <span className="est-field-label">Specifications</span>
            <textarea
              className="admin-input sw-textarea"
              value={estimate.scope.specifications}
              placeholder="Material and work specifications..."
              onChange={(e) => updateScope({ specifications: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* ------------ Payment Terms ------------ */}
      <section className="est-panel">
        <div className="est-step-heading">
          <span className="est-step-kicker">Payments</span>
          <h2 id="sw-payment-title" className="est-panel-title">Payment Terms</h2>
        </div>
        <p className="est-panel-desc">
          Choose a payment structure. Stage amounts are derived from the estimate
          total; the schedule should total 100%.
        </p>

        <div className="est-form-grid sw-payment-mode">
          <label className="admin-field est-field">
            <span className="est-field-label">Payment Structure</span>
            <select
              className="admin-input est-select"
              value={estimate.payment.mode}
              onChange={(e) => changeMode(e.target.value as PaymentConfig['mode'])}
            >
              <option value="percentage">{MODE_LABELS.percentage}</option>
              <option value="advance-balance">{MODE_LABELS['advance-balance']}</option>
              <option value="custom">{MODE_LABELS.custom}</option>
            </select>
          </label>
        </div>

        {estimate.payment.mode === 'advance-balance' ? (
          <AdvanceBalanceEditor
            advance={estimate.payment.advance}
            total={total}
            onChange={(advance) => updatePayment({ advance })}
          />
        ) : (
          <>
            <div className="sw-stages">
              {estimate.payment.stages.length === 0 && !addingStage && (
                <p className="est-table-empty">No payment stages defined.</p>
              )}
              {estimate.payment.stages.map((stage, index) =>
                editingStageId === stage.id ? (
                  <StageEditRow
                    key={stage.id}
                    draft={stageDraft}
                    onChange={setStageDraft}
                    onSave={saveStage}
                    onCancel={cancelStage}
                  />
                ) : (
                  <div key={stage.id} className="sw-stage-row">
                    <div className="sw-stage-main">
                      <div className="sw-stage-name">{stage.name}</div>
                      {stage.description && (
                        <div className="sw-stage-desc">{stage.description}</div>
                      )}
                      <div className="sw-stage-meta">
                        {stage.entry.type === 'percent'
                          ? `${formatNumber(stage.entry.value)}%`
                          : `₹ ${formatNumber(stage.entry.value)}`}
                      </div>
                    </div>
                    <div className="sw-stage-amount">
                      {formatINR(paymentRows[index]?.amount ?? 0)}
                    </div>
                    <div className="sw-stage-actions">
                      <button
                        type="button"
                        className="sw-icon-btn"
                        title="Move up"
                        disabled={index === 0}
                        onClick={() => moveStage(index, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="sw-icon-btn"
                        title="Move down"
                        disabled={index === estimate.payment.stages.length - 1}
                        onClick={() => moveStage(index, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="sw-icon-btn"
                        title="Edit"
                        onClick={() => beginEditStage(stage)}
                      >
                        <Icon name="wrench" size={16} />
                      </button>
                      <button
                        type="button"
                        className="sw-icon-btn sw-icon-btn--danger"
                        title="Delete"
                        onClick={() => {
                          setConfirmKind('stage');
                          setConfirmDeleteId(stage.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              )}
              {addingStage && (
                <StageEditRow
                  key="__add-stage__"
                  draft={stageDraft}
                  onChange={setStageDraft}
                  onSave={saveStage}
                  onCancel={cancelStage}
                />
              )}
            </div>

            {addingStage || editingStageId ? null : (
              <button type="button" className="sw-add-btn" onClick={beginAddStage}>
                <span aria-hidden="true">+</span> Add Payment Stage
              </button>
            )}

            <ScheduleTable rows={paymentRows} total={total} hasError={!!paymentError} />
            {paymentError && <p className="est-error">{paymentError}</p>}
          </>
        )}
      </section>

      {/* ------------ Terms & Conditions ------------ */}
      <section className="est-panel">
        <div className="est-step-heading">
          <span className="est-step-kicker">Terms</span>
          <h2 id="sw-terms-title" className="est-panel-title">Terms &amp; Conditions</h2>
        </div>
        <p className="est-panel-desc">
          Add the terms and conditions that will appear on the estimate.
        </p>

        <div className="sw-terms">
          {estimate.terms.length === 0 && !addingTerm && (
            <p className="est-table-empty">No terms defined yet.</p>
          )}
          {estimate.terms.map((term, index) =>
            editingTermId === term.id ? (
              <TermEditRow
                key={term.id}
                draft={termDraft}
                onChange={setTermDraft}
                onSave={saveTerm}
                onCancel={cancelTerm}
              />
            ) : (
              <div key={term.id} className="sw-term-row">
                <div className="sw-term-main">
                  <div className="sw-term-title">{term.title}</div>
                  {term.description && (
                    <div className="sw-term-desc">{term.description}</div>
                  )}
                </div>
                <div className="sw-term-actions">
                  <button
                    type="button"
                    className="sw-icon-btn"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => moveTerm(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="sw-icon-btn"
                    title="Move down"
                    disabled={index === estimate.terms.length - 1}
                    onClick={() => moveTerm(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="sw-icon-btn"
                    title="Edit"
                    onClick={() => beginEditTerm(term)}
                  >
                    <Icon name="wrench" size={16} />
                  </button>
                  <button
                    type="button"
                    className="sw-icon-btn sw-icon-btn--danger"
                    title="Delete"
                    onClick={() => {
                      setConfirmKind('term');
                      setConfirmDeleteId(term.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          )}
          {addingTerm && (
            <TermEditRow
              key="__add-term__"
              draft={termDraft}
              onChange={setTermDraft}
              onSave={saveTerm}
              onCancel={cancelTerm}
            />
          )}
        </div>

        {addingTerm || editingTermId ? null : (
          <button type="button" className="sw-add-btn" onClick={beginAddTerm}>
            <span aria-hidden="true">+</span> Add Term
          </button>
        )}
      </section>

      {/* ------------ Summary ------------ */}
      <section className="est-panel est-panel--output">
        <div className="est-step-heading">
          <span className="est-step-kicker">Summary</span>
          <h2 id="sw-summary-title" className="est-panel-title">Estimate Summary</h2>
        </div>
        <div className="sw-summary-grid">
          <div className="est-derived">
            <span className="est-derived-label">BOQ Subtotal</span>
            <span className="est-derived-value">{formatINR(boqSubtotal(estimate.boq))}</span>
            <span className="est-derived-sub">
              {estimate.boq.length} BOQ item{estimate.boq.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="est-derived">
            <span className="est-derived-label">Quotation Total</span>
            <span className="est-derived-value">{formatINR(total)}</span>
            <span className="est-derived-sub">Amount payable under the payment schedule</span>
          </div>
        </div>
      </section>

      {/* ------------ Confirm delete modal ------------ */}
      {confirmDeleteId && (
        <div className="sw-confirm-overlay" role="dialog" aria-modal="true">
          <div className="sw-confirm">
            <h3 className="sw-confirm-title">Delete {confirmKind === 'boq' ? 'BOQ item' : confirmKind === 'stage' ? 'payment stage' : 'term'}?</h3>
            <p className="sw-confirm-text">
              This action cannot be undone.
            </p>
            <div className="sw-confirm-actions">
              <button type="button" className="btn btn-outline" onClick={cancelDelete}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary sw-btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------ Print sheet (hidden on screen) ------------ */}
      <PrintSheet estimate={estimate} total={total} paymentRows={paymentRows} />
    </div>
  );

  function resetForm() {
    const template = templateId ? getSmallWorksTemplateById(templateId) : null;
    setEstimate(seedFromTemplate(template));
    setEditingBoqId(null);
    setAddingBoq(false);
    setEditingStageId(null);
    setAddingStage(false);
    setEditingTermId(null);
    setAddingTerm(false);
    setConfirmDeleteId(null);
    setConfirmKind(null);
  }
}

function seedFromTemplate(template: SmallWorksTemplate | null): SmallWorksEstimate {
  return seedSmallWorksEstimate({
    workTitle: template ? template.name : '',
    workCategory: template ? template.category : '',
    boq: template ? template.defaultBoq : [],
    scope: template ? template.defaultScope : undefined,
    payment: template ? template.defaultPayment : undefined,
    terms: template ? template.defaultTerms : [],
  });
}

/* ---------- BOQ edit row ---------- */
function BoqEditRow({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: BoqDraft;
  onChange: (draft: BoqDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <tr className="sw-edit-row">
      <td colSpan={7}>
        <div className="sw-boq-edit">
          <label className="admin-field est-field sw-wide">
            <span className="est-field-label">Description</span>
            <input
              className="admin-input"
              value={draft.description}
              placeholder="e.g. Floor tile laying"
              onChange={(e) => onChange({ ...draft, description: e.target.value })}
            />
          </label>
          <div className="est-form-grid--3 sw-boq-edit-grid">
            <label className="admin-field est-field">
              <span className="est-field-label">Category</span>
              <select
                className="admin-input est-select"
                value={draft.category}
                onChange={(e) => onChange({ ...draft, category: e.target.value })}
              >
                <option value="">General</option>
                {SMALL_WORKS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field est-field">
              <span className="est-field-label">Unit</span>
              <select
                className="admin-input est-select"
                value={draft.unit}
                onChange={(e) =>
                  onChange({ ...draft, unit: e.target.value as SmallWorksUnit })
                }
              >
                {SMALL_WORKS_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field est-field">
              <span className="est-field-label">Specification</span>
              <input
                className="admin-input"
                value={draft.specification}
                placeholder="Optional"
                onChange={(e) => onChange({ ...draft, specification: e.target.value })}
              />
            </label>
            <label className="admin-field est-field">
              <span className="est-field-label">Quantity</span>
              <input
                className="admin-input"
                value={draft.quantity}
                inputMode="decimal"
                onChange={(e) => onChange({ ...draft, quantity: e.target.value })}
              />
            </label>
            <label className="admin-field est-field">
              <span className="est-field-label">Rate (₹)</span>
              <input
                className="admin-input"
                value={draft.rate}
                inputMode="decimal"
                onChange={(e) => onChange({ ...draft, rate: e.target.value })}
              />
            </label>
            <label className="admin-field est-field">
              <span className="est-field-label">Remarks</span>
              <input
                className="admin-input"
                value={draft.remarks}
                placeholder="Optional"
                onChange={(e) => onChange({ ...draft, remarks: e.target.value })}
              />
            </label>
          </div>
          <div className="sw-edit-row-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!draft.description.trim() || (toPositiveNumber(draft.quantity) ?? -1) < 0 || (toPositiveNumber(draft.rate) ?? -1) < 0}
              onClick={onSave}
            >
              Save Item
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ---------- Payment stage edit row ---------- */
function StageEditRow({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: StageDraft;
  onChange: (draft: StageDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="sw-stage-edit">
      <label className="admin-field est-field">
        <span className="est-field-label">Stage Name</span>
        <input
          className="admin-input"
          value={draft.name}
          placeholder="e.g. Advance on Confirmation"
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
        />
      </label>
      <label className="admin-field est-field">
        <span className="est-field-label">Entry Type</span>
        <select
          className="admin-input est-select"
          value={draft.entryType}
          onChange={(e) =>
            onChange({ ...draft, entryType: e.target.value as 'percent' | 'amount' })
          }
        >
          <option value="percent">Percent (%)</option>
          <option value="amount">Amount (₹)</option>
        </select>
      </label>
      <label className="admin-field est-field">
        <span className="est-field-label">
          {draft.entryType === 'percent' ? 'Percent (%)' : 'Amount (₹)'}
        </span>
        <input
          className="admin-input"
          value={draft.value}
          inputMode="decimal"
          onChange={(e) => onChange({ ...draft, value: e.target.value })}
        />
      </label>
      <label className="admin-field est-field est-field--wide">
        <span className="est-field-label">Description (optional)</span>
        <input
          className="admin-input"
          value={draft.description}
          placeholder="e.g. Advance payable on confirmation of work."
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
        />
      </label>
      <div className="sw-edit-row-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!draft.name.trim() || (toPositiveNumber(draft.value) ?? -1) < 0}
          onClick={onSave}
        >
          Save Stage
        </button>
      </div>
    </div>
  );
}

/* ---------- Term edit row ---------- */
function TermEditRow({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: TermDraft;
  onChange: (draft: TermDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="sw-term-edit">
      <label className="admin-field est-field">
        <span className="est-field-label">Title</span>
        <input
          className="admin-input"
          value={draft.title}
          placeholder="e.g. Estimate validity"
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
        />
      </label>
      <label className="admin-field est-field">
        <span className="est-field-label">Description</span>
        <input
          className="admin-input"
          value={draft.description}
          placeholder="Describe the term..."
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
        />
      </label>
      <div className="sw-edit-row-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!draft.title.trim()}
          onClick={onSave}
        >
          Save Term
        </button>
      </div>
    </div>
  );
}

/* ---------- Advance + Balance editor ---------- */
function AdvanceBalanceEditor({
  advance,
  total,
  onChange,
}: {
  advance: PaymentConfig['advance'];
  total: number;
  onChange: (advance: PaymentConfig['advance']) => void;
}) {
  const kind = advance?.kind ?? 'percent';
  const value = advance?.value ?? 30;
  const advanceAmount =
    kind === 'amount' ? value : (total * value) / 100;
  const balance = total - advanceAmount;

  return (
    <div className="sw-advance">
      <div className="est-form-grid">
        <label className="admin-field est-field">
          <span className="est-field-label">Advance Type</span>
          <select
            className="admin-input est-select"
            value={kind}
            onChange={(e) =>
              onChange({ kind: e.target.value as 'percent' | 'amount', value })
            }
          >
            <option value="percent">Percent (%)</option>
            <option value="amount">Amount (₹)</option>
          </select>
        </label>
        <label className="admin-field est-field">
          <span className="est-field-label">
            {kind === 'percent' ? 'Advance Percent (%)' : 'Advance Amount (₹)'}
          </span>
          <input
            className="admin-input"
            value={`${value}`}
            inputMode="decimal"
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed) && parsed >= 0) {
                onChange({ kind, value: parsed });
              }
            }}
          />
        </label>
      </div>
      <div className="sw-advance-breakdown">
        <div className="sw-stage-row">
          <div className="sw-stage-main">
            <div className="sw-stage-name">Advance on Confirmation</div>
            <div className="sw-stage-meta">
              {kind === 'percent' ? `${formatNumber(value)}%` : `₹ ${formatNumber(value)}`}
            </div>
          </div>
          <div className="sw-stage-amount">{formatINR(advanceAmount)}</div>
        </div>
        <div className="sw-stage-row">
          <div className="sw-stage-main">
            <div className="sw-stage-name">Balance on Completion</div>
            <div className="sw-stage-meta">Remaining amount</div>
          </div>
          <div className="sw-stage-amount">{formatINR(balance)}</div>
        </div>
      </div>
      <ScheduleTable
        rows={[
          { id: 'advance', name: 'Advance on Confirmation', description: '', percent: total > 0 ? (advanceAmount / total) * 100 : 0, amount: advanceAmount },
          { id: 'balance', name: 'Balance on Completion', description: '', percent: total > 0 ? (balance / total) * 100 : 0, amount: balance },
        ]}
        total={total}
        hasError={balance < -0.0001}
      />
      {balance < -0.0001 && (
        <p className="est-error">Advance amount exceeds the estimate total.</p>
      )}
    </div>
  );
}

/* ---------- Payment schedule table ---------- */
function ScheduleTable({
  rows,
  total,
  hasError,
}: {
  rows: { id: string; name: string; description: string; percent: number; amount: number }[];
  total: number;
  hasError: boolean;
}) {
  if (rows.length === 0 && total === 0) return null;
  return (
    <div className="sw-schedule">
      <div className="sw-schedule-head">Payment Schedule</div>
      <div className="est-table-scroll">
        <table className="est-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th className="sw-col-num">%</th>
              <th className="sw-col-num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td className="est-table-qty">{formatNumber(row.percent)}%</td>
                <td className="est-table-amount">{formatINR(row.amount)}</td>
              </tr>
            ))}
            <tr className={hasError ? 'est-table-total-row sw-total-error' : 'est-table-total-row'}>
              <td>Total</td>
              <td className="est-table-qty">{hasError ? '—' : '100%'}</td>
              <td className="est-table-amount">{formatINR(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Print helpers ---------- */
function PrintSheet({
  estimate,
  total,
  paymentRows,
}: {
  estimate: SmallWorksEstimate;
  total: number;
  paymentRows: { id: string; name: string; description: string; percent: number; amount: number }[];
}) {
  return (
    <>
      <div className="est-print-sheet" aria-hidden="true">
        <header className="est-pr-head">
          <div className="est-pr-head-logo">
            <img
              src="/assests/brand/vijaya-siri-logo-header-transparent.svg"
              alt="Vijaya Siri Projects"
            />
          </div>
          <div className="est-pr-head-main">
            <div className="est-pr-eyebrow">Vijaya Siri Projects</div>
            <h1 className="est-pr-title">Quotation</h1>
            <div className="est-pr-subtitle">
              {estimate.workCategory || 'Bill of Quantities'}
            </div>
          </div>
          <div className="est-pr-head-meta">
            <div className="est-pr-meta-chip">
              <span className="est-pr-label">Quotation Number</span>
              <span className="est-pr-value">{estimate.estimateNumber}</span>
            </div>
            <div className="est-pr-meta-chip">
              <span className="est-pr-label">Estimate Date</span>
              <span className="est-pr-value">{formatDateLabel(estimate.date)}</span>
            </div>
          </div>
        </header>

        <div className="est-pr-band">Quotation</div>

        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Bill To / Project Details</h2>
          <div className="est-pr-grid est-pr-grid--2col">
            <div className="est-pr-kv">
              <span>Customer Name</span>
              <strong>{estimate.customerName.trim() || EM_DASH}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Mobile Number</span>
              <strong>{estimate.mobileNumber.trim() || EM_DASH}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Work Title</span>
              <strong>{estimate.workTitle.trim() || EM_DASH}</strong>
            </div>
            <div className="est-pr-kv">
              <span>Site Location</span>
              <strong>{estimate.siteLocation.trim() || EM_DASH}</strong>
            </div>
          </div>
          {estimate.description.trim() && (
            <p className="est-pr-note">{estimate.description.trim()}</p>
          )}
        </section>

        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Bill of Quantities</h2>
          {estimate.boq.length > 0 ? (
            <>
              <table className="est-pr-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.boq.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.description}</td>
                      <td>{item.unit}</td>
                      <td>{formatNumber(item.quantity)}</td>
                      <td>{formatINR(item.rate)}</td>
                      <td className="est-pr-amt">{formatINR(boqItemAmount(item))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="est-pr-cost est-pr-cost--summary">
                <div className="est-pr-cost-body">
                  <div className="est-pr-cost-line">
                    <span>BOQ Subtotal</span>
                    <span>{formatINR(boqSubtotal(estimate.boq))}</span>
                  </div>
                  <div className="est-pr-total-line">
                    <span className="est-pr-total-label">Quotation Total</span>
                    <span className="est-pr-total-value">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="est-pr-note">No BOQ items have been added.</p>
          )}
        </section>

        {paymentRows.length > 0 && (
          <section className="est-pr-section">
            <h2 className="est-pr-section-title">Payment Schedule</h2>
            <table className="est-pr-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>%</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {paymentRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{formatNumber(row.percent)}%</td>
                    <td className="est-pr-amt">{formatINR(row.amount)}</td>
                  </tr>
                ))}
                <tr className="est-pr-total-row">
                  <td>Total</td>
                  <td>100%</td>
                  <td className="est-pr-amt">{formatINR(total)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        <section className="est-pr-section">
          <h2 className="est-pr-section-title">Scope of Work</h2>
          <div className="est-pr-scope-grid">
            <div className="est-pr-category">
              <h3>Included Works</h3>
              {estimate.scope.includedWorks.trim() ? (
                <p className="est-pr-paragraph">{estimate.scope.includedWorks.trim()}</p>
              ) : (
                <p className="est-pr-paragraph">{EM_DASH}</p>
              )}
            </div>
            <div className="est-pr-category">
              <h3>Excluded Works</h3>
              {estimate.scope.excludedWorks.trim() ? (
                <p className="est-pr-paragraph">{estimate.scope.excludedWorks.trim()}</p>
              ) : (
                <p className="est-pr-paragraph">{EM_DASH}</p>
              )}
            </div>
            {estimate.scope.specifications.trim() && (
              <div className="est-pr-category">
                <h3>Specifications</h3>
                <p className="est-pr-paragraph">{estimate.scope.specifications.trim()}</p>
              </div>
            )}
          </div>
        </section>

        {estimate.terms.length > 0 && (
          <section className="est-pr-section">
            <h2 className="est-pr-section-title">Terms &amp; Conditions</h2>
            <ol className="est-pr-list">
              {estimate.terms.map((term) => (
                <li key={term.id}>
                  <strong>{term.title}</strong>
                  {term.description ? ` — ${term.description}` : ''}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="est-pr-section">
          <div className="est-pr-disclaimer">
            <h2 className="est-pr-disclaimer-title">Important</h2>
            <p>
              This estimate is prepared for the Bill of Quantities provided and is not a final
              quotation or contract until confirmed. Final pricing may vary based on the actual
              quantities measured on site, agreed specifications and any change in scope.
            </p>
          </div>
        </section>

        <div className="est-pr-endline">
          Prepared on this device &middot; Estimated {formatDateLabel(estimate.date)} &middot;
          Reference {estimate.estimateNumber} &middot; No commercial commitment.
        </div>
      </div>

      <div className="est-print-footer" aria-hidden="true">
        <span className="est-prf-brand">VIJAYA SIRI PROJECTS</span>
        <span className="est-prf-sep">|</span>
        <span>Quotation</span>
        <span className="est-prf-sep">|</span>
        <span>Ref: {estimate.estimateNumber}</span>
      </div>
    </>
  );
}

