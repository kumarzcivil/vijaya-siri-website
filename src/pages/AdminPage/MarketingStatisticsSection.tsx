import { useCallback, useEffect, useRef, useState } from 'react';
import { useServiceReorder } from '../../hooks/useServiceReorder';
import {
  getMarketingStatistics,
  updateMarketingStatistic,
  addMarketingStatistic,
  deleteMarketingStatistic,
  resetMarketingStatistics,
  moveMarketingStatistic,
  reorderMarketingStatistics,
} from '../../data/statistics';
import type { Stat } from '../../data/statistics';
import Icon from '../../components/Icon/Icon';
import AdminToggle from './AdminToggle';
import './AdminPage.css';
import './AdminShell.css';

const ADD_STAT_ID = '__add_marketing_stat__';

const ICON_OPTIONS = [
  'home',
  'clock',
  'star',
  'shield-check',
  'building',
  'receipt',
  'users',
  'wrench',
  'armchair',
  'bricks',
  'store',
  'leaf',
  'diamond',
  'blueprint',
  'map-pin',
  'phone',
  'mail',
  'arrow-right',
  'check',
  'clipboard',
  'check-circle',
];

const DEFAULT_TOAST_MS = 2600;

interface StatForm {
  value: string;
  label: string;
  icon: string;
  active: boolean;
}

interface ToastState {
  message: string;
  isError: boolean;
}

function buildForm(stat: Stat): StatForm {
  return {
    value: stat.value,
    label: stat.label,
    icon: stat.icon,
    active: stat.active,
  };
}

function emptyForm(): StatForm {
  return {
    value: '',
    label: '',
    icon: 'home',
    active: true,
  };
}

export default function MarketingStatisticsSection() {
  const [stats, setStats] = useState<Stat[]>(() => getMarketingStatistics());
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState<StatForm>(() => emptyForm());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  useEffect(() => {
    if (deleteConfirmId === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDeleteConfirmId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmId]);

  const startEdit = useCallback((stat: Stat) => {
    setAdding(false);
    setEditingId(stat.id);
    setEditForm(buildForm(stat));
  }, []);

  const startAdd = useCallback(() => {
    setEditingId(null);
    setAdding(true);
    setDeleteConfirmId(null);
    setEditForm(emptyForm());
  }, []);

  const cancelEdit = useCallback(() => {
    setAdding(false);
    setEditingId(null);
    setEditForm(emptyForm());
  }, []);

  const toggleActive = useCallback((id: string) => {
    const stat = stats.find((s) => s.id === id);
    if (!stat) return;
    const updated = updateMarketingStatistic(id, { active: !stat.active });
    setStats(updated);
  }, [stats]);

  const handleMove = useCallback((id: string, direction: 'up' | 'down') => {
    const updated = moveMarketingStatistic(id, direction);
    setStats(updated);
    showToast(direction === 'up' ? 'Statistic moved up' : 'Statistic moved down');
  }, [showToast]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  const handleDeleteStat = useCallback((id: string) => {
    const updated = deleteMarketingStatistic(id);
    setStats(updated);
    setDeleteConfirmId(null);
    showToast('Statistic deleted');
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
    setStats(resetMarketingStatistics());
    cancelEdit();
    showToast('Statistics restored to defaults');
  }, [resetConfirm, cancelEdit, showToast]);

  const handleSave = useCallback(() => {
    if (!editingId && !adding) return;
    const label = editForm.label.trim();
    const value = editForm.value.trim();
    if (!label || !value) {
      showToast('Value and label are required', true);
      return;
    }
    const payload = {
      value,
      label,
      icon: editForm.icon,
      active: editForm.active,
    };

    if (adding) {
      addMarketingStatistic(payload);
      showToast('Statistic added');
    } else if (editingId) {
      updateMarketingStatistic(editingId, payload);
      showToast('Changes saved');
    }

    if (adding) setQuery('');

    setStats(getMarketingStatistics());
    cancelEdit();
  }, [editingId, adding, editForm, cancelEdit, showToast]);

  const q = query.trim().toLowerCase();
  const sortedStats = [...stats].sort((a, b) => a.order - b.order);
  const filtered = sortedStats.filter(
    (s) =>
      !q ||
      s.label.toLowerCase().includes(q) ||
      s.value.toLowerCase().includes(q) ||
      (s.icon || '').toLowerCase().includes(q)
  );

  const statIndex = (id: string) => sortedStats.findIndex((s) => s.id === id);

  const editingStat = stats.find((s) => s.id === editingId);
  const deletingStat = stats.find((s) => s.id === deleteConfirmId) ?? null;

  const display = adding ? [{ id: ADD_STAT_ID } as unknown as Stat, ...filtered] : filtered;

  const reorderEnabled = !adding && editingId === null && query.trim() === '';

  const reorder = useServiceReorder({
    enabled: reorderEnabled,
    items: display,
    fullIds: sortedStats.map((s) => s.id),
    onCommitted: (orderedIds) => {
      const reordered = reorderMarketingStatistics(orderedIds);
      setStats(reordered);
      showToast('Statistic order updated');
    },
  });

  const set = (patch: Partial<StatForm>) => setEditForm((prev) => ({ ...prev, ...patch }));

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Statistics</h1>
        <p className="admin-subtitle">
          These are the statistics customers see on the Projects page. Changes are saved to browser storage.
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
              placeholder="Search statistics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search statistics"
            />
          </div>
          <button className="admin-btn admin-btn--save" onClick={startAdd} type="button">
            + Add Statistic
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
        {display.map((stat) =>
          editingId === stat.id || stat.id === ADD_STAT_ID ? (
            <div key={stat.id} className="admin-project-row admin-project-row--edit">
              <div className="admin-edit-form">
                <div className="admin-edit-grid">
                  <label className="admin-field">
                    <span className="admin-field-label">Value</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.value}
                      onChange={(e) => set({ value: e.target.value })}
                      placeholder="e.g. 500+"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Label</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.label}
                      onChange={(e) => set({ label: e.target.value })}
                      placeholder="e.g. Homes Built"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Icon</span>
                    <select
                      className="admin-input"
                      value={editForm.icon}
                      onChange={(e) => set({ icon: e.target.value })}
                    >
                      {ICON_OPTIONS.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </label>
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
                  {editingStat && !adding && (
                    <div className="admin-field">
                      <span className="admin-field-label">Display position</span>
                      <div className="admin-readonly-position">#{editingStat.order}</div>
                    </div>
                  )}
                  <div className="admin-field admin-field--wide">
                    <span className="admin-field-label">Preview</span>
                    <div className="admin-stat-preview">
                      <span className="admin-stat-preview-value">{editForm.value || 'Value'}</span>
                      <span className="admin-stat-preview-label">{editForm.label || 'Label'}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">
                    {adding ? 'Add Statistic' : 'Save Changes'}
                  </button>
                  <button className="admin-btn admin-btn--cancel" onClick={cancelEdit} type="button">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={stat.id}
              className={`admin-project-row admin-svc-row ${stat.active ? 'admin-project-row--featured' : ''}${reorder.drag?.id === stat.id ? ' admin-project-row--dragging' : ''}`}
              ref={reorder.rowRef(stat.id)}
              style={reorder.rowStyle(stat.id)}
              onPointerMove={reorder.onRowPointerMove}
              onPointerUp={reorder.onRowPointerUp}
              onPointerCancel={reorder.onRowPointerCancel}
            >
              <div className="admin-project-info">
                <div
                  className={`admin-drag-handle${reorder.drag?.id === stat.id ? ' admin-drag-handle--active' : ''}${reorder.pressId === stat.id ? ' admin-drag-handle--pressed' : ''}${!reorderEnabled ? ' admin-drag-handle--disabled' : ''}`}
                  data-drag-handle
                  role="button"
                  aria-label="Reorder statistic"
                  aria-disabled={!reorderEnabled || undefined}
                  title={reorderEnabled ? 'Drag or hold to reorder' : 'Reorder disabled while searching'}
                  onPointerDown={(e) => reorder.onHandlePointerDown(e, stat.id)}
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
                <div className="admin-project-order">#{stat.order}</div>
                <div className="admin-svc-thumb admin-svc-thumb--icon">
                  <Icon name={stat.icon} size={20} className="admin-svc-thumb-icon" />
                </div>
                <div className="admin-project-details">
                  <h3 className="admin-project-name">{stat.label}</h3>
                  <p className="admin-project-meta">{stat.value}</p>
                </div>
                <span className={`admin-featured-badge ${stat.active ? 'admin-featured-badge--on' : ''}`}>
                  {stat.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="admin-project-actions">
                <AdminToggle active={stat.active} onClick={() => toggleActive(stat.id)} />
                <span className="admin-move-controls" role="group" aria-label={`Reorder ${stat.label}`}>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMove(stat.id, 'up')}
                    type="button"
                    disabled={statIndex(stat.id) === 0}
                    aria-label={`Move ${stat.label} up`}
                    title={`Move ${stat.label} up`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMove(stat.id, 'down')}
                    type="button"
                    disabled={statIndex(stat.id) === sortedStats.length - 1}
                    aria-label={`Move ${stat.label} down`}
                    title={`Move ${stat.label} down`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </span>
                <button
                  className="admin-btn admin-btn--edit"
                  onClick={() => startEdit(stat)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="admin-btn admin-btn--cancel admin-banner-delete"
                  onClick={() => handleDeleteClick(stat.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
        {!adding && filtered.length === 0 && (
          <p className="admin-empty">No statistics match your search.</p>
        )}
      </div>

      {deleteConfirmId && deletingStat && (
        <div
          className="admin-modal-backdrop"
          onClick={handleCancelDelete}
        >
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm delete statistic"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Delete Statistic?</h3>
            <p className="admin-modal-text">
              Are you sure you want to delete &ldquo;{deletingStat.label}&rdquo;?
              <span>This cannot be undone.</span>
            </p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn--cancel" onClick={handleCancelDelete} type="button">
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => handleDeleteStat(deletingStat.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
