import { useState, useCallback, useEffect, useRef } from 'react';
import { useServiceReorder } from '../../hooks/useServiceReorder';
import {
  getOffers,
  addOffer,
  updateOffer,
  deleteOffer,
  resetOffers,
  moveOffer,
  reorderOffers,
} from '../../data/offers';
import type { Offer, OfferDestinationType } from '../../data/offers';
import AdminToggle from './AdminToggle';
import BannerImageUpload from './BannerImageUpload';
import './AdminPage.css';
import './AdminShell.css';
import './AdminOffers.css';

const DEFAULT_TOAST_MS = 2600;

interface ToastState {
  message: string;
  isError?: boolean;
}

function formatShortDate(isoDate: string): string {
  const key = isoDate.slice(0, 10);
  if (!key) return isoDate;
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function offerStatusText(offer: Offer): string {
  if (!offer.active) return 'Inactive';

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const startKey = offer.startDate.slice(0, 10);
  const endKey = offer.endDate.slice(0, 10);

  if (startKey && startKey > today) {
    return `Scheduled · From ${formatShortDate(startKey)}`;
  }
  if (endKey && endKey < today) {
    return `Expired · Until ${formatShortDate(endKey)}`;
  }
  if (startKey && endKey) {
    return `Active · ${formatShortDate(startKey)} → ${formatShortDate(endKey)}`;
  }
  if (endKey) return `Active · Until ${formatShortDate(endKey)}`;
  if (startKey) return `Active · From ${formatShortDate(startKey)}`;
  return 'Active';
}

function destinationLabel(offer: Offer): string {
  switch (offer.destinationType) {
    case 'internal':
      return `Internal path · ${offer.ctaTarget || '(empty)'}`;
    case 'external':
      return `External · ${offer.ctaTarget || '(no URL)'}`;
    default:
      return 'Display only';
  }
}

interface OfferForm {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  mobileImage: string;
  ctaLabel: string;
  ctaTarget: string;
  destinationType: OfferDestinationType;
  startDate: string;
  endDate: string;
  active: boolean;
}

function buildForm(offer: Offer): OfferForm {
  return {
    eyebrow: offer.eyebrow ?? '',
    title: offer.title,
    description: offer.description ?? '',
    image: offer.image ?? '',
    mobileImage: offer.mobileImage ?? '',
    ctaLabel: offer.ctaLabel ?? '',
    ctaTarget: offer.ctaTarget ?? '',
    destinationType: offer.destinationType ?? 'none',
    startDate: offer.startDate ?? '',
    endDate: offer.endDate ?? '',
    active: offer.active,
  };
}

function emptyForm(): OfferForm {
  return {
    eyebrow: '',
    title: '',
    description: '',
    image: '',
    mobileImage: '',
    ctaLabel: '',
    ctaTarget: '',
    destinationType: 'internal',
    startDate: '',
    endDate: '',
    active: true,
  };
}

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>(() => getOffers());
  const [offerEditingId, setOfferEditingId] = useState<string | null>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerEditForm, setOfferEditForm] = useState<OfferForm>(() => emptyForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);
  const deletingRef = useRef(false);

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

  useEffect(() => {
    if (deleteConfirmId === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeleteConfirmId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteConfirmId]);

  const setForm = useCallback((patch: Partial<OfferForm>) => {
    setOfferEditForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const openAddForm = useCallback(() => {
    setOfferEditingId(null);
    setShowOfferForm(true);
    setDeleteConfirmId(null);
    setOfferEditForm(emptyForm());
  }, []);

  const openEditForm = useCallback((offer: Offer) => {
    setShowOfferForm(false);
    setOfferEditingId(offer.id);
    setDeleteConfirmId(null);
    setOfferEditForm(buildForm(offer));
  }, []);

  const closeEditForm = useCallback(() => {
    setOfferEditingId(null);
    setShowOfferForm(false);
    setOfferEditForm(emptyForm());
  }, []);

  const handleAddOffer = useCallback(() => {
    const now = new Date().toISOString().slice(0, 10);
    const input: Omit<Offer, 'id' | 'displayOrder'> = {
      eyebrow: offerEditForm.eyebrow.trim(),
      title: offerEditForm.title.trim(),
      description: offerEditForm.description.trim(),
      image: offerEditForm.image,
      mobileImage: offerEditForm.mobileImage || undefined,
      ctaLabel: offerEditForm.ctaLabel.trim(),
      ctaTarget: offerEditForm.ctaTarget.trim(),
      destinationType: offerEditForm.destinationType,
      active: offerEditForm.active,
      startDate: offerEditForm.startDate || now,
      endDate: offerEditForm.endDate || now,
    };
    if (!input.title) {
      showToast('Offer title is required', true);
      return;
    }
    try {
      const updated = addOffer(input);
      setOffers(updated);
      setShowOfferForm(false);
      setOfferEditForm(emptyForm());
      showToast('Offer added');
    } catch {
      showToast('Storage limit reached. Remove some offers or use smaller images before saving.', true);
    }
  }, [offerEditForm, showToast]);

  const handleSaveOffer = useCallback(() => {
    if (!offerEditingId) return;
    const title = offerEditForm.title.trim();
    if (!title) {
      showToast('Offer title is required', true);
      return;
    }
    const updates: Partial<Offer> = {
      eyebrow: offerEditForm.eyebrow.trim(),
      title,
      description: offerEditForm.description.trim(),
      image: offerEditForm.image,
      mobileImage: offerEditForm.mobileImage || undefined,
      ctaLabel: offerEditForm.ctaLabel.trim(),
      ctaTarget: offerEditForm.ctaTarget.trim(),
      destinationType: offerEditForm.destinationType,
      active: offerEditForm.active,
      startDate: offerEditForm.startDate,
      endDate: offerEditForm.endDate,
    };
    try {
      const updated = updateOffer(offerEditingId, updates);
      setOffers(updated);
      setOfferEditingId(null);
      setOfferEditForm(emptyForm());
      showToast('Changes saved');
    } catch {
      showToast('Storage limit reached. Remove some offers or use smaller images before saving.', true);
    }
  }, [offerEditingId, offerEditForm, showToast]);

  const handleDeleteOffer = useCallback(
    (id: string) => {
      if (deletingRef.current) return;
      deletingRef.current = true;
      const updated = deleteOffer(id);
      setOffers(updated);
      setDeleteConfirmId(null);
      showToast('Offer deleted');
    },
    [showToast]
  );

  const handleToggleStatus = useCallback(
    (id: string) => {
      const offer = offers.find((o) => o.id === id);
      if (!offer) return;
      const updated = updateOffer(id, { active: !offer.active });
      setOffers(updated);
    },
    [offers]
  );

  const handleMove = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const updated = moveOffer(id, direction);
      setOffers(updated);
      showToast(direction === 'up' ? 'Offer moved up' : 'Offer moved down');
    },
    [showToast]
  );

  const handleResetClick = useCallback(() => {
    if (!resetConfirm) {
      setResetConfirm(true);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    setResetConfirm(false);
    setOffers(resetOffers());
    setOfferEditingId(null);
    setShowOfferForm(false);
    setOfferEditForm(emptyForm());
    setDeleteConfirmId(null);
    showToast('Offers restored to defaults');
  }, [resetConfirm, showToast]);

  const sortedOffers = [...offers].sort((a, b) => a.displayOrder - b.displayOrder);
  const offerIndex = (id: string) => sortedOffers.findIndex((o) => o.id === id);
  const deletingOffer = offers.find((o) => o.id === deleteConfirmId) ?? null;

  const formOpen = showOfferForm || offerEditingId !== null;

  const reorder = useServiceReorder({
    enabled: !formOpen,
    items: sortedOffers,
    fullIds: sortedOffers.map((o) => o.id),
    onCommitted: (orderedIds) => {
      const reordered = reorderOffers(orderedIds);
      setOffers(reordered);
      showToast('Offer order updated');
    },
  });

  return (
    <div className="admin-page admin-page--banners">
      <div className="admin-section admin-section--primary">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Offers</h2>
            <p className="admin-section-desc">
              Manage promotional offers shown on the customer Offers page.
              Offers appear in display order — active offers within their date window are shown to customers.
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="admin-btn admin-btn--add"
              onClick={openAddForm}
              type="button"
            >
              + Add Offer
            </button>
            <button className="admin-btn admin-btn--reset" onClick={handleResetClick} type="button">
              {resetConfirm ? 'Confirm reset?' : 'Reset to Defaults'}
            </button>
          </div>
        </div>

        {showOfferForm && !offerEditingId && (
          <div className="admin-edit-form">
            <div className="admin-edit-grid">
              <label className="admin-field">
                <span className="admin-field-label">Title</span>
                <input
                  type="text"
                  value={offerEditForm.title}
                  onChange={(e) => setForm({ title: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Free Construction Consultation"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Eyebrow / Badge</span>
                <input
                  type="text"
                  value={offerEditForm.eyebrow}
                  onChange={(e) => setForm({ eyebrow: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Consultation"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Status</span>
                <select
                  value={offerEditForm.active ? 'active' : 'inactive'}
                  onChange={(e) => setForm({ active: e.target.value === 'active' })}
                  className="admin-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="admin-field admin-field--wide">
                <span className="admin-field-label">Description</span>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={offerEditForm.description}
                  onChange={(e) => setForm({ description: e.target.value })}
                />
              </label>
              <div className="admin-field admin-field--wide">
                <span className="admin-field-label">Offer Image</span>
                <BannerImageUpload
                  value={offerEditForm.image}
                  onChange={(image) => setForm({ image })}
                  previewAspectRatio="16 / 10"
                  emptyLabel="No image selected"
                  note={
                    <>
                      Recommended: a clear landscape image (~16:10) for consistent offer cards.
                      <br />
                      Different image sizes are supported but may crop differently on mobile.
                    </>
                  }
                  tip="Tip: Offer images appear at the top of each customer Offer card."
                />
              </div>
              <label className="admin-field">
                <span className="admin-field-label">CTA Label</span>
                <input
                  type="text"
                  value={offerEditForm.ctaLabel}
                  onChange={(e) => setForm({ ctaLabel: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Start a Consultation"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Destination Type</span>
                <select
                  value={offerEditForm.destinationType}
                  onChange={(e) => setForm({ destinationType: e.target.value as OfferDestinationType })}
                  className="admin-input"
                >
                  <option value="none">Display only (no link)</option>
                  <option value="internal">Internal path</option>
                  <option value="external">External URL</option>
                </select>
              </label>
              {offerEditForm.destinationType !== 'none' && (
                <label className="admin-field admin-field--wide">
                  <span className="admin-field-label">Destination</span>
                  <input
                    type="text"
                    value={offerEditForm.ctaTarget}
                    onChange={(e) => setForm({ ctaTarget: e.target.value })}
                    className="admin-input"
                    placeholder={offerEditForm.destinationType === 'external' ? 'https://...' : '/quote'}
                  />
                </label>
              )}
              <label className="admin-field">
                <span className="admin-field-label">Start Date</span>
                <input
                  type="date"
                  value={offerEditForm.startDate}
                  onChange={(e) => setForm({ startDate: e.target.value })}
                  className="admin-input"
                />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">End Date</span>
                <input
                  type="date"
                  value={offerEditForm.endDate}
                  onChange={(e) => setForm({ endDate: e.target.value })}
                  className="admin-input"
                />
              </label>
            </div>
            <div className="admin-edit-actions">
              <button className="admin-btn admin-btn--save" onClick={handleAddOffer} type="button">
                Create
              </button>
              <button className="admin-btn admin-btn--cancel" onClick={closeEditForm} type="button">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div
          className={`admin-projects-list admin-banners-list${reorder.listClassName}`}
          ref={reorder.listRef}
        >
          {sortedOffers.length === 0 && <p className="admin-empty">No offers yet.</p>}
          {sortedOffers.map((offer) => (
            <div
              key={offer.id}
              className={`admin-project-row admin-offer-row${offerEditingId === offer.id ? ' admin-project-row--edit' : ''} ${offer.active ? 'admin-project-row--featured' : ''}${reorder.drag?.id === offer.id ? ' admin-project-row--dragging' : ''}`}
              ref={offerEditingId === offer.id ? undefined : reorder.rowRef(offer.id)}
              style={offerEditingId === offer.id ? undefined : reorder.rowStyle(offer.id)}
              onPointerMove={offerEditingId === offer.id ? undefined : reorder.onRowPointerMove}
              onPointerUp={offerEditingId === offer.id ? undefined : reorder.onRowPointerUp}
              onPointerCancel={offerEditingId === offer.id ? undefined : reorder.onRowPointerCancel}
            >
              {offerEditingId === offer.id ? (
                <div className="admin-edit-form">
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Title</span>
                      <input type="text" value={offerEditForm.title} onChange={(e) => setForm({ title: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Eyebrow / Badge</span>
                      <input type="text" value={offerEditForm.eyebrow} onChange={(e) => setForm({ eyebrow: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Status</span>
                      <select value={offerEditForm.active ? 'active' : 'inactive'} onChange={(e) => setForm({ active: e.target.value === 'active' })} className="admin-input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">Description</span>
                      <textarea className="admin-textarea" rows={2} value={offerEditForm.description} onChange={(e) => setForm({ description: e.target.value })} />
                    </label>
                    <div className="admin-field admin-field--wide">
                      <span className="admin-field-label">Offer Image</span>
                      <BannerImageUpload
                        value={offerEditForm.image}
                        onChange={(image) => setForm({ image })}
                        previewAspectRatio="16 / 10"
                        emptyLabel="No image selected"
                      />
                    </div>
                    <label className="admin-field">
                      <span className="admin-field-label">CTA Label</span>
                      <input type="text" value={offerEditForm.ctaLabel} onChange={(e) => setForm({ ctaLabel: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Destination Type</span>
                      <select value={offerEditForm.destinationType} onChange={(e) => setForm({ destinationType: e.target.value as OfferDestinationType })} className="admin-input">
                        <option value="none">Display only (no link)</option>
                        <option value="internal">Internal path</option>
                        <option value="external">External URL</option>
                      </select>
                    </label>
                    {offerEditForm.destinationType !== 'none' && (
                      <label className="admin-field admin-field--wide">
                        <span className="admin-field-label">Destination</span>
                        <input type="text" value={offerEditForm.ctaTarget} onChange={(e) => setForm({ ctaTarget: e.target.value })} className="admin-input" placeholder={offerEditForm.destinationType === 'external' ? 'https://...' : '/quote'} />
                      </label>
                    )}
                    <label className="admin-field">
                      <span className="admin-field-label">Start Date</span>
                      <input type="date" value={offerEditForm.startDate} onChange={(e) => setForm({ startDate: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">End Date</span>
                      <input type="date" value={offerEditForm.endDate} onChange={(e) => setForm({ endDate: e.target.value })} className="admin-input" />
                    </label>
                  </div>
                  <div className="admin-edit-actions">
                    <button className="admin-btn admin-btn--save" onClick={handleSaveOffer} type="button">Save</button>
                    <button className="admin-btn admin-btn--cancel" onClick={closeEditForm} type="button">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-project-info">
                    <div
                      className={`admin-drag-handle${reorder.drag?.id === offer.id ? ' admin-drag-handle--active' : ''}${reorder.pressId === offer.id ? ' admin-drag-handle--pressed' : ''}${!formOpen ? '' : ' admin-drag-handle--disabled'}`}
                      data-drag-handle
                      role="button"
                      aria-label="Reorder offer"
                      aria-disabled={formOpen || undefined}
                      title={formOpen ? 'Reorder disabled while editing' : 'Drag or hold to reorder'}
                      onPointerDown={(e) => reorder.onHandlePointerDown(e, offer.id)}
                      onContextMenu={(e) => {
                        if (!formOpen) e.preventDefault();
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
                    <div className="admin-project-order">#{offer.displayOrder}</div>
                    <div className="admin-offer-thumb">
                      {offer.image ? (
                        <img src={offer.image} alt={offer.title} loading="lazy" />
                      ) : (
                        <span className="admin-offer-thumb-empty" />
                      )}
                    </div>
                    <div className="admin-project-details">
                      <h3 className="admin-project-name">{offer.title}</h3>
                      <p className="admin-project-meta">
                        {offer.eyebrow ? `${offer.eyebrow} · ` : ''}
                        {offerStatusText(offer)} · {destinationLabel(offer)}
                      </p>
                    </div>
                    <span className={`admin-featured-badge ${offer.active ? 'admin-featured-badge--on' : ''}`}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </span>
                    <AdminToggle active={offer.active} onClick={() => handleToggleStatus(offer.id)} />
                  </div>
                  <div className="admin-project-actions">
                    <span className="admin-move-controls" role="group" aria-label={`Reorder ${offer.title}`}>
                      <button
                        className="admin-btn admin-btn--move"
                        onClick={() => handleMove(offer.id, 'up')}
                        type="button"
                        disabled={offerIndex(offer.id) === 0}
                        aria-label={`Move ${offer.title} up`}
                        title={`Move ${offer.title} up`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        className="admin-btn admin-btn--move"
                        onClick={() => handleMove(offer.id, 'down')}
                        type="button"
                        disabled={offerIndex(offer.id) === sortedOffers.length - 1}
                        aria-label={`Move ${offer.title} down`}
                        title={`Move ${offer.title} down`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </span>
                    <button
                      className="admin-btn admin-btn--edit"
                      onClick={() => openEditForm(offer)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn admin-btn--toggle"
                      onClick={() => handleToggleStatus(offer.id)}
                      type="button"
                    >
                      {offer.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="admin-btn admin-btn--cancel admin-banner-delete"
                      onClick={() => {
                        deletingRef.current = false;
                        setDeleteConfirmId(offer.id);
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />
          {toast.message}
        </div>
      )}

      {deletingOffer && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDeleteConfirmId(null)}
          role="presentation"
        >
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm delete offer"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Delete Offer?</h3>
            <p className="admin-modal-text">
              Are you sure you want to delete “{deletingOffer.title}”?
              <span>This action cannot be undone.</span>
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn--cancel"
                onClick={() => setDeleteConfirmId(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => handleDeleteOffer(deletingOffer.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
