import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon/Icon';
import StatusToggle from './AdminToggle';
import { useServiceReorder } from '../../hooks/useServiceReorder';
import {
  getProFixCategories,
  updateProFixCategory,
  addProFixCategory,
  resetProFixCategories,
  moveProFixCategory,
  reorderProFixCategories,
} from '../../data/profix';
import type { ProFixCategory } from '../../data/profix';
import './AdminPage.css';
import './AdminShell.css';

const DEFAULT_TOAST_MS = 2600;

const CATEGORY_ICON_OPTIONS = [
  'bricks',
  'diamond',
  'building',
  'leaf',
  'wrench',
  'store',
  'star',
  'clipboard',
  'check-circle',
  'home',
  'blueprint',
  'shield-check',
  'map-pin',
  'users',
  'receipt',
  'armchair',
];

interface CategoryForm {
  name: string;
  icon: string;
  active: boolean;
}

const EMPTY_FORM: CategoryForm = {
  name: '',
  icon: CATEGORY_ICON_OPTIONS[0],
  active: true,
};

interface ToastState {
  message: string;
  isError: boolean;
}

export default function ProFixCategoriesSection() {
  const [categories, setCategories] = useState<ProFixCategory[]>(() => getProFixCategories());
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<CategoryForm>(EMPTY_FORM);
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

  const startEdit = useCallback((category: ProFixCategory) => {
    setShowAddForm(false);
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      icon: category.icon,
      active: category.active,
    });
  }, []);

  const startAdd = useCallback(() => {
    setEditingId(null);
    setShowAddForm(true);
    setEditForm({ name: '', icon: CATEGORY_ICON_OPTIONS[0], active: true });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setShowAddForm(false);
    setEditForm(EMPTY_FORM);
  }, []);

  const toggleActive = useCallback((id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    const updated = updateProFixCategory(id, { active: !category.active });
    setCategories(updated);
  }, [categories]);

  const handleMove = useCallback((id: string, direction: 'up' | 'down') => {
    const updated = moveProFixCategory(id, direction);
    setCategories(updated);
    showToast(direction === 'up' ? 'Category moved up' : 'Category moved down');
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
    setCategories(resetProFixCategories());
    cancelEdit();
    showToast('Pro Fix categories restored to defaults');
  }, [resetConfirm, cancelEdit, showToast]);

  const handleSave = useCallback(() => {
    const name = editForm.name.trim();
    if (!name) {
      showToast('Category name is required', true);
      return;
    }
    const updates = {
      name,
      icon: editForm.icon,
      active: editForm.active,
    };

    if (showAddForm) {
      addProFixCategory(updates);
      showToast('Category added');
    } else if (editingId) {
      updateProFixCategory(editingId, updates);
      showToast('Changes saved');
    }

    setCategories(getProFixCategories());
    cancelEdit();
  }, [editingId, showAddForm, editForm, cancelEdit, showToast]);

  const set = (patch: Partial<CategoryForm>) => setEditForm((prev) => ({ ...prev, ...patch }));

  const q = query.trim().toLowerCase();
  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered = sortedCategories.filter((c) => !q || c.name.toLowerCase().includes(q));

  const categoryIndex = (id: string) => sortedCategories.findIndex((c) => c.id === id);

  const editingCategory = categories.find((c) => c.id === editingId);

  const formOpen = showAddForm || editingId !== null;

  const reorderEnabled = !formOpen && query.trim() === '';

  const reorder = useServiceReorder({
    enabled: reorderEnabled,
    items: filtered,
    fullIds: sortedCategories.map((c) => c.id),
    onCommitted: (orderedIds) => {
      const reordered = reorderProFixCategories(orderedIds);
      setCategories(reordered);
      showToast('Category order updated');
    },
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Pro Fix Categories</h1>
        <p className="admin-subtitle">
          These are the categories customers use to browse Pro Fix services. Changes are saved to browser storage.
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
              placeholder="Search categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Pro Fix categories"
            />
          </div>
          <button className="admin-btn admin-btn--add" onClick={startAdd} type="button">
            + Add Category
          </button>
          <button className="admin-btn admin-btn--reset" onClick={handleResetClick} type="button">
            {resetConfirm ? 'Confirm reset?' : 'Reset to Defaults'}
          </button>
        </div>
      </div>

      {formOpen && (
        <div className="admin-project-row admin-project-row--edit">
          <div className="admin-edit-form">
            <div className="admin-edit-grid">
              {showAddForm && (
                <label className="admin-field admin-field--wide">
                  <span className="admin-field-label">New Category</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={editForm.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Category name"
                    autoFocus
                  />
                </label>
              )}
              {!showAddForm && (
                <label className="admin-field">
                  <span className="admin-field-label">Category Name</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={editForm.name}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                </label>
              )}
              {editingCategory && (
                <div className="admin-field">
                  <span className="admin-field-label">Display position</span>
                  <div className="admin-readonly-position">#{editingCategory.displayOrder}</div>
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
                <span className="admin-field-label">Icon</span>
                <div className="admin-icon-picker" role="group" aria-label="Choose a category icon">
                  {CATEGORY_ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`admin-icon-opt${editForm.icon === icon ? ' admin-icon-opt--selected' : ''}`}
                      onClick={() => set({ icon })}
                      aria-pressed={editForm.icon === icon}
                      title={icon}
                    >
                      <Icon name={icon} size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-edit-actions">
              <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">
                {showAddForm ? 'Add Category' : 'Save Changes'}
              </button>
              <button className="admin-btn admin-btn--cancel" onClick={cancelEdit} type="button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {query.trim() !== '' && (
        <p className="admin-reorder-hint" id="reorder-search-hint">
          Clear search to reorder
        </p>
      )}

      <div
        className={`admin-projects-list${reorder.listClassName}`}
        ref={reorder.listRef}
      >
        {filtered.map((category) => (
          <div
            key={category.id}
            className={`admin-project-row admin-cat-row ${category.active ? 'admin-project-row--featured' : ''}${reorder.drag?.id === category.id ? ' admin-project-row--dragging' : ''}`}
            ref={reorder.rowRef(category.id)}
            style={reorder.rowStyle(category.id)}
            onPointerMove={reorder.onRowPointerMove}
            onPointerUp={reorder.onRowPointerUp}
            onPointerCancel={reorder.onRowPointerCancel}
          >
            <div className="admin-project-info">
              <div
                className={`admin-drag-handle${reorder.drag?.id === category.id ? ' admin-drag-handle--active' : ''}${reorder.pressId === category.id ? ' admin-drag-handle--pressed' : ''}${!reorderEnabled ? ' admin-drag-handle--disabled' : ''}`}
                data-drag-handle
                role="button"
                aria-label="Reorder category"
                aria-disabled={!reorderEnabled || undefined}
                title={reorderEnabled ? 'Drag or hold to reorder' : 'Reorder disabled while searching'}
                onPointerDown={(e) => reorder.onHandlePointerDown(e, category.id)}
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
              <div className="admin-project-order">#{category.displayOrder}</div>
              <div className="admin-svc-thumb admin-svc-thumb--icon">
                <Icon name={category.icon} size={20} className="admin-svc-thumb-icon" />
              </div>
              <div className="admin-project-details">
                <h3 className="admin-project-name">{category.name}</h3>
              </div>
              <span className={`admin-featured-badge ${category.active ? 'admin-featured-badge--on' : ''}`}>
                {category.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="admin-project-actions">
              <StatusToggle active={category.active} onClick={() => toggleActive(category.id)} />
              <span className="admin-move-controls" role="group" aria-label={`Reorder ${category.name}`}>
                <button
                  className="admin-btn admin-btn--move"
                  onClick={() => handleMove(category.id, 'up')}
                  type="button"
                  disabled={categoryIndex(category.id) === 0}
                  aria-label={`Move ${category.name} up`}
                  title={`Move ${category.name} up`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  className="admin-btn admin-btn--move"
                  onClick={() => handleMove(category.id, 'down')}
                  type="button"
                  disabled={categoryIndex(category.id) === sortedCategories.length - 1}
                  aria-label={`Move ${category.name} down`}
                  title={`Move ${category.name} down`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </span>
              <button
                className="admin-btn admin-btn--edit"
                onClick={() => startEdit(category)}
                type="button"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="admin-empty">No categories match your search.</p>
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