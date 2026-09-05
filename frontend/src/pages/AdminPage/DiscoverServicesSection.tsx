import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAdminMarketingServices,
  createMarketingService,
  updateMarketingService,
  toggleMarketingService,
  deleteMarketingService,
  type MarketingService,
} from '../../api/marketing';
import AdminToggle from './AdminToggle';
import './AdminPage.css';
import './AdminShell.css';

const DEFAULT_TOAST_MS = 2600;

interface ServiceForm {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  ctaLabel: string;
  status: 'active' | 'inactive';
}

interface ToastState {
  message: string;
  isError: boolean;
}

function emptyForm(): ServiceForm {
  return { title: '', subtitle: '', description: '', icon: 'building', ctaLabel: 'Learn More', status: 'active' };
}

function buildForm(s: MarketingService): ServiceForm {
  return {
    title: s.title,
    subtitle: s.subtitle || '',
    description: s.description || '',
    icon: s.icon || 'building',
    ctaLabel: s.ctaLabel || 'Learn More',
    status: s.status,
  };
}

export default function DiscoverServicesSection() {
  const [services, setServices] = useState<MarketingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState<ServiceForm>(emptyForm());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, isError });
    toastTimer.current = window.setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  useEffect(() => { return () => { if (toastTimer.current !== null) window.clearTimeout(toastTimer.current); }; }, []);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminMarketingServices();
      setServices(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load services', true);
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

  const startEdit = useCallback((s: MarketingService) => { setAdding(false); setEditingId(s._id); setEditForm(buildForm(s)); }, []);
  const startAdd = useCallback(() => { setEditingId(null); setAdding(true); setDeleteConfirmId(null); setEditForm(emptyForm()); }, []);
  const cancelEdit = useCallback(() => { setAdding(false); setEditingId(null); setEditForm(emptyForm()); }, []);

  const toggleActive = useCallback(async (id: string) => {
    try {
      const updated = await toggleMarketingService(id);
      setServices((prev) => prev.map((s) => s._id === id ? updated : s));
      showToast('Status updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to update', true);
    }
  }, [showToast]);

  const handleDeleteService = useCallback(async (id: string) => {
    try {
      await deleteMarketingService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      setDeleteConfirmId(null);
      showToast('Service deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', true);
    }
  }, [showToast]);

  const handleSave = useCallback(async () => {
    const title = editForm.title.trim();
    if (!title) { showToast('Title is required', true); return; }
    const payload = {
      title,
      subtitle: editForm.subtitle.trim(),
      description: editForm.description.trim(),
      icon: editForm.icon.trim() || 'building',
      ctaLabel: editForm.ctaLabel.trim() || 'Learn More',
      status: editForm.status,
    };
    try {
      if (adding) {
        const created = await createMarketingService(payload);
        setServices((prev) => [...prev, created]);
        showToast('Service created');
      } else if (editingId) {
        const updated = await updateMarketingService(editingId, payload);
        setServices((prev) => prev.map((s) => s._id === editingId ? updated : s));
        showToast('Changes saved');
      }
      cancelEdit();
    } catch (err: any) {
      showToast(err.message || 'Failed to save', true);
    }
  }, [editingId, adding, editForm, cancelEdit, showToast]);

  const q = query.trim().toLowerCase();
  const sorted = [...services].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered = sorted.filter((s) => !q || s.title.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
  const set = (patch: Partial<ServiceForm>) => setEditForm((prev) => ({ ...prev, ...patch }));
  const deletingService = services.find((s) => s._id === deleteConfirmId) ?? null;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Discover Services</h1>
          <p className="admin-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Discover Services</h1>
        <p className="admin-subtitle">Manage the service links customers see on the home page.</p>
        <div className="admin-actions">
          <div className="admin-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="admin-search-input" type="text" placeholder="Search services..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search services" />
          </div>
          <button className="admin-btn admin-btn--save" onClick={startAdd} type="button">+ Add Service</button>
        </div>
      </div>

      <div className="admin-projects-list">
        {(adding ? [{ _id: '__add__' } as unknown as MarketingService, ...filtered] : filtered).map((service) =>
          editingId === service._id || service._id === '__add__' ? (
            <div key={service._id} className="admin-project-row admin-project-row--edit">
              <div className="admin-edit-form">
                <div className="admin-edit-grid">
                  <label className="admin-field">
                    <span className="admin-field-label">Title *</span>
                    <input type="text" className="admin-input" value={editForm.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Construction" />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Subtitle</span>
                    <input type="text" className="admin-input" value={editForm.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Icon</span>
                    <input type="text" className="admin-input" value={editForm.icon} onChange={(e) => set({ icon: e.target.value })} placeholder="building" />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Status</span>
                    <select className="admin-input" value={editForm.status} onChange={(e) => set({ status: e.target.value as 'active' | 'inactive' })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">CTA Label</span>
                    <input type="text" className="admin-input" value={editForm.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} />
                  </label>
                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">Description</span>
                    <textarea className="admin-textarea" rows={3} value={editForm.description} onChange={(e) => set({ description: e.target.value })} />
                  </label>
                </div>
                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">{adding ? 'Create' : 'Save'}</button>
                  <button className="admin-btn admin-btn--cancel" onClick={cancelEdit} type="button">Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={service._id} className={`admin-project-row ${service.status === 'active' ? 'admin-project-row--featured' : ''}`}>
              <div className="admin-project-info">
                <div className="admin-project-details">
                  <h3 className="admin-project-name">{service.title}</h3>
                  <p className="admin-project-meta">{service.subtitle || service.description?.slice(0, 80) || ''}</p>
                </div>
                <span className={`admin-featured-badge ${service.status === 'active' ? 'admin-featured-badge--on' : ''}`}>{service.status === 'active' ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="admin-project-actions">
                <AdminToggle active={service.status === 'active'} onClick={() => toggleActive(service._id)} />
                <button className="admin-btn admin-btn--edit" onClick={() => startEdit(service)} type="button">Edit</button>
                <button className="admin-btn admin-btn--cancel admin-banner-delete" onClick={() => setDeleteConfirmId(service._id)} type="button">Delete</button>
              </div>
            </div>
          )
        )}
        {!adding && filtered.length === 0 && <p className="admin-empty">No services found.</p>}
      </div>

      {deleteConfirmId && deletingService && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="admin-modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Delete Service?</h3>
            <p className="admin-modal-text">Are you sure you want to delete &ldquo;{deletingService.title}&rdquo;?</p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn--cancel" onClick={() => setDeleteConfirmId(null)} type="button">Cancel</button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDeleteService(deletingService._id)} type="button">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />{toast.message}
        </div>
      )}
    </div>
  );
}
