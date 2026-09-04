import { useCallback, useEffect, useRef, useState } from 'react';
import { useServiceReorder } from '../../hooks/useServiceReorder';
import {
  getMarketingServices,
  updateMarketingService,
  addMarketingService,
  deleteMarketingService,
  resetMarketingServices,
  moveMarketingService,
  reorderMarketingServices,
} from '../../data/services';
import type { Service } from '../../data/services';
import AdminToggle from './AdminToggle';
import './AdminPage.css';
import './AdminShell.css';

const ADD_SERVICE_ID = '__add_marketing_service__';

const DEFAULT_TOAST_MS = 2600;

interface ServiceForm {
  title: string;
  description: string;
  path: string;
  active: boolean;
}

interface ToastState {
  message: string;
  isError: boolean;
}

function formatServiceNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function buildForm(service: Service): ServiceForm {
  return {
    title: service.title,
    description: service.description,
    path: service.path ?? '',
    active: service.active,
  };
}

function emptyForm(): ServiceForm {
  return {
    title: '',
    description: '',
    path: '',
    active: true,
  };
}

export default function DiscoverServicesSection() {
  const [services, setServices] = useState<Service[]>(() => getMarketingServices());
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editForm, setEditForm] = useState<ServiceForm>(() => emptyForm());
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

  const startEdit = useCallback((service: Service) => {
    setAdding(false);
    setEditingId(service.id);
    setEditForm(buildForm(service));
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
    const service = services.find((s) => s.id === id);
    if (!service) return;
    const updated = updateMarketingService(id, { active: !service.active });
    setServices(updated);
  }, [services]);

  const handleMove = useCallback((id: string, direction: 'up' | 'down') => {
    const updated = moveMarketingService(id, direction);
    setServices(updated);
    showToast(direction === 'up' ? 'Service moved up' : 'Service moved down');
  }, [showToast]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  const handleDeleteService = useCallback((id: string) => {
    const updated = deleteMarketingService(id);
    setServices(updated);
    setDeleteConfirmId(null);
    showToast('Service deleted');
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
    setServices(resetMarketingServices());
    cancelEdit();
    showToast('Discover services restored to defaults');
  }, [resetConfirm, cancelEdit, showToast]);

  const handleSave = useCallback(() => {
    if (!editingId && !adding) return;
    const title = editForm.title.trim();
    if (!title) {
      showToast('Service title is required', true);
      return;
    }
    const payload = {
      title,
      description: editForm.description.trim(),
      path: editForm.path.trim() || undefined,
      active: editForm.active,
    };

    if (adding) {
      const updated = getMarketingServices();
      const maxOrder = updated.reduce((max, s) => Math.max(max, s.displayOrder), 0);
      addMarketingService({
        ...payload,
        number: formatServiceNumber(maxOrder + 1),
      });
      showToast('Service added');
    } else if (editingId) {
      updateMarketingService(editingId, payload);
      showToast('Changes saved');
    }

    if (adding) setQuery('');

    setServices(getMarketingServices());
    cancelEdit();
  }, [editingId, adding, editForm, cancelEdit, showToast]);

  const q = query.trim().toLowerCase();
  const sortedServices = [...services].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered = sortedServices.filter(
    (s) =>
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.path || '').toLowerCase().includes(q)
  );

  const serviceIndex = (id: string) => sortedServices.findIndex((s) => s.id === id);

  const editingService = services.find((s) => s.id === editingId);
  const deletingService = services.find((s) => s.id === deleteConfirmId) ?? null;

  const display = adding ? [{ id: ADD_SERVICE_ID } as unknown as Service, ...filtered] : filtered;

  const reorderEnabled = !adding && editingId === null && query.trim() === '';

  const reorder = useServiceReorder({
    enabled: reorderEnabled,
    items: display,
    fullIds: sortedServices.map((s) => s.id),
    onCommitted: (orderedIds) => {
      const reordered = reorderMarketingServices(orderedIds);
      setServices(reordered);
      showToast('Service order updated');
    },
  });

  const set = (patch: Partial<ServiceForm>) => setEditForm((prev) => ({ ...prev, ...patch }));

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Discover Services</h1>
        <p className="admin-subtitle">
          These are the service links customers see on the Projects page. Changes are saved to browser storage.
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
              aria-label="Search discover services"
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
                    <span className="admin-field-label">Service Title</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.title}
                      onChange={(e) => set({ title: e.target.value })}
                      placeholder="e.g. Construction"
                    />
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
                  {editingService && !adding && (
                    <div className="admin-field">
                      <span className="admin-field-label">Display position</span>
                      <div className="admin-readonly-position">#{editingService.displayOrder}</div>
                    </div>
                  )}
                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">Destination path</span>
                    <input
                      type="text"
                      className="admin-input"
                      value={editForm.path}
                      onChange={(e) => set({ path: e.target.value })}
                      placeholder="/projects?category=construction"
                    />
                  </label>
                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">Description</span>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      value={editForm.description}
                      onChange={(e) => set({ description: e.target.value })}
                    />
                  </label>
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
                <div className="admin-svc-thumb admin-svc-thumb--icon">
                  <span className="admin-svc-thumb-number">{formatServiceNumber(serviceIndex(service.id))}</span>
                </div>
                <div className="admin-project-details">
                  <h3 className="admin-project-name">{service.title}</h3>
                  <p className="admin-project-meta">{service.path || 'No destination'}</p>
                </div>
                <span className={`admin-featured-badge ${service.active ? 'admin-featured-badge--on' : ''}`}>
                  {service.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="admin-project-actions">
                <AdminToggle active={service.active} onClick={() => toggleActive(service.id)} />
                <span className="admin-move-controls" role="group" aria-label={`Reorder ${service.title}`}>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMove(service.id, 'up')}
                    type="button"
                    disabled={serviceIndex(service.id) === 0}
                    aria-label={`Move ${service.title} up`}
                    title={`Move ${service.title} up`}
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
                    aria-label={`Move ${service.title} down`}
                    title={`Move ${service.title} down`}
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
                <button
                  className="admin-btn admin-btn--cancel admin-banner-delete"
                  onClick={() => handleDeleteClick(service.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
        {!adding && filtered.length === 0 && (
          <p className="admin-empty">No services match your search.</p>
        )}
      </div>

      {deleteConfirmId && deletingService && (
        <div
          className="admin-modal-backdrop"
          onClick={handleCancelDelete}
        >
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm delete service"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Delete Service?</h3>
            <p className="admin-modal-text">
              Are you sure you want to delete &ldquo;{deletingService.title}&rdquo;?
              <span>This cannot be undone.</span>
            </p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn--cancel" onClick={handleCancelDelete} type="button">
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={() => handleDeleteService(deletingService.id)}
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
