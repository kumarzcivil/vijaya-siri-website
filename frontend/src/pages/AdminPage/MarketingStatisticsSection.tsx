import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAdminMarketingStats,
  createMarketingStat,
  updateMarketingStat,
  toggleMarketingStat,
  deleteMarketingStat,
  type MarketingStat,
} from '../../api/marketing';
import Icon from '../../components/Icon/Icon';
import AdminToggle from './AdminToggle';
import './AdminPage.css';
import './AdminShell.css';

const ICON_OPTIONS = [
  'home', 'clock', 'star', 'shield-check', 'building', 'receipt', 'users', 'wrench',
  'armchair', 'bricks', 'store', 'leaf', 'diamond', 'blueprint', 'map-pin', 'phone',
  'mail', 'arrow-right', 'check', 'clipboard', 'check-circle',
];

const DEFAULT_TOAST_MS = 2600;

interface StatForm {
  value: string;
  label: string;
  icon: string;
  status: 'active' | 'inactive';
}

interface ToastState {
  message: string;
  isError: boolean;
}

function emptyForm(): StatForm {
  return { value: '', label: '', icon: 'home', status: 'active' };
}

function buildForm(s: MarketingStat): StatForm {
  return { value: s.value, label: s.label, icon: s.icon || 'home', status: s.status };
}

export default function MarketingStatisticsSection() {
  const [stats, setStats] = useState<MarketingStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState<StatForm>(emptyForm());
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
      const data = await fetchAdminMarketingStats();
      setStats(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load statistics', true);
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

  const startEdit = useCallback((s: MarketingStat) => { setAdding(false); setEditingId(s._id); setEditForm(buildForm(s)); }, []);
  const startAdd = useCallback(() => { setEditingId(null); setAdding(true); setDeleteConfirmId(null); setEditForm(emptyForm()); }, []);
  const cancelEdit = useCallback(() => { setAdding(false); setEditingId(null); setEditForm(emptyForm()); }, []);

  const toggleActive = useCallback(async (id: string) => {
    try {
      const updated = await toggleMarketingStat(id);
      setStats((prev) => prev.map((s) => s._id === id ? updated : s));
      showToast('Status updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to update', true);
    }
  }, [showToast]);

  const handleDeleteStat = useCallback(async (id: string) => {
    try {
      await deleteMarketingStat(id);
      setStats((prev) => prev.filter((s) => s._id !== id));
      setDeleteConfirmId(null);
      showToast('Statistic deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', true);
    }
  }, [showToast]);

  const handleSave = useCallback(async () => {
    const value = editForm.value.trim();
    const label = editForm.label.trim();
    if (!value || !label) { showToast('Value and label are required', true); return; }
    const payload = { value, label, icon: editForm.icon, status: editForm.status };
    try {
      if (adding) {
        const created = await createMarketingStat(payload);
        setStats((prev) => [...prev, created]);
        showToast('Statistic created');
      } else if (editingId) {
        const updated = await updateMarketingStat(editingId, payload);
        setStats((prev) => prev.map((s) => s._id === editingId ? updated : s));
        showToast('Changes saved');
      }
      cancelEdit();
    } catch (err: any) {
      showToast(err.message || 'Failed to save', true);
    }
  }, [editingId, adding, editForm, cancelEdit, showToast]);

  const q = query.trim().toLowerCase();
  const sorted = [...stats].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered = sorted.filter((s) => !q || s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q));
  const set = (patch: Partial<StatForm>) => setEditForm((prev) => ({ ...prev, ...patch }));
  const deletingStat = stats.find((s) => s._id === deleteConfirmId) ?? null;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Statistics</h1>
          <p className="admin-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Statistics</h1>
        <p className="admin-subtitle">Manage the statistics shown on the home page.</p>
        <div className="admin-actions">
          <div className="admin-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="admin-search-input" type="text" placeholder="Search statistics..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search statistics" />
          </div>
          <button className="admin-btn admin-btn--save" onClick={startAdd} type="button">+ Add Statistic</button>
        </div>
      </div>

      <div className="admin-projects-list">
        {(adding ? [{ _id: '__add__' } as unknown as MarketingStat, ...filtered] : filtered).map((stat) =>
          editingId === stat._id || stat._id === '__add__' ? (
            <div key={stat._id} className="admin-project-row admin-project-row--edit">
              <div className="admin-edit-form">
                <div className="admin-edit-grid">
                  <label className="admin-field">
                    <span className="admin-field-label">Value *</span>
                    <input type="text" className="admin-input" value={editForm.value} onChange={(e) => set({ value: e.target.value })} placeholder="e.g. 500+" />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Label *</span>
                    <input type="text" className="admin-input" value={editForm.label} onChange={(e) => set({ label: e.target.value })} placeholder="e.g. Homes Built" />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Icon</span>
                    <select className="admin-input" value={editForm.icon} onChange={(e) => set({ icon: e.target.value })}>
                      {ICON_OPTIONS.map((name) => (<option key={name} value={name}>{name}</option>))}
                    </select>
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Status</span>
                    <select className="admin-input" value={editForm.status} onChange={(e) => set({ status: e.target.value as 'active' | 'inactive' })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <div className="admin-field admin-field--wide">
                    <span className="admin-field-label">Preview</span>
                    <div className="admin-stat-preview">
                      <Icon name={editForm.icon} size={18} />
                      <span className="admin-stat-preview-value">{editForm.value || 'Value'}</span>
                      <span className="admin-stat-preview-label">{editForm.label || 'Label'}</span>
                    </div>
                  </div>
                </div>
                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">{adding ? 'Create' : 'Save'}</button>
                  <button className="admin-btn admin-btn--cancel" onClick={cancelEdit} type="button">Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={stat._id} className={`admin-project-row ${stat.status === 'active' ? 'admin-project-row--featured' : ''}`}>
              <div className="admin-project-info">
                <div className="admin-svc-thumb admin-svc-thumb--icon">
                  <Icon name={stat.icon} size={20} className="admin-svc-thumb-icon" />
                </div>
                <div className="admin-project-details">
                  <h3 className="admin-project-name">{stat.label}</h3>
                  <p className="admin-project-meta">{stat.value}</p>
                </div>
                <span className={`admin-featured-badge ${stat.status === 'active' ? 'admin-featured-badge--on' : ''}`}>{stat.status === 'active' ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="admin-project-actions">
                <AdminToggle active={stat.status === 'active'} onClick={() => toggleActive(stat._id)} />
                <button className="admin-btn admin-btn--edit" onClick={() => startEdit(stat)} type="button">Edit</button>
                <button className="admin-btn admin-btn--cancel admin-banner-delete" onClick={() => setDeleteConfirmId(stat._id)} type="button">Delete</button>
              </div>
            </div>
          )
        )}
        {!adding && filtered.length === 0 && <p className="admin-empty">No statistics found.</p>}
      </div>

      {deleteConfirmId && deletingStat && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="admin-modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Delete Statistic?</h3>
            <p className="admin-modal-text">Are you sure you want to delete &ldquo;{deletingStat.label}&rdquo;?</p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn--cancel" onClick={() => setDeleteConfirmId(null)} type="button">Cancel</button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDeleteStat(deletingStat._id)} type="button">Delete</button>
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
