import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getProFixHeroAds,
  addProFixHeroAd,
  updateProFixHeroAd,
  deleteProFixHeroAd,
  resetProFixHeroAds,
  isSeededHeroAd,
} from '../../data/hero-advertisements';
import type { HeroAdvertisement } from '../../data/hero-advertisements';
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
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function bannerStatusText(ad: HeroAdvertisement): string {
  const prefix = ad.eyebrow ? `${ad.eyebrow} · ` : '';
  if (isSeededHeroAd(ad.id)) {
    return `${prefix}${ad.status === 'active' ? 'Active' : 'Inactive'} · Default banner`;
  }
  if (ad.status !== 'active') return `${prefix}Inactive`;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const startKey = ad.startDate.slice(0, 10);
  const endKey = ad.endDate.slice(0, 10);

  if (startKey && startKey > today) {
    return `${prefix}Scheduled · Starts ${formatShortDate(startKey)}`;
  }
  if (endKey && endKey < today) {
    return `${prefix}Expired`;
  }
  return `${prefix}Active${endKey ? ` · Until ${formatShortDate(endKey)}` : ''}`;
}

export default function ProFixBannersSection() {
  const [heroAds, setHeroAds] = useState<HeroAdvertisement[]>(() => getProFixHeroAds());
  const [adEditingId, setAdEditingId] = useState<string | null>(null);
  const [adEditForm, setAdEditForm] = useState<Partial<HeroAdvertisement>>({});
  const [showAdForm, setShowAdForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, isError });
    toastTimer.current = window.setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const handleAddAd = useCallback(() => {
    const now = new Date().toISOString().split('T')[0];
    const newAd: Omit<HeroAdvertisement, 'id' | 'createdAt' | 'updatedAt'> = {
      placement: 'pro-fix-hero',
      type: 'advertisement',
      eyebrow: adEditForm.eyebrow || '',
      title: adEditForm.title || '',
      description: adEditForm.description || '',
      image: adEditForm.image || '',
      mobileImage: adEditForm.mobileImage,
      ctaLabel: adEditForm.ctaLabel || 'Get Quote',
      ctaTarget: adEditForm.ctaTarget || '/quote',
      status: adEditForm.status || 'inactive',
      startDate: adEditForm.startDate || now,
      endDate: adEditForm.endDate || now,
      priority: adEditForm.priority || 1,
    };
    try {
      const updated = addProFixHeroAd(newAd);
      setHeroAds(updated);
      setAdEditForm({});
      setShowAdForm(false);
    } catch {
      showToast('Storage limit reached. Remove some banners or use smaller images before saving.', true);
    }
  }, [adEditForm, showToast]);

  const handleSaveAd = useCallback(() => {
    if (!adEditingId) return;
    try {
      const updated = updateProFixHeroAd(adEditingId, adEditForm);
      setHeroAds(updated);
      setAdEditingId(null);
      setAdEditForm({});
    } catch {
      showToast('Storage limit reached. Remove some banners or use smaller images before saving.', true);
    }
  }, [adEditingId, adEditForm, showToast]);

  const handleDeleteAd = useCallback((id: string) => {
    const updated = deleteProFixHeroAd(id);
    setHeroAds(updated);
    setDeleteConfirmId(null);
    showToast('Banner deleted');
  }, [showToast]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  const handleToggleStatus = useCallback(
    (id: string) => {
      const ad = heroAds.find((a) => a.id === id);
      if (!ad) return;
      const updated = updateProFixHeroAd(id, { status: ad.status === 'active' ? 'inactive' : 'active' });
      setHeroAds(updated);
    },
    [heroAds]
  );

  const handleResetAds = useCallback(() => {
    const updated = resetProFixHeroAds();
    setHeroAds(updated);
  }, []);

  return (
    <div className="admin-page admin-page--banners">
      <div className="admin-section admin-section--primary">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Pro Fix Hero Advertisements</h2>
            <p className="admin-section-desc">
              Manage banners displayed in the Pro Fix Hero slider.
              Default banners appear first, followed by your advertisements.
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="admin-btn admin-btn--add"
              onClick={() => { setShowAdForm(true); setAdEditingId(null); setAdEditForm({}); setDeleteConfirmId(null); }}
              type="button"
            >
              + Add Advertisement
            </button>
            <button className="admin-btn admin-btn--reset" onClick={handleResetAds} type="button">
              Reset
            </button>
          </div>
        </div>

        {showAdForm && !adEditingId && (
          <div className="admin-edit-form">
            <div className="admin-edit-grid">
              <label className="admin-field">
                <span className="admin-field-label">Eyebrow</span>
                <input type="text" value={adEditForm.eyebrow || ''} onChange={(e) => setAdEditForm({ ...adEditForm, eyebrow: e.target.value })} className="admin-input" placeholder="e.g. Limited Time Offer" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Title</span>
                <input type="text" value={adEditForm.title || ''} onChange={(e) => setAdEditForm({ ...adEditForm, title: e.target.value })} className="admin-input" placeholder="Advertisement headline" />
              </label>
              <label className="admin-field admin-field--wide">
                <span className="admin-field-label">Description</span>
                <input type="text" value={adEditForm.description || ''} onChange={(e) => setAdEditForm({ ...adEditForm, description: e.target.value })} className="admin-input" placeholder="Short description" />
              </label>
              <div className="admin-field admin-field--wide">
                <span className="admin-field-label">Banner Image</span>
                <BannerImageUpload value={adEditForm.image || ''} onChange={(image) => setAdEditForm({ ...adEditForm, image })} />
              </div>
              <label className="admin-field">
                <span className="admin-field-label">CTA Label</span>
                <input type="text" value={adEditForm.ctaLabel || ''} onChange={(e) => setAdEditForm({ ...adEditForm, ctaLabel: e.target.value })} className="admin-input" placeholder="Get Quote" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">CTA Target</span>
                <input type="text" value={adEditForm.ctaTarget || ''} onChange={(e) => setAdEditForm({ ...adEditForm, ctaTarget: e.target.value })} className="admin-input" placeholder="/quote" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Status</span>
                <select value={adEditForm.status || 'inactive'} onChange={(e) => setAdEditForm({ ...adEditForm, status: e.target.value as HeroAdvertisement['status'] })} className="admin-input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Priority</span>
                <input type="number" min="1" value={adEditForm.priority || 1} onChange={(e) => setAdEditForm({ ...adEditForm, priority: parseInt(e.target.value) || 1 })} className="admin-input" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Start Date</span>
                <input type="date" value={adEditForm.startDate || ''} onChange={(e) => setAdEditForm({ ...adEditForm, startDate: e.target.value })} className="admin-input" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">End Date</span>
                <input type="date" value={adEditForm.endDate || ''} onChange={(e) => setAdEditForm({ ...adEditForm, endDate: e.target.value })} className="admin-input" />
              </label>
            </div>
            <div className="admin-edit-actions">
              <button className="admin-btn admin-btn--save" onClick={handleAddAd} type="button">Create</button>
              <button className="admin-btn admin-btn--cancel" onClick={() => { setShowAdForm(false); setAdEditForm({}); }} type="button">Cancel</button>
            </div>
          </div>
        )}

        <div className="admin-projects-list admin-banners-list">
          {heroAds.length === 0 && (
            <p className="admin-empty">No advertisements created yet.</p>
          )}
          {heroAds.map((ad) => (
            <div key={ad.id} className={`admin-project-row admin-banner-row${adEditingId === ad.id ? ' admin-project-row--edit' : ''} ${ad.status === 'active' ? 'admin-project-row--featured' : ''}`}>
              {adEditingId === ad.id ? (
                <div className="admin-edit-form">
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Eyebrow</span>
                      <input type="text" value={adEditForm.eyebrow || ''} onChange={(e) => setAdEditForm({ ...adEditForm, eyebrow: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Title</span>
                      <input type="text" value={adEditForm.title || ''} onChange={(e) => setAdEditForm({ ...adEditForm, title: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">Description</span>
                      <input type="text" value={adEditForm.description || ''} onChange={(e) => setAdEditForm({ ...adEditForm, description: e.target.value })} className="admin-input" />
                    </label>
                    <div className="admin-field admin-field--wide">
                      <span className="admin-field-label">Banner Image</span>
                      <BannerImageUpload value={adEditForm.image || ''} onChange={(image) => setAdEditForm({ ...adEditForm, image })} />
                    </div>
                    <label className="admin-field">
                      <span className="admin-field-label">CTA Label</span>
                      <input type="text" value={adEditForm.ctaLabel || ''} onChange={(e) => setAdEditForm({ ...adEditForm, ctaLabel: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">CTA Target</span>
                      <input type="text" value={adEditForm.ctaTarget || ''} onChange={(e) => setAdEditForm({ ...adEditForm, ctaTarget: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Status</span>
                      <select value={adEditForm.status || 'inactive'} onChange={(e) => setAdEditForm({ ...adEditForm, status: e.target.value as HeroAdvertisement['status'] })} className="admin-input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Priority</span>
                      <input type="number" min="1" value={adEditForm.priority || 1} onChange={(e) => setAdEditForm({ ...adEditForm, priority: parseInt(e.target.value) || 1 })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Start Date</span>
                      <input type="date" value={adEditForm.startDate || ''} onChange={(e) => setAdEditForm({ ...adEditForm, startDate: e.target.value })} className="admin-input" />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">End Date</span>
                      <input type="date" value={adEditForm.endDate || ''} onChange={(e) => setAdEditForm({ ...adEditForm, endDate: e.target.value })} className="admin-input" />
                    </label>
                  </div>
                  <div className="admin-edit-actions">
                    <button className="admin-btn admin-btn--save" onClick={handleSaveAd} type="button">Save</button>
                    <button className="admin-btn admin-btn--cancel" onClick={() => { setAdEditingId(null); setAdEditForm({}); }} type="button">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-project-info">
                    <div className="admin-project-order">P{ad.priority}</div>
                    <div className="admin-project-details">
                      <h3 className="admin-project-name">{ad.title || '(No title)'}</h3>
                      <p className="admin-project-meta">{bannerStatusText(ad)}</p>
                    </div>
                    <span className={`admin-featured-badge ${ad.status === 'active' ? 'admin-featured-badge--on' : ''}`}>
                      {ad.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={ad.status === 'active'}
                      aria-label={`${ad.title || 'Banner'}: ${ad.status === 'active' ? 'Active' : 'Inactive'}`}
                      title={ad.status === 'active' ? 'Active' : 'Inactive'}
                      className={`admin-toggle admin-banner-toggle${ad.status === 'active' ? ' admin-toggle--on' : ''}`}
                      onClick={() => handleToggleStatus(ad.id)}
                    >
                      <span className="admin-toggle-track" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="admin-project-actions">
                    {deleteConfirmId === ad.id ? (
                      <div className="admin-banner-confirm" role="alertdialog" aria-label="Confirm delete advertisement">
                        <p className="admin-banner-confirm-text">
                          Delete this advertisement?
                          <span>This action cannot be undone.</span>
                        </p>
                        <div className="admin-banner-confirm-actions">
                          <button className="admin-btn admin-btn--cancel" onClick={handleCancelDelete} type="button">Cancel</button>
                          <button className="admin-btn admin-btn--danger" onClick={() => handleDeleteAd(ad.id)} type="button">Delete</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className="admin-btn admin-btn--edit"
                          onClick={() => { setAdEditingId(ad.id); setAdEditForm({ ...ad }); setDeleteConfirmId(null); }}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--toggle"
                          onClick={() => handleToggleStatus(ad.id)}
                          type="button"
                        >
                          {ad.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="admin-btn admin-btn--cancel admin-banner-delete"
                          onClick={() => handleDeleteClick(ad.id)}
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
    </div>
  );
}