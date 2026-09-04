import { useCallback, useEffect, useRef, useState } from 'react';
import { useServiceReorder } from '../../hooks/useServiceReorder';
import {
  proFixCategories,
  getProFixCategories,
  getProFixServices,
  updateProFixService,
  addProFixService,
  resetProFixServices,
  moveProFixService,
  reorderProFixServices,
  getProFixCategoryName,
  getProFixSiteVisitCharge,
  PROFIX_DEFAULT_SITE_VISIT_CHARGE,
  formatINR,
} from '../../data/profix';
import type { ProFixPricingMode, ProFixService } from '../../data/profix';
import './AdminPage.css';
import './AdminShell.css';

const ADD_SERVICE_ID = '__add_service__';

const DEFAULT_WAIVER_LABEL = 'Work Completion Waiver';
const DEFAULT_TOAST_MS = 2600;

interface ServiceForm {
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  startingPrice: string;
  includedText: string;
  notesText: string;
  siteVisitCharge: string;
  siteVisitWaiverEnabled: boolean;
  siteVisitWaiverAmount: string;
  active: boolean;
  billingUnit: string;
  pricingMode: ProFixPricingMode;
  pricingRate: string;
  pricingLabel: string;
  pricingDefault: string;
  pricingMin: string;
  pricingMax: string;
  pricingStep: string;
}

interface ToastState {
  message: string;
  isError: boolean;
}

function buildForm(service: ProFixService): ServiceForm {
  const pricing = service.pricing;
  const siteVisitCharge = getProFixSiteVisitCharge(service);
  return {
    name: service.name,
    category: service.category,
    description: service.description,
    imageUrl: service.imageUrl ?? '',
    startingPrice: service.startingPrice ?? '',
    includedText: (service.included ?? []).join('\n'),
    notesText: (service.notes ?? []).join('\n'),
    siteVisitCharge: String(siteVisitCharge),
    siteVisitWaiverEnabled: service.siteVisitWaiver?.enabled ?? true,
    siteVisitWaiverAmount:
      service.siteVisitWaiver?.amount != null ? String(service.siteVisitWaiver.amount) : String(siteVisitCharge),
    active: service.active,
    billingUnit: pricing?.unit ?? service.unit ?? '',
    pricingMode: pricing?.mode ?? 'custom',
    pricingRate: pricing?.rate != null ? String(pricing.rate) : '',
    pricingLabel: pricing?.quantityLabel ?? '',
    pricingDefault: pricing?.defaultQuantity != null ? String(pricing.defaultQuantity) : '',
    pricingMin: pricing?.minQuantity != null ? String(pricing.minQuantity) : '',
    pricingMax: pricing?.maxQuantity != null ? String(pricing.maxQuantity) : '',
    pricingStep: pricing?.step != null ? String(pricing.step) : '',
  };
}

const EMPTY_FORM: ServiceForm = {
  name: '',
  category: proFixCategories[0].id,
  description: '',
  imageUrl: '',
  startingPrice: '',
  includedText: '',
  notesText: '',
  siteVisitCharge: '',
  siteVisitWaiverEnabled: true,
  siteVisitWaiverAmount: '',
  active: true,
  billingUnit: '',
  pricingMode: 'custom',
  pricingRate: '',
  pricingLabel: '',
  pricingDefault: '',
  pricingMin: '',
  pricingMax: '',
  pricingStep: '',
};

function toOptionalNum(value: string): number | undefined {
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function priceLabel(service: ProFixService): string {
  if (service.startingPrice) return `From \u20B9${service.startingPrice}`;
  const pricing = service.pricing;
  if (pricing?.enabled && pricing.mode !== 'custom') {
    const rate = pricing.rate ?? 0;
    const unit = pricing.unit ?? service.unit;
    return pricing.mode === 'fixed' ? formatINR(rate) : `${formatINR(rate)} / ${unit}`;
  }
  return 'Custom estimate';
}

function StatusToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? 'Active' : 'Inactive'}
      title={active ? 'Active' : 'Inactive'}
      className={`admin-toggle${active ? ' admin-toggle--on' : ''}`}
      onClick={onClick}
    >
      <span className="admin-toggle-track" aria-hidden="true" />
    </button>
  );
}

export default function ProFixServicesSection() {
  const [services, setServices] = useState<ProFixService[]>(() => getProFixServices());
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState<ServiceForm>(EMPTY_FORM);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const toastTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, isError });
    toastTimer.current = window.setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const startEdit = useCallback((service: ProFixService) => {
    setAdding(false);
    setEditingId(service.id);
    setEditForm(buildForm(service));
  }, []);

  const startAdd = useCallback(() => {
    setEditingId(null);
    setAdding(true);
    const allCats = getProFixCategories();
    const activeCats = allCats.filter((c) => c.active);
    const defaultCategory = (activeCats[0] ?? allCats[0])?.id ?? '';
    setEditForm({
      ...EMPTY_FORM,
      category: defaultCategory,
      billingUnit: 'Unit',
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setAdding(false);
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  }, []);

  const toggleActive = useCallback((id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const updated = updateProFixService(id, { active: !service.active });
    setServices(updated);
  }, [services]);

  const handleMove = useCallback((id: string, direction: 'up' | 'down') => {
    const updated = moveProFixService(id, direction);
    setServices(updated);
    showToast(direction === 'up' ? 'Service moved up' : 'Service moved down');
  }, [showToast]);

  const handleResetClick = useCallback(() => {
    if (!resetConfirm) {
      setResetConfirm(true);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    setResetConfirm(false);
    setServices(resetProFixServices());
    cancelEdit();
    showToast('Pro Fix services restored to defaults');
  }, [resetConfirm, cancelEdit, showToast]);

  const handleSave = useCallback(() => {
    if (!editingId && !adding) return;
    const name = editForm.name.trim();
    if (!name) {
      showToast('Service name is required', true);
      return;
    }

    const pricingOn = editForm.pricingMode !== 'custom';
    const billingUnit = editForm.billingUnit.trim();
    const startingPrice = editForm.startingPrice.trim();
    const siteVisitCharge = toOptionalNum(editForm.siteVisitCharge);
    const effectiveCharge = siteVisitCharge ?? PROFIX_DEFAULT_SITE_VISIT_CHARGE;
    const waiverAmount = toOptionalNum(editForm.siteVisitWaiverAmount) ?? effectiveCharge;
    const current = adding ? undefined : services.find((s) => s.id === editingId);

    const included = editForm.includedText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const notes = editForm.notesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      name,
      category: editForm.category,
      description: editForm.description.trim(),
      imageUrl: editForm.imageUrl.trim() || undefined,
      startingPrice,
      included,
      notes,
      active: editForm.active,
      unit: billingUnit || undefined,
      siteVisitCharge,
      siteVisitWaiver: {
        enabled: editForm.siteVisitWaiverEnabled,
        label: current?.siteVisitWaiver?.label ?? DEFAULT_WAIVER_LABEL,
        amount: waiverAmount,
        trigger: 'work_completion' as const,
      },
      pricing: {
        enabled: pricingOn,
        mode: editForm.pricingMode,
        rate: pricingOn ? toOptionalNum(editForm.pricingRate) : undefined,
        unit: billingUnit || undefined,
        quantityLabel: pricingOn ? editForm.pricingLabel.trim() || undefined : undefined,
        defaultQuantity: pricingOn ? toOptionalNum(editForm.pricingDefault) : undefined,
        minQuantity: pricingOn ? toOptionalNum(editForm.pricingMin) : undefined,
        maxQuantity: pricingOn ? toOptionalNum(editForm.pricingMax) : undefined,
        step: pricingOn ? toOptionalNum(editForm.pricingStep) : undefined,
      },
    };

    if (adding) {
      addProFixService({
        ...payload,
        image: '',
        unit: payload.unit ?? 'Unit',
      });
    } else if (editingId) {
      updateProFixService(editingId, payload);
    }

    if (adding) setQuery('');

    setServices(getProFixServices());
    showToast('Changes saved');
    cancelEdit();
  }, [editingId, adding, editForm, services, cancelEdit, showToast]);

  const pricingOn = editForm.pricingMode !== 'custom';

  const allCategories = getProFixCategories();

  const q = query.trim().toLowerCase();
  const sortedServices = [...services].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered = sortedServices
    .filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        getProFixCategoryName(s.category).toLowerCase().includes(q)
    );

  const serviceIndex = (id: string) => sortedServices.findIndex((s) => s.id === id);

  const editingService = services.find((s) => s.id === editingId);

  const display = adding
    ? [{ id: ADD_SERVICE_ID } as unknown as ProFixService, ...filtered]
    : filtered;

  const reorderEnabled = !adding && editingId === null && query.trim() === '';

  const reorder = useServiceReorder({
    enabled: reorderEnabled,
    items: display,
    fullIds: sortedServices.map((s) => s.id),
    onCommitted: (orderedIds) => {
      const reordered = reorderProFixServices(orderedIds);
      setServices(reordered);
      showToast('Service order updated');
    },
  });

  const set = (patch: Partial<ServiceForm>) => setEditForm((prev) => ({ ...prev, ...patch }));

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Pro Fix Services</h1>
        <p className="admin-subtitle">
          These are the services customers see on Pro Fix. Changes are saved to browser storage.
        </p>
        <div className="admin-actions">
          <div className="admin-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Pro Fix services"
            />
          </div>
<button
              className="admin-btn admin-btn--save"
              onClick={startAdd}
              type="button"
            >
              + Add Service
            </button>
            <button
              className="admin-btn admin-btn--reset"
              onClick={handleResetClick}
              type="button"
            >
              {resetConfirm ? 'Confirm reset?' : 'Reset to Defaults'}
            </button>
        </div>
      </div>

      {query.trim() !== '' && (
        <p className="admin-reorder-hint" id="reorder-search-hint">
          Clear search to reorder
        </p>
      )}

      <div
        className={`admin-projects-list${reorder.listClassName}`}
        ref={reorder.listRef}
      >
        {display.map((service) =>
          editingId === service.id || service.id === ADD_SERVICE_ID ? (
            <div key={service.id} className="admin-project-row admin-project-row--edit">
              <div className="admin-edit-form">
                <div className="admin-edit-grid">
                  <label className="admin-field">
                    <span className="admin-field-label">Service Name</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.name}
                      onChange={(e) => set({ name: e.target.value })}
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Category</span>
                    <select
                      className="admin-input"
                      value={editForm.category}
                      onChange={(e) => set({ category: e.target.value })}
                    >
                      {allCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </label>
                    {editingService && (
                      <div className="admin-field">
                        <span className="admin-field-label">Display position</span>
                        <div className="admin-readonly-position">#{editingService.displayOrder}</div>
                      </div>
                    )}
                    <label className="admin-field">
                      <span className="admin-field-label">Status</span>
                      <select
                      className="admin-input"
                      value={editForm.active ? 'active' : 'inactive'}
                      onChange={(e) => set({ active: e.target.value === 'active' })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>

                  <div className="admin-field admin-field--wide">
                    <span className="admin-field-label">Image</span>
                    <div className="admin-image-row">
                      <div className="admin-svc-thumb admin-svc-thumb--lg">
                        {editForm.imageUrl ? (
                          <img src={editForm.imageUrl} alt="" />
                        ) : (
                          <span className="admin-svc-thumb-none">No image</span>
                        )}
                      </div>
                      <input
                        type="text"
                        className="admin-input"
                        value={editForm.imageUrl}
                        onChange={(e) => set({ imageUrl: e.target.value })}
                        placeholder="/assests/... or https://..."
                      />
                    </div>
                  </div>

                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">Description</span>
                    <textarea
                      className="admin-textarea"
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => set({ description: e.target.value })}
                    />
                  </label>
                </div>

                <div className="admin-form-block">
                  <h4 className="admin-form-block-title">Pricing</h4>
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Pricing Mode</span>
                      <select
                        className="admin-input"
                        value={editForm.pricingMode}
                        onChange={(e) => set({ pricingMode: e.target.value as ProFixPricingMode })}
                      >
                        <option value="custom">Custom estimate (no rate)</option>
                        <option value="area_rate">Area rate (per sq.ft etc.)</option>
                        <option value="quantity_rate">Quantity rate</option>
                        <option value="fixed">Fixed price</option>
                      </select>
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Starting Price (shown on listing)</span>
                      <input
                        type="text"
                        className="admin-input"
                        value={editForm.startingPrice}
                        onChange={(e) => set({ startingPrice: e.target.value })}
                        placeholder="e.g. 45"
                      />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Billing Unit</span>
                      <input
                        type="text"
                        className="admin-input"
                        value={editForm.billingUnit}
                        onChange={(e) => set({ billingUnit: e.target.value })}
                        placeholder="Sq.ft"
                      />
                    </label>
                    {pricingOn && (
                      <label className="admin-field">
                        <span className="admin-field-label">Rate (\u20B9)</span>
                        <input
                          type="number"
                          min="0"
                          className="admin-input"
                          value={editForm.pricingRate}
                          onChange={(e) => set({ pricingRate: e.target.value })}
                        />
                      </label>
                    )}
                    {pricingOn && (
                      <label className="admin-field">
                        <span className="admin-field-label">Quantity Label</span>
                        <input
                          type="text"
                          className="admin-input"
                          value={editForm.pricingLabel}
                          onChange={(e) => set({ pricingLabel: e.target.value })}
                          placeholder="Area"
                        />
                      </label>
                    )}
                    {pricingOn && (
                      <label className="admin-field">
                        <span className="admin-field-label">Default Quantity</span>
                        <input
                          type="number"
                          min="1"
                          className="admin-input"
                          value={editForm.pricingDefault}
                          onChange={(e) => set({ pricingDefault: e.target.value })}
                        />
                      </label>
                    )}
                    {pricingOn && (
                      <label className="admin-field">
                        <span className="admin-field-label">Minimum Quantity</span>
                        <input
                          type="number"
                          min="1"
                          className="admin-input"
                          value={editForm.pricingMin}
                          onChange={(e) => set({ pricingMin: e.target.value })}
                        />
                      </label>
                    )}
                    {pricingOn && (
                      <label className="admin-field">
                        <span className="admin-field-label">Maximum Quantity</span>
                        <input
                          type="number"
                          min="1"
                          className="admin-input"
                          value={editForm.pricingMax}
                          onChange={(e) => set({ pricingMax: e.target.value })}
                        />
                      </label>
                    )}
                    {pricingOn && (
                      <label className="admin-field">
                        <span className="admin-field-label">Step</span>
                        <input
                          type="number"
                          min="1"
                          className="admin-input"
                          value={editForm.pricingStep}
                          onChange={(e) => set({ pricingStep: e.target.value })}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="admin-form-block">
                  <h4 className="admin-form-block-title">Site Visit</h4>
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Site Visit Charge (\u20B9)</span>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={editForm.siteVisitCharge}
                        onChange={(e) => set({ siteVisitCharge: e.target.value })}
                      />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Waiver Amount (\u20B9)</span>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={editForm.siteVisitWaiverAmount}
                        onChange={(e) => set({ siteVisitWaiverAmount: e.target.value })}
                      />
                    </label>
                    <div className="admin-field admin-check-field">
                      <label className="admin-check-label">
                        <input
                          type="checkbox"
                          checked={editForm.siteVisitWaiverEnabled}
                          onChange={(e) => set({ siteVisitWaiverEnabled: e.target.checked })}
                        />
                        Waived after work completion
                      </label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-block">
                  <h4 className="admin-form-block-title">Included Items</h4>
                  <div className="admin-edit-grid">
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">One item per line</span>
                      <textarea
                        className="admin-textarea"
                        rows={5}
                        value={editForm.includedText}
                        onChange={(e) => set({ includedText: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-form-block">
                  <h4 className="admin-form-block-title">Notes</h4>
                  <div className="admin-edit-grid">
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">One note per line</span>
                      <textarea
                        className="admin-textarea"
                        rows={3}
                        value={editForm.notesText}
                        onChange={(e) => set({ notesText: e.target.value })}
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">
                    Save Changes
                  </button>
                  <button className="admin-btn admin-btn--cancel" onClick={cancelEdit} type="button">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={service.id}
              className={`admin-project-row admin-svc-row ${service.active ? 'admin-project-row--featured' : ''}${reorder.drag?.id === service.id ? ' admin-project-row--dragging' : ''}`}
              ref={reorder.rowRef(service.id)}
              style={reorder.rowStyle(service.id)}
              onPointerMove={reorder.onRowPointerMove}
              onPointerUp={reorder.onRowPointerUp}
              onPointerCancel={reorder.onRowPointerCancel}
            >
              <div className="admin-project-info">
                <div
                  className={`admin-drag-handle${reorder.drag?.id === service.id ? ' admin-drag-handle--active' : ''}${reorder.pressId === service.id ? ' admin-drag-handle--pressed' : ''}${!reorderEnabled ? ' admin-drag-handle--disabled' : ''}`}
                  data-drag-handle
                  role="button"
                  aria-label="Reorder service"
                  aria-disabled={!reorderEnabled || undefined}
                  title={reorderEnabled ? 'Drag or hold to reorder' : 'Reorder disabled while searching'}
                  onPointerDown={(e) => reorder.onHandlePointerDown(e, service.id)}
                  onContextMenu={(e) => {
                    if (reorderEnabled) e.preventDefault();
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="9" cy="6" r="1.6" />
                    <circle cx="15" cy="6" r="1.6" />
                    <circle cx="9" cy="12" r="1.6" />
                    <circle cx="15" cy="12" r="1.6" />
                    <circle cx="9" cy="18" r="1.6" />
                    <circle cx="15" cy="18" r="1.6" />
                  </svg>
                </div>
                <div className="admin-project-order">#{service.displayOrder}</div>
                <div className="admin-svc-thumb">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt="" draggable={false} />
                  ) : (
                    <span className="admin-svc-thumb-none">&middot;</span>
                  )}
                </div>
                <div className="admin-project-details">
                  <h3 className="admin-project-name">{service.name}</h3>
                  <p className="admin-project-meta">
                    {getProFixCategoryName(service.category)} &middot; {priceLabel(service)}
                  </p>
                </div>
                <span className={`admin-featured-badge ${service.active ? 'admin-featured-badge--on' : ''}`}>
                  {service.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="admin-project-actions">
                <StatusToggle active={service.active} onClick={() => toggleActive(service.id)} />
                <span className="admin-move-controls" role="group" aria-label={`Reorder ${service.name}`}>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMove(service.id, 'up')}
                    type="button"
                    disabled={serviceIndex(service.id) === 0}
                    aria-label={`Move ${service.name} up`}
                    title={`Move ${service.name} up`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMove(service.id, 'down')}
                    type="button"
                    disabled={serviceIndex(service.id) === sortedServices.length - 1}
                    aria-label={`Move ${service.name} down`}
                    title={`Move ${service.name} down`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </span>
                <button
                  className="admin-btn admin-btn--edit"
                  onClick={() => startEdit(service)}
                  type="button"
                >
                  Edit
                </button>
              </div>
            </div>
          )
        )}
        {!adding && filtered.length === 0 && (
          <p className="admin-empty">No services match your search.</p>
        )}
      </div>

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />
          {toast.message}
        </div>
      )}
    </div>
  );
}