import { useState, useCallback, useEffect, useRef } from 'react';
import { useServiceReorder } from '../../hooks/useServiceReorder';
import {
  getQuickFixBanners,
  addQuickFixBanner,
  updateQuickFixBanner,
  deleteQuickFixBanner,
  resetQuickFixBanners,
  moveQuickFixBanner,
  reorderQuickFixBanners,
} from '../../data/quickfix-banners';
import { getQuickFixCategoryName } from '../../data/quickfix';
import type { QuickFixBanner, QuickFixBannerDestinationType } from '../../data/quickfix-banners';
import BannerImageUpload from './BannerImageUpload';
import './AdminPage.css';
import './AdminShell.css';

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

function bannerStatusText(banner: QuickFixBanner): string {
  const range = `${formatShortDate(banner.startDate)} → ${formatShortDate(banner.endDate)}`;
  if (!banner.active) return `Inactive · ${range}`;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const startKey = banner.startDate.slice(0, 10);
  const endKey = banner.endDate.slice(0, 10);

  if (startKey && startKey > today) {
    return `Scheduled · ${range}`;
  }
  if (endKey && endKey < today) {
    return `Expired · ${range}`;
  }
  return `Active · ${range}`;
}

function destinationLabel(banner: QuickFixBanner): string {
  switch (banner.destinationType) {
    case 'service':
      return `Quick Fix service · ${banner.destination}`;
    case 'category':
      return `Quick Fix category · ${getQuickFixCategoryName(banner.destination)}`;
    case 'external':
      return `External · ${banner.destination || '(no URL)'}`;
    default:
      return 'Display only';
  }
}

export default function QuickFixBannersSection() {
  const [banners, setBanners] = useState<QuickFixBanner[]>(() => getQuickFixBanners());
  const [bannerEditingId, setBannerEditingId] = useState<string | null>(null);
  const [bannerEditForm, setBannerEditForm] = useState<Partial<QuickFixBanner>>({});
  const [showBannerForm, setShowBannerForm] = useState(false);
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

  const handleAddBanner = useCallback(() => {
    const now = new Date().toISOString().slice(0, 10);
    const banner: Omit<QuickFixBanner, 'id' | 'displayOrder'> & { displayOrder?: number } = {
      image: bannerEditForm.image || '',
      internalName: bannerEditForm.internalName?.trim() || 'Untitled banner',
      active: bannerEditForm.active ?? false,
      startDate: bannerEditForm.startDate || now,
      endDate: bannerEditForm.endDate || now,
      ctaLabel: bannerEditForm.ctaLabel?.trim() || '',
      destinationType: bannerEditForm.destinationType ?? 'none',
      destination: bannerEditForm.destination || '',
    };
    try {
      const updated = addQuickFixBanner(banner);
      setBanners(updated);
      setBannerEditForm({});
      setShowBannerForm(false);
      showToast('Advertisement added');
    } catch {
      showToast('Storage limit reached. Remove some banners or use smaller images before saving.', true);
    }
  }, [bannerEditForm, showToast]);

  const handleSaveBanner = useCallback(() => {
    if (!bannerEditingId) return;
    const current = banners.find((b) => b.id === bannerEditingId);
    if (!current) return;
    const updates: Partial<QuickFixBanner> = {
      image: bannerEditForm.image,
      internalName: bannerEditForm.internalName?.trim() || current.internalName,
      active: bannerEditForm.active ?? current.active,
      startDate: bannerEditForm.startDate ?? current.startDate,
      endDate: bannerEditForm.endDate ?? current.endDate,
      ctaLabel: bannerEditForm.ctaLabel?.trim() ?? current.ctaLabel,
      destinationType: bannerEditForm.destinationType ?? current.destinationType,
      destination: bannerEditForm.destination ?? current.destination,
    };
    try {
      const updated = updateQuickFixBanner(bannerEditingId, updates);
      setBanners(updated);
      setBannerEditingId(null);
      setBannerEditForm({});
      showToast('Changes saved');
    } catch {
      showToast('Storage limit reached. Remove some banners or use smaller images before saving.', true);
    }
  }, [bannerEditingId, banners, bannerEditForm, showToast]);

  const handleDeleteBanner = useCallback((id: string) => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    const updated = deleteQuickFixBanner(id);
    setBanners(updated);
    setDeleteConfirmId(null);
    showToast('Banner deleted');
  }, [showToast]);

  const handleToggleStatus = useCallback(
    (id: string) => {
      const banner = banners.find((b) => b.id === id);
      if (!banner) return;
      const updated = updateQuickFixBanner(id, { active: !banner.active });
      setBanners(updated);
    },
    [banners]
  );

  const handleMove = useCallback((id: string, direction: 'up' | 'down') => {
    const updated = moveQuickFixBanner(id, direction);
    setBanners(updated);
    showToast(direction === 'up' ? 'Banner moved up' : 'Banner moved down');
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
    setBanners(resetQuickFixBanners());
    setBannerEditingId(null);
    setBannerEditForm({});
    setDeleteConfirmId(null);
    showToast('Quick Fix banners restored to defaults');
  }, [resetConfirm, showToast]);

  const sortedBanners = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
  const bannerIndex = (id: string) => sortedBanners.findIndex((b) => b.id === id);
  const deletingBanner = banners.find((b) => b.id === deleteConfirmId) ?? null;

  const formOpen = showBannerForm || bannerEditingId !== null;

  const reorder = useServiceReorder({
    enabled: !formOpen,
    items: sortedBanners,
    fullIds: sortedBanners.map((b) => b.id),
    onCommitted: (orderedIds) => {
      const reordered = reorderQuickFixBanners(orderedIds);
      setBanners(reordered);
      showToast('Banner order updated');
    },
  });

  return (
    <div className="admin-page admin-page--banners">
      <div className="admin-section admin-section--primary">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Quick Fix Hero Advertisements</h2>
            <p className="admin-section-desc">
              Manage advertisements displayed in the Quick Fix Hero slider.
              Banners appear in display order — active banners within their date window are shown to customers.
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="admin-btn admin-btn--add"
              onClick={() => { setShowBannerForm(true); setBannerEditingId(null); setBannerEditForm({}); setDeleteConfirmId(null); }}
              type="button"
            >
              + Add Advertisement
            </button>
            <button className="admin-btn admin-btn--reset" onClick={handleResetClick} type="button">
              {resetConfirm ? 'Confirm reset?' : 'Reset'}
            </button>
          </div>
        </div>

        {showBannerForm && !bannerEditingId && (
          <div className="admin-edit-form">
            <div className="admin-edit-grid">
              <label className="admin-field">
                <span className="admin-field-label">Internal Name</span>
                <input type="text" value={bannerEditForm.internalName || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, internalName: e.target.value })} className="admin-input" placeholder="e.g. QF Electrical Promo" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Status</span>
                <select value={bannerEditForm.active ? 'active' : 'inactive'} onChange={(e) => setBannerEditForm({ ...bannerEditForm, active: e.target.value === 'active' })} className="admin-input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <div className="admin-field admin-field--wide">
                <span className="admin-field-label">Banner Image</span>
                <BannerImageUpload
                  value={bannerEditForm.image || ''}
                  onChange={(image) => setBannerEditForm({ ...bannerEditForm, image })}
                  previewAspectRatio="2.9 / 1"
                  emptyLabel="No image selected"
                  note={
                    <>
                      Recommended: use a clear landscape image for consistent Quick Fix Hero banners.
                      <br />
                      Different image sizes are supported, but may crop differently on mobile.
                    </>
                  }
                  tip="Tip: Uploaded images may be compressed to keep storage small."
                />
              </div>
              <label className="admin-field">
                <span className="admin-field-label">CTA Label</span>
                <input type="text" value={bannerEditForm.ctaLabel || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, ctaLabel: e.target.value })} className="admin-input" placeholder="e.g. Explore Electrical Repairs" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Destination Type</span>
                <select value={bannerEditForm.destinationType || 'none'} onChange={(e) => setBannerEditForm({ ...bannerEditForm, destinationType: e.target.value as QuickFixBannerDestinationType })} className="admin-input">
                  <option value="none">Display only (no link)</option>
                  <option value="service">Quick Fix service</option>
                  <option value="category">Quick Fix category</option>
                  <option value="external">External URL</option>
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Destination</span>
                <input type="text" value={bannerEditForm.destination || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, destination: e.target.value })} className="admin-input" placeholder={bannerEditForm.destinationType === 'service' ? 'service id (e.g. plumbing-repair)' : bannerEditForm.destinationType === 'category' ? 'category id (e.g. electrical)' : 'https://...'} />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Start Date</span>
                <input type="date" value={bannerEditForm.startDate || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, startDate: e.target.value })} className="admin-input" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">End Date</span>
                <input type="date" value={bannerEditForm.endDate || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, endDate: e.target.value })} className="admin-input" />
              </label>
            </div>
            <div className="admin-edit-actions">
              <button className="admin-btn admin-btn--save" onClick={handleAddBanner} type="button">Create</button>
              <button className="admin-btn admin-btn--cancel" onClick={() => { setShowBannerForm(false); setBannerEditForm({}); }} type="button">Cancel</button>
            </div>
          </div>
        )}

        <div
          className={`admin-projects-list admin-banners-list${reorder.listClassName}`}
          ref={reorder.listRef}
        >
          {banners.length === 0 && (
            <p className="admin-empty">No advertisements yet.</p>
          )}
          {sortedBanners.map((banner) => (
            <div
              key={banner.id}
              className={`admin-project-row admin-banner-row${bannerEditingId === banner.id ? ' admin-project-row--edit' : ''} ${banner.active ? 'admin-project-row--featured' : ''}${reorder.drag?.id === banner.id ? ' admin-project-row--dragging' : ''}`}
              ref={bannerEditingId === banner.id ? undefined : reorder.rowRef(banner.id)}
              style={bannerEditingId === banner.id ? undefined : reorder.rowStyle(banner.id)}
              onPointerMove={bannerEditingId === banner.id ? undefined : reorder.onRowPointerMove}
              onPointerUp={bannerEditingId === banner.id ? undefined : reorder.onRowPointerUp}
              onPointerCancel={bannerEditingId === banner.id ? undefined : reorder.onRowPointerCancel}
            >
              {bannerEditingId === banner.id ? (
                <div className="admin-edit-form">
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Internal Name</span>
                      <input type="text" value={bannerEditForm.internalName || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, internalName: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Status</span>
                      <select value={bannerEditForm.active ? 'active' : 'inactive'} onChange={(e) => setBannerEditForm({ ...bannerEditForm, active: e.target.value === 'active' })} className="admin-input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <div className="admin-field admin-field--wide" style={{ gridColumn: 'span 2' }}>
                      <span className="admin-field-label">Banner Image</span>
                      <BannerImageUpload
                        value={bannerEditForm.image || ''}
                        onChange={(image) => setBannerEditForm({ ...bannerEditForm, image })}
                        previewAspectRatio="2.9 / 1"
                        emptyLabel="No image selected"
                        note={
                          <>
                            Recommended: use a clear landscape image for consistent Quick Fix Hero banners.
                            <br />
                            Different image sizes are supported, but may crop differently on mobile.
                          </>
                        }
                        tip="Tip: Uploaded images may be compressed to keep storage small."
                      />
                    </div>
                    <label className="admin-field">
                      <span className="admin-field-label">CTA Label</span>
                      <input type="text" value={bannerEditForm.ctaLabel || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, ctaLabel: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Destination Type</span>
                      <select value={bannerEditForm.destinationType || 'none'} onChange={(e) => setBannerEditForm({ ...bannerEditForm, destinationType: e.target.value as QuickFixBannerDestinationType })} className="admin-input">
                        <option value="none">Display only (no link)</option>
                        <option value="service">Quick Fix service</option>
                        <option value="category">Quick Fix category</option>
                        <option value="external">External URL</option>
                      </select>
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Destination</span>
                      <input type="text" value={bannerEditForm.destination || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, destination: e.target.value })} className="admin-input" placeholder={bannerEditForm.destinationType === 'service' ? 'service id (e.g. plumbing-repair)' : bannerEditForm.destinationType === 'category' ? 'category id (e.g. electrical)' : 'https://...'} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Start Date</span>
                      <input type="date" value={bannerEditForm.startDate || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, startDate: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">End Date</span>
                      <input type="date" value={bannerEditForm.endDate || ''} onChange={(e) => setBannerEditForm({ ...bannerEditForm, endDate: e.target.value })} className="admin-input" />
                    </label>
                  </div>
                  <div className="admin-edit-actions">
                    <button className="admin-btn admin-btn--save" onClick={handleSaveBanner} type="button">Save</button>
                    <button className="admin-btn admin-btn--cancel" onClick={() => { setBannerEditingId(null); setBannerEditForm({}); }} type="button">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-project-info">
                    <div
                      className={`admin-drag-handle${reorder.drag?.id === banner.id ? ' admin-drag-handle--active' : ''}${reorder.pressId === banner.id ? ' admin-drag-handle--pressed' : ''}${!formOpen ? '' : ' admin-drag-handle--disabled'}`}
                      data-drag-handle
                      role="button"
                      aria-label="Reorder banner"
                      aria-disabled={formOpen || undefined}
                      title={formOpen ? 'Reorder disabled while editing' : 'Drag or hold to reorder'}
                      onPointerDown={(e) => reorder.onHandlePointerDown(e, banner.id)}
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
                    <div className="admin-project-order">P{banner.displayOrder}</div>
                    <div className="admin-project-details">
                      <h3 className="admin-project-name">{banner.internalName}</h3>
                      <p className="admin-project-meta">
                        {bannerStatusText(banner)} · {destinationLabel(banner)}
                      </p>
                    </div>
                    <span className={`admin-featured-badge ${banner.active ? 'admin-featured-badge--on' : ''}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={banner.active}
                      aria-label={`${banner.internalName}: ${banner.active ? 'Active' : 'Inactive'}`}
                      title={banner.active ? 'Active' : 'Inactive'}
                      className={`admin-toggle admin-banner-toggle${banner.active ? ' admin-toggle--on' : ''}`}
                      onClick={() => handleToggleStatus(banner.id)}
                    >
                      <span className="admin-toggle-track" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="admin-project-actions">
                    <span className="admin-move-controls" role="group" aria-label={`Reorder ${banner.internalName}`}>
                      <button
                        className="admin-btn admin-btn--move"
                        onClick={() => handleMove(banner.id, 'up')}
                        type="button"
                        disabled={bannerIndex(banner.id) === 0}
                        aria-label={`Move ${banner.internalName} up`}
                        title={`Move ${banner.internalName} up`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        className="admin-btn admin-btn--move"
                        onClick={() => handleMove(banner.id, 'down')}
                        type="button"
                        disabled={bannerIndex(banner.id) === sortedBanners.length - 1}
                        aria-label={`Move ${banner.internalName} down`}
                        title={`Move ${banner.internalName} down`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </span>
                    {(
                      <>
                        <button
                          className="admin-btn admin-btn--edit"
                          onClick={() => { setBannerEditingId(banner.id); setBannerEditForm({ ...banner }); setDeleteConfirmId(null); }}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--toggle"
                          onClick={() => handleToggleStatus(banner.id)}
                          type="button"
                        >
                          {banner.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="admin-btn admin-btn--cancel admin-banner-delete"
                          onClick={() => {
                            deletingRef.current = false;
                            setDeleteConfirmId(banner.id);
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                      </>
                    )}
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

      {deletingBanner && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDeleteConfirmId(null)}
          role="presentation"
        >
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm delete advertisement"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Delete Advertisement?</h3>
            <p className="admin-modal-text">
              Are you sure you want to delete “{deletingBanner.internalName}”?
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
                onClick={() => handleDeleteBanner(deletingBanner.id)}
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
