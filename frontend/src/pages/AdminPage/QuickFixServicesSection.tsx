import { useCallback, useEffect, useRef, useState } from 'react';
import { useServiceReorder } from '../../hooks/useServiceReorder';
import {
  fetchQuickFixAdminCategories,
  fetchQuickFixAdminServices,
  createQuickFixService,
  updateQuickFixService,
  toggleQuickFixService,
  deleteQuickFixService,
  reorderQuickFixServices,
} from '../../api/quickFix';
import type { QuickFixDuration } from '../../api/quickFix';
import BannerImageUpload from './BannerImageUpload';
import './AdminPage.css';
import './AdminShell.css';

function svcToFrontend(s: any) {
  return { ...s, id: s._id, image: s.image?.url ?? '' };
}
function catToFrontend(c: any) {
  return { ...c, id: c._id };
}

const ADD_SERVICE_ID = '__add_quickfix_service__';

const DEFAULT_TOAST_MS = 2600;

interface ServiceForm {
  name: string;
  categoryId: string;
  image: string;
  shortDescription: string;
  description: string;
  includedText: string;
  notesText: string;
  priceEnabled: boolean;
  price: string;
  priceNote: string;
  durationValue: string;
  durationUnit: string;
  active: boolean;
  featured: boolean;
  requiresTimeSlot: boolean;
  requiresPayment: boolean;
}

interface ToastState {
  message: string;
  isError: boolean;
}

function buildForm(service: any): ServiceForm {
  return {
    name: service.name,
    categoryId: service.categoryId,
    image: service.image ?? '',
    shortDescription: service.shortDescription,
    description: service.description,
    includedText: (service.includedItems ?? []).join('\n'),
    notesText: (service.notes ?? []).join('\n'),
    priceEnabled: service.pricing?.enabled ?? false,
    price: service.pricing?.price != null ? String(service.pricing.price) : '',
    priceNote: service.pricing?.priceNote ?? '',
    durationValue: service.duration?.value != null ? String(service.duration.value) : '',
    durationUnit: service.duration?.unit ?? 'mins',
    active: service.active,
    featured: service.featured,
    requiresTimeSlot: service.bookingConfiguration?.requiresTimeSlot ?? true,
    requiresPayment: service.bookingConfiguration?.requiresPayment ?? true,
  };
}

function emptyForm(firstCategoryId: string): ServiceForm {
  return {
    name: '',
    categoryId: firstCategoryId,
    image: '',
    shortDescription: '',
    description: '',
    includedText: '',
    notesText: '',
    priceEnabled: true,
    price: '',
    priceNote: '',
    durationValue: '',
    durationUnit: 'mins',
    active: true,
    featured: false,
    requiresTimeSlot: true,
    requiresPayment: true,
  };
}

function toOptionalNum(value: string): number | undefined {
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
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

export default function QuickFixServicesSection() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState<ServiceForm>(() => emptyForm(''));
  const [toast, setToast] = useState<ToastState | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const toastTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, isError });
    toastTimer.current = window.setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [svcs, cats] = await Promise.all([fetchQuickFixAdminServices(), fetchQuickFixAdminCategories()]);
      setServices(svcs.map(svcToFrontend));
      setCategories(cats.map(catToFrontend));
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load services', isError: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const getCategoryName = useCallback((catId: string) => categories.find((c) => c.id === catId)?.name ?? catId, [categories]);

  const startEdit = useCallback((service: any) => {
    setAdding(false);
    setEditingId(service.id);
    setEditForm(buildForm(service));
  }, []);

  const startAdd = useCallback(() => {
    setEditingId(null);
    setAdding(true);
    const activeCats = categories.filter((c) => c.active);
    const defaultCategory = (activeCats[0] ?? categories[0])?.id ?? '';
    setEditForm(emptyForm(defaultCategory));
  }, [categories]);

  const cancelEdit = useCallback(() => {
    setAdding(false);
    setEditingId(null);
    setEditForm(emptyForm(categories[0]?.id ?? ''));
  }, [categories]);

  const toggleActive = useCallback(async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;
    try {
      await toggleQuickFixService(id);
      setServices((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update', isError: true });
    }
  }, [services]);

  const handleMove = useCallback(async (id: string, direction: 'up' | 'down') => {
    const sorted = [...services].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((s) => s.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const ids = sorted.map((s) => s.id);
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    try {
      const reordered = await reorderQuickFixServices(ids);
      setServices(reordered.map(svcToFrontend));
      showToast(direction === 'up' ? 'Service moved up' : 'Service moved down');
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to reorder', isError: true });
    }
  }, [services, showToast]);

  const handleResetClick = useCallback(() => {
    if (!resetConfirm) {
      setResetConfirm(true);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    setResetConfirm(false);
    loadData();
    cancelEdit();
    showToast('Quick Fix services refreshed from server');
  }, [resetConfirm, cancelEdit, showToast, loadData]);

  const handleSave = useCallback(async () => {
    if (!editingId && !adding) return;
    const name = editForm.name.trim();
    if (!name) {
      showToast('Service name is required', true);
      return;
    }

    const durationVal = toOptionalNum(editForm.durationValue);
    const duration: QuickFixDuration | undefined =
      durationVal != null ? { value: durationVal, unit: editForm.durationUnit || 'mins' } : undefined;

    const payload = {
      name,
      categoryId: editForm.categoryId,
      image: editForm.image.trim() ? { url: editForm.image.trim(), publicId: '' } : undefined,
      shortDescription: editForm.shortDescription.trim(),
      description: editForm.description.trim(),
      includedItems: editForm.includedText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      notes: editForm.notesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      pricing: {
        enabled: editForm.priceEnabled,
        price: editForm.priceEnabled ? toOptionalNum(editForm.price) : undefined,
        priceNote: editForm.priceEnabled ? editForm.priceNote.trim() || undefined : undefined,
      },
      duration,
      active: editForm.active,
      featured: editForm.featured,
      bookingConfiguration: {
        requiresTimeSlot: editForm.requiresTimeSlot,
        requiresPayment: editForm.requiresPayment,
      },
    };

    try {
      if (adding) {
        await createQuickFixService(payload as any);
      } else if (editingId) {
        await updateQuickFixService(editingId, payload as any);
      }
      if (adding) setQuery('');
      await loadData();
      showToast(adding ? 'Service added' : 'Changes saved');
      cancelEdit();
    } catch (err: any) {
      showToast(err.message || 'Failed to save', true);
    }
  }, [editingId, adding, editForm, cancelEdit, showToast, loadData]);

  const allCategories = categories;

  const q = query.trim().toLowerCase();
  const sortedServices = [...services].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered = sortedServices.filter(
    (s) =>
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.shortDescription.toLowerCase().includes(q) ||
      getCategoryName(s.categoryId).toLowerCase().includes(q)
  );

  const serviceIndex = (id: string) => sortedServices.findIndex((s) => s.id === id);

  const editingService = services.find((s) => s.id === editingId);

  const display = adding ? [{ id: ADD_SERVICE_ID } as unknown as any, ...filtered] : filtered;

  const reorderEnabled = !adding && editingId === null && query.trim() === '';

  const reorder = useServiceReorder({
    enabled: reorderEnabled,
    items: display,
    fullIds: sortedServices.map((s) => s.id),
    onCommitted: async (orderedIds) => {
      try {
        const reordered = await reorderQuickFixServices(orderedIds);
        setServices(reordered.map(svcToFrontend));
        showToast('Service order updated');
      } catch (err: any) {
        showToast(err.message || 'Failed to reorder', true);
      }
    },
  });

  const set = (patch: Partial<ServiceForm>) => setEditForm((prev) => ({ ...prev, ...patch }));

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Quick Fix Services</h1>
          <p className="admin-subtitle">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Quick Fix Services</h1>
        <p className="admin-subtitle">
          These are the services customers see on Quick Fix. Changes are saved to the server.
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
              aria-label="Search Quick Fix services"
            />
          </div>
          <button className="admin-btn admin-btn--save" onClick={startAdd} type="button">
            + Add Service
          </button>
          <button className="admin-btn admin-btn--reset" onClick={handleResetClick} type="button">
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
                      value={editForm.categoryId}
                      onChange={(e) => set({ categoryId: e.target.value })}
                    >
                      {allCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </label>
                  {editingService && !adding && (
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
                  <div className="admin-field admin-check-field">
                    <label className="admin-check-label">
                      <input
                        type="checkbox"
                        checked={editForm.featured}
                        onChange={(e) => set({ featured: e.target.checked })}
                      />
                      Featured (Popular badge)
                    </label>
                  </div>

                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">Short Description</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.shortDescription}
                      onChange={(e) => set({ shortDescription: e.target.value })}
                      placeholder="One-line summary shown on the listing card"
                    />
                  </label>

                  <div className="admin-field admin-field--wide">
                    <span className="admin-field-label">Image</span>
                    <BannerImageUpload
                      value={editForm.image}
                      onChange={(image) => set({ image })}
                      previewAspectRatio="16 / 7"
                      emptyLabel="No image selected"
                      note={
                        <>
                          Recommended: use a clear landscape image.
                          <br />
                          JPG, PNG or WebP supported.
                        </>
                      }
                      tip="Tip: Uploaded images may be compressed to keep storage small."
                    />
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
                  <h4 className="admin-form-block-title">Pricing &amp; Duration</h4>
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Fixed price shown?</span>
                      <select
                        className="admin-input"
                        value={editForm.priceEnabled ? 'yes' : 'no'}
                        onChange={(e) => set({ priceEnabled: e.target.value === 'yes' })}
                      >
                        <option value="yes">Show fixed price</option>
                        <option value="no">No fixed price</option>
                      </select>
                    </label>
                    {editForm.priceEnabled && (
                      <label className="admin-field">
                        <span className="admin-field-label">Price (\u20B9)</span>
                        <input
                          type="number"
                          min="0"
                          className="admin-input"
                          value={editForm.price}
                          onChange={(e) => set({ price: e.target.value })}
                        />
                      </label>
                    )}
                    {editForm.priceEnabled && (
                      <label className="admin-field admin-field--wide">
                        <span className="admin-field-label">Price note</span>
                        <input
                          type="text"
                          className="admin-input"
                          value={editForm.priceNote}
                          onChange={(e) => set({ priceNote: e.target.value })}
                          placeholder="e.g. Visit charge included"
                        />
                      </label>
                    )}
                    <label className="admin-field">
                      <span className="admin-field-label">Duration (value)</span>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={editForm.durationValue}
                        onChange={(e) => set({ durationValue: e.target.value })}
                      />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Duration (unit)</span>
                      <input
                        type="text"
                        className="admin-input"
                        value={editForm.durationUnit}
                        onChange={(e) => set({ durationUnit: e.target.value })}
                        placeholder="mins"
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-form-block">
                  <h4 className="admin-form-block-title">Booking</h4>
                  <div className="admin-edit-grid">
                    <div className="admin-field admin-check-field">
                      <label className="admin-check-label">
                        <input
                          type="checkbox"
                          checked={editForm.requiresTimeSlot}
                          onChange={(e) => set({ requiresTimeSlot: e.target.checked })}
                        />
                        Requires time slot
                      </label>
                    </div>
                    <div className="admin-field admin-check-field">
                      <label className="admin-check-label">
                        <input
                          type="checkbox"
                          checked={editForm.requiresPayment}
                          onChange={(e) => set({ requiresPayment: e.target.checked })}
                        />
                        Requires payment
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
                    {adding ? 'Add Service' : 'Save Changes'}
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
                  {service.image ? (
                    <img src={service.image} alt="" draggable={false} />
                  ) : (
                    <span className="admin-svc-thumb-none">&middot;</span>
                  )}
                </div>
                <div className="admin-project-details">
                  <h3 className="admin-project-name">{service.name}</h3>
                  <p className="admin-project-meta">
                    {getCategoryName(service.categoryId)}
                    {service.pricing?.enabled && service.pricing.price != null
                      ? ` \u00B7 ${formatINR(service.pricing.price)}`
                      : ''}
                    {service.featured ? ' \u00B7 Featured' : ''}
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
