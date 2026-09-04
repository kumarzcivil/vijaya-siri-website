import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPackages, savePackages, updatePackage, resetPackages } from '../../data';
import type { Package } from '../../data';
import './AdminPage.css';

function formatPrice(pkg: Package): string {
  if (pkg.price === null) return 'Get Quote';
  return `${pkg.pricePrefix}${pkg.price.toLocaleString('en-IN')}`;
}

export default function AdminPackagesSection() {
  const navigate = useNavigate();
  const [pkgs, setPkgs] = useState<Package[]>(() => getPackages());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Package>>({});

  const handleToggleActive = useCallback(
    (id: string) => {
      const current = pkgs.find((p) => p.id === id);
      if (!current) return;
      const updated = updatePackage(id, { active: !current.active });
      setPkgs(updated);
    },
    [pkgs]
  );

  const handleTogglePopular = useCallback(
    (id: string) => {
      const current = pkgs.find((p) => p.id === id);
      if (!current) return;
      const updated = updatePackage(id, { popular: !current.popular });
      setPkgs(updated);
    },
    [pkgs]
  );

  const sorted = [...pkgs].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleMoveUp = useCallback(
    (idx: number) => {
      if (idx <= 0) return;
      const next = [...sorted];
      const [moved] = next.splice(idx, 1);
      next.splice(idx - 1, 0, moved);
      const reindexed = next.map((p, i) => ({ ...p, displayOrder: i + 1 }));
      savePackages(reindexed);
      setPkgs(reindexed);
    },
    [sorted]
  );

  const handleMoveDown = useCallback(
    (idx: number) => {
      if (idx >= sorted.length - 1) return;
      const next = [...sorted];
      const [moved] = next.splice(idx, 1);
      next.splice(idx + 1, 0, moved);
      const reindexed = next.map((p, i) => ({ ...p, displayOrder: i + 1 }));
      savePackages(reindexed);
      setPkgs(reindexed);
    },
    [sorted]
  );

  const handleView = useCallback(
    (pkg: Package) => {
      if (pkg.custom) {
        navigate('/projects#packages');
      } else {
        navigate(`/projects/compare-packages?highlight=${pkg.id}`);
      }
    },
    [navigate]
  );

  const handleStartEdit = useCallback((pkg: Package) => {
    setEditingId(pkg.id);
    setEditForm({ ...pkg, features: [...pkg.features] });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm({});
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return;
    const updated = updatePackage(editingId, editForm);
    setPkgs(updated);
    setEditingId(null);
    setEditForm({});
  }, [editingId, editForm]);

  const handleReset = useCallback(() => {
    const reset = resetPackages();
    setPkgs(reset);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Package Admin</h1>
        <p className="admin-subtitle">
          Manage construction packages displayed on the Projects page.
          Changes are saved to browser storage.
        </p>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--reset" onClick={handleReset} type="button">
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="admin-projects-list">
        <div className="admin-reorder-hint">
          Use the arrow buttons to change the order in which packages appear on the customer Projects page.
        </div>

        {sorted.map((pkg, idx) => (
          <div key={pkg.id} className="admin-project-row">
            {editingId === pkg.id ? (
              <div className="admin-edit-form">
                <div className="admin-edit-grid">
                  <label className="admin-field">
                    <span className="admin-field-label">Name</span>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="admin-input"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Comparison Name</span>
                    <input
                      type="text"
                      value={editForm.comparisonName || ''}
                      onChange={(e) => setEditForm({ ...editForm, comparisonName: e.target.value })}
                      className="admin-input"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Price{editForm.custom ? ' (Get Quote — leave empty)' : ' (empty = Get Quote)'}</span>
                    <input
                      type="text"
                      value={editForm.price === null ? '' : String(editForm.price ?? '')}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        setEditForm({ ...editForm, price: raw === '' ? null : Number(raw) });
                      }}
                      className="admin-input"
                      placeholder="e.g. 1995"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Price Prefix</span>
                    <input
                      type="text"
                      value={editForm.pricePrefix || ''}
                      onChange={(e) => setEditForm({ ...editForm, pricePrefix: e.target.value })}
                      className="admin-input"
                      placeholder="₹"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Price Unit</span>
                    <input
                      type="text"
                      value={editForm.priceUnit || ''}
                      onChange={(e) => setEditForm({ ...editForm, priceUnit: e.target.value })}
                      className="admin-input"
                      placeholder="per sq.ft"
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Popular</span>
                    <select
                      value={editForm.popular ? 'true' : 'false'}
                      onChange={(e) => setEditForm({ ...editForm, popular: e.target.value === 'true' })}
                      className="admin-input"
                    >
                      <option value="true">Yes (Most Popular)</option>
                      <option value="false">No</option>
                    </select>
                  </label>
                  <label className="admin-field">
                    <span className="admin-field-label">Active</span>
                    <select
                      value={editForm.active ? 'true' : 'false'}
                      onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                      className="admin-input"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">Description</span>
                    <input
                      type="text"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="admin-input"
                    />
                  </label>
                  <label className="admin-field admin-field--wide">
                    <span className="admin-field-label">Highlights (one per line)</span>
                    <textarea
                      rows={5}
                      value={(editForm.features || []).join('\n')}
                      onChange={(e) => setEditForm({ ...editForm, features: e.target.value.split('\n').map((t) => t.trim()).filter(Boolean) })}
                      className="admin-input"
                    />
                  </label>
                </div>
                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn--save" onClick={handleSaveEdit} type="button">
                    Save Changes
                  </button>
                  <button className="admin-btn admin-btn--cancel" onClick={handleCancelEdit} type="button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-project-info">
                  <div className="admin-project-order">#{pkg.displayOrder}</div>
                  <div className="admin-project-details">
                    <h3 className="admin-project-name">{pkg.name}</h3>
                    <p className="admin-project-meta">{formatPrice(pkg)}{pkg.priceUnit ? ` ${pkg.priceUnit}` : ''}</p>
                  </div>
                  <span className={`admin-featured-badge ${pkg.active ? 'admin-featured-badge--on' : ''}`}>
                    {pkg.active ? 'Active' : 'Inactive'}
                  </span>
                  {pkg.popular && (
                    <span className="admin-featured-badge admin-featured-badge--popular">Popular</span>
                  )}
                </div>
                <div className="admin-project-actions">
                  <button
                    className="admin-btn admin-btn--toggle"
                    onClick={() => handleToggleActive(pkg.id)}
                    type="button"
                  >
                    {pkg.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="admin-btn admin-btn--toggle"
                    onClick={() => handleTogglePopular(pkg.id)}
                    type="button"
                  >
                    {pkg.popular ? 'Unpopular' : 'Popular'}
                  </button>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx <= 0}
                    type="button"
                    aria-label="Move up"
                  >
                    &#9650;
                  </button>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx >= sorted.length - 1}
                    type="button"
                    aria-label="Move down"
                  >
                    &#9660;
                  </button>
                  <button
                    className="admin-btn admin-btn--view"
                    onClick={() => handleView(pkg)}
                    type="button"
                  >
                    View
                  </button>
                  <button
                    className="admin-btn admin-btn--edit"
                    onClick={() => handleStartEdit(pkg)}
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
