import { useState, useCallback, useEffect, useRef } from 'react';
import {
  fetchAdminOffers,
  createOffer,
  updateOffer,
  toggleOffer,
  deleteOffer,
  reorderOffers,
  type Offer,
} from '../../api/offers';
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

interface OfferForm {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  badge: string;
  color: string;
  ctaLabel: string;
  ctaTarget: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

function emptyForm(): OfferForm {
  return {
    title: '', subtitle: '', description: '', icon: 'star', image: '',
    badge: '', color: '', ctaLabel: 'Learn More', ctaTarget: '',
    startDate: '', endDate: '', status: 'active',
  };
}

function buildForm(o: Offer): OfferForm {
  return {
    title: o.title, subtitle: o.subtitle || '', description: o.description || '',
    icon: o.icon || 'star', image: o.image || '', badge: o.badge || '',
    color: o.color || '', ctaLabel: o.ctaLabel || 'Learn More',
    ctaTarget: o.ctaTarget || '', startDate: o.startDate || '',
    endDate: o.endDate || '', status: o.status,
  };
}

function formatShortDate(iso: string): string {
  const key = iso.slice(0, 10);
  if (!key) return iso;
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function offerStatusText(o: Offer): string {
  if (o.status !== 'active') return 'Inactive';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const s = o.startDate?.slice(0, 10) || '';
  const e = o.endDate?.slice(0, 10) || '';
  if (s && s > today) return `Scheduled · From ${formatShortDate(s)}`;
  if (e && e < today) return `Expired · Until ${formatShortDate(e)}`;
  if (s && e) return `Active · ${formatShortDate(s)} → ${formatShortDate(e)}`;
  if (e) return `Active · Until ${formatShortDate(e)}`;
  if (s) return `Active · From ${formatShortDate(s)}`;
  return 'Active';
}

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OfferForm>(emptyForm());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, isError });
    toastTimer.current = window.setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  useEffect(() => { return () => { if (toastTimer.current !== null) window.clearTimeout(toastTimer.current); }; }, []);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminOffers();
      setOffers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load offers', true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (deleteConfirmId === null) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setDeleteConfirmId(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [deleteConfirmId]);

  const openAdd = useCallback(() => { setEditingId(null); setShowForm(true); setDeleteConfirmId(null); setForm(emptyForm()); }, []);
  const openEdit = useCallback((o: Offer) => { setShowForm(false); setEditingId(o._id); setDeleteConfirmId(null); setForm(buildForm(o)); }, []);
  const closeForm = useCallback(() => { setEditingId(null); setShowForm(false); setForm(emptyForm()); }, []);
  const setF = useCallback((patch: Partial<OfferForm>) => setForm((p) => ({ ...p, ...patch })), []);

  const handleSave = useCallback(async () => {
    const title = form.title.trim();
    if (!title) { showToast('Title is required', true); return; }
    const payload = {
      title, subtitle: form.subtitle.trim(), description: form.description.trim(),
      icon: form.icon.trim() || 'star', image: form.image, badge: form.badge.trim(),
      color: form.color.trim(), ctaLabel: form.ctaLabel.trim() || 'Learn More',
      ctaTarget: form.ctaTarget.trim(), startDate: form.startDate, endDate: form.endDate,
      status: form.status,
    };
    try {
      if (showForm && !editingId) {
        const created = await createOffer(payload);
        setOffers((p) => [...p, created]);
        showToast('Offer created');
      } else if (editingId) {
        const updated = await updateOffer(editingId, payload);
        setOffers((p) => p.map((o) => o._id === editingId ? updated : o));
        showToast('Changes saved');
      }
      closeForm();
    } catch (err: any) {
      showToast(err.message || 'Failed to save', true);
    }
  }, [editingId, showForm, form, closeForm, showToast]);

  const handleToggle = useCallback(async (id: string) => {
    try {
      const updated = await toggleOffer(id);
      setOffers((p) => p.map((o) => o._id === id ? updated : o));
    } catch (err: any) {
      showToast(err.message || 'Failed to update', true);
    }
  }, [showToast]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteOffer(id);
      setOffers((p) => p.filter((o) => o._id !== id));
      setDeleteConfirmId(null);
      showToast('Offer deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', true);
    }
  }, [showToast]);

  const sorted = [...offers].sort((a, b) => a.displayOrder - b.displayOrder);
  const deletingOffer = offers.find((o) => o._id === deleteConfirmId) ?? null;
  const formOpen = showForm || editingId !== null;

  if (loading) {
    return (
      <div className="admin-page admin-page--banners">
        <div className="admin-section admin-section--primary">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Offers</h2>
            <p className="admin-section-desc">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-page--banners">
      <div className="admin-section admin-section--primary">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Offers</h2>
            <p className="admin-section-desc">Manage promotional offers shown on the customer Offers page.</p>
          </div>
          <div className="admin-actions">
            <button className="admin-btn admin-btn--add" onClick={openAdd} type="button">+ Add Offer</button>
          </div>
        </div>

        {showForm && !editingId && (
          <div className="admin-edit-form">
            <div className="admin-edit-grid">
              <label className="admin-field">
                <span className="admin-field-label">Title *</span>
                <input type="text" className="admin-input" value={form.title} onChange={(e) => setF({ title: e.target.value })} placeholder="e.g. Free Consultation" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Badge</span>
                <input type="text" className="admin-input" value={form.badge} onChange={(e) => setF({ badge: e.target.value })} placeholder="e.g. FREE" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Status</span>
                <select className="admin-input" value={form.status} onChange={(e) => setF({ status: e.target.value as 'active' | 'inactive' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="admin-field admin-field--wide">
                <span className="admin-field-label">Subtitle</span>
                <input type="text" className="admin-input" value={form.subtitle} onChange={(e) => setF({ subtitle: e.target.value })} />
              </label>
              <label className="admin-field admin-field--wide">
                <span className="admin-field-label">Description</span>
                <textarea className="admin-textarea" rows={2} value={form.description} onChange={(e) => setF({ description: e.target.value })} />
              </label>
              <div className="admin-field admin-field--wide">
                <span className="admin-field-label">Offer Image</span>
                <BannerImageUpload value={form.image} onChange={(image) => setF({ image })} previewAspectRatio="16 / 10" emptyLabel="No image selected" />
              </div>
              <label className="admin-field">
                <span className="admin-field-label">CTA Label</span>
                <input type="text" className="admin-input" value={form.ctaLabel} onChange={(e) => setF({ ctaLabel: e.target.value })} />
              </label>
              <label className="admin-field admin-field--wide">
                <span className="admin-field-label">CTA Target</span>
                <input type="text" className="admin-input" value={form.ctaTarget} onChange={(e) => setF({ ctaTarget: e.target.value })} placeholder="/quote or https://..." />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Start Date</span>
                <input type="date" className="admin-input" value={form.startDate} onChange={(e) => setF({ startDate: e.target.value })} />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">End Date</span>
                <input type="date" className="admin-input" value={form.endDate} onChange={(e) => setF({ endDate: e.target.value })} />
              </label>
            </div>
            <div className="admin-edit-actions">
              <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">Create</button>
              <button className="admin-btn admin-btn--cancel" onClick={closeForm} type="button">Cancel</button>
            </div>
          </div>
        )}

        <div className="admin-projects-list admin-banners-list">
          {sorted.length === 0 && <p className="admin-empty">No offers yet.</p>}
          {sorted.map((offer) => (
            <div key={offer._id} className={`admin-project-row admin-offer-row${editingId === offer._id ? ' admin-project-row--edit' : ''} ${offer.status === 'active' ? 'admin-project-row--featured' : ''}`}>
              {editingId === offer._id ? (
                <div className="admin-edit-form">
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Title *</span>
                      <input type="text" className="admin-input" value={form.title} onChange={(e) => setF({ title: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Badge</span>
                      <input type="text" className="admin-input" value={form.badge} onChange={(e) => setF({ badge: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Status</span>
                      <select className="admin-input" value={form.status} onChange={(e) => setF({ status: e.target.value as 'active' | 'inactive' })}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </label>
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">Subtitle</span>
                      <input type="text" className="admin-input" value={form.subtitle} onChange={(e) => setF({ subtitle: e.target.value })} />
                    </label>
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">Description</span>
                      <textarea className="admin-textarea" rows={2} value={form.description} onChange={(e) => setF({ description: e.target.value })} />
                    </label>
                    <div className="admin-field admin-field--wide">
                      <span className="admin-field-label">Offer Image</span>
                      <BannerImageUpload value={form.image} onChange={(image) => setF({ image })} previewAspectRatio="16 / 10" emptyLabel="No image selected" />
                    </div>
                    <label className="admin-field">
                      <span className="admin-field-label">CTA Label</span>
                      <input type="text" className="admin-input" value={form.ctaLabel} onChange={(e) => setF({ ctaLabel: e.target.value })} />
                    </label>
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">CTA Target</span>
                      <input type="text" className="admin-input" value={form.ctaTarget} onChange={(e) => setF({ ctaTarget: e.target.value })} placeholder="/quote or https://..." />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Start Date</span>
                      <input type="date" className="admin-input" value={form.startDate} onChange={(e) => setF({ startDate: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">End Date</span>
                      <input type="date" className="admin-input" value={form.endDate} onChange={(e) => setF({ endDate: e.target.value })} />
                    </label>
                  </div>
                  <div className="admin-edit-actions">
                    <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">Save</button>
                    <button className="admin-btn admin-btn--cancel" onClick={closeForm} type="button">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-project-info">
                    <div className="admin-offer-thumb">
                      {offer.image ? (
                        <img src={offer.image} alt={offer.title} loading="lazy" />
                      ) : (
                        <span className="admin-offer-thumb-empty" />
                      )}
                    </div>
                    <div className="admin-project-details">
                      <h3 className="admin-project-name">{offer.title}</h3>
                      <p className="admin-project-meta">{offer.badge ? `${offer.badge} · ` : ''}{offerStatusText(offer)}</p>
                    </div>
                    <span className={`admin-featured-badge ${offer.status === 'active' ? 'admin-featured-badge--on' : ''}`}>
                      {offer.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <AdminToggle active={offer.status === 'active'} onClick={() => handleToggle(offer._id)} />
                  </div>
                  <div className="admin-project-actions">
                    <button className="admin-btn admin-btn--edit" onClick={() => openEdit(offer)} type="button">Edit</button>
                    <button className="admin-btn admin-btn--cancel admin-banner-delete" onClick={() => setDeleteConfirmId(offer._id)} type="button">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />{toast.message}
        </div>
      )}

      {deletingOffer && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="admin-modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Delete Offer?</h3>
            <p className="admin-modal-text">Are you sure you want to delete &ldquo;{deletingOffer.title}&rdquo;?</p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn--cancel" onClick={() => setDeleteConfirmId(null)} type="button">Cancel</button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(deletingOffer._id)} type="button">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
