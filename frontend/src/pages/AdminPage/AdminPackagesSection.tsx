import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
  reorderPackages,
  type Package,
} from '../../api/packages';
import './AdminPage.css';

const DEFAULT_TOAST_MS = 2600;

interface ToastState {
  message: string;
  isError: boolean;
}

export default function AdminPackagesSection() {
  const navigate = useNavigate();
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  const loadPackages = useCallback(async () => {
    try {
      const data = await fetchPackages();
      setPkgs(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load packages', true);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadPackages(); }, [loadPackages]);

  const sorted = [...pkgs].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleToggleStatus = useCallback(async (id: string) => {
    const pkg = pkgs.find((p) => p._id === id);
    if (!pkg) return;
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active';
    try {
      await updatePackage(id, { status: newStatus });
      setPkgs((prev) => prev.map((p) => p._id === id ? { ...p, status: newStatus } : p));
      showToast(`Package ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update', true);
    }
  }, [pkgs, showToast]);

  const handleToggleDefault = useCallback(async (id: string) => {
    const pkg = pkgs.find((p) => p._id === id);
    if (!pkg) return;
    try {
      await updatePackage(id, { isDefault: !pkg.isDefault });
      setPkgs((prev) => prev.map((p) => p._id === id ? { ...p, isDefault: !p.isDefault } : p));
      showToast('Package updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to update', true);
    }
  }, [pkgs, showToast]);

  const handleMove = useCallback(async (id: string, direction: 'up' | 'down') => {
    const idx = sorted.findIndex((p) => p._id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const ids = sorted.map((p) => p._id);
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    try {
      const reordered = await reorderPackages(ids);
      setPkgs(reordered);
      showToast(direction === 'up' ? 'Moved up' : 'Moved down');
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder', true);
    }
  }, [sorted, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await deletePackage(id);
      setPkgs((prev) => prev.filter((p) => p._id !== id));
      showToast('Package deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', true);
    }
  }, [showToast]);

  const handleSave = useCallback(async (id: string, data: Partial<Package>) => {
    try {
      const updated = await updatePackage(id, data);
      setPkgs((prev) => prev.map((p) => p._id === id ? updated : p));
      setEditingId(null);
      showToast('Changes saved');
    } catch (err: any) {
      showToast(err.message || 'Failed to save', true);
    }
  }, [showToast]);

  const handleAdd = useCallback(async (data: Partial<Package>) => {
    try {
      const created = await createPackage(data);
      setPkgs((prev) => [...prev, created]);
      setAdding(false);
      showToast('Package created');
    } catch (err: any) {
      showToast(err.message || 'Failed to create', true);
    }
  }, [showToast]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Packages</h1>
          <p className="admin-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Packages</h1>
        <p className="admin-subtitle">Manage construction packages shown on the Projects page.</p>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--save" onClick={() => setAdding(true)} type="button">
            + Add Package
          </button>
        </div>
      </div>

      {adding && (
        <PackageForm
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="admin-projects-list">
        {sorted.map((pkg, idx) => (
          <div key={pkg._id} className={`admin-project-row ${pkg.status === 'active' ? 'admin-project-row--featured' : ''}`}>
            {editingId === pkg._id ? (
              <PackageForm
                initial={pkg}
                onSave={(data) => handleSave(pkg._id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="admin-project-info">
                  <div className="admin-project-order">#{pkg.displayOrder}</div>
                  <div className="admin-project-details">
                    <h3 className="admin-project-name">{pkg.name}</h3>
                    <p className="admin-project-meta">
                      ₹{pkg.pricePerSqFt.toLocaleString('en-IN')} / sq.ft
                      {pkg.tagline ? ` · ${pkg.tagline}` : ''}
                    </p>
                  </div>
                  <span className={`admin-featured-badge ${pkg.status === 'active' ? 'admin-featured-badge--on' : ''}`}>
                    {pkg.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  {pkg.popular && (
                    <span className="admin-featured-badge admin-featured-badge--popular">Popular</span>
                  )}
                  {pkg.isDefault && (
                    <span className="admin-featured-badge admin-featured-badge--popular">Default</span>
                  )}
                </div>
                <div className="admin-project-actions">
                  <button className="admin-btn admin-btn--toggle" onClick={() => handleToggleStatus(pkg._id)} type="button">
                    {pkg.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="admin-btn admin-btn--toggle" onClick={() => handleToggleDefault(pkg._id)} type="button">
                    {pkg.isDefault ? 'Unset Default' : 'Set Default'}
                  </button>
                  <button className="admin-btn admin-btn--move" onClick={() => handleMove(pkg._id, 'up')} disabled={idx === 0} type="button">▲</button>
                  <button className="admin-btn admin-btn--move" onClick={() => handleMove(pkg._id, 'down')} disabled={idx === sorted.length - 1} type="button">▼</button>
                  <button className="admin-btn admin-btn--edit" onClick={() => setEditingId(pkg._id)} type="button">Edit</button>
                  <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(pkg._id)} type="button">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
        {sorted.length === 0 && <p className="admin-empty">No packages yet.</p>}
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

function PackageForm({ initial, onSave, onCancel }: { initial?: Package; onSave: (data: Partial<Package>) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [comparisonName, setComparisonName] = useState(initial?.comparisonName ?? initial?.name ?? '');
  const [pricePerSqFt, setPricePerSqFt] = useState(initial?.pricePerSqFt?.toString() ?? '');
  const [pricePrefix, setPricePrefix] = useState(initial?.pricePrefix ?? '₹');
  const [priceUnit, setPriceUnit] = useState(initial?.priceUnit ?? 'per sq.ft');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [features, setFeatures] = useState((initial?.features || []).join('\n'));
  const [icon, setIcon] = useState(initial?.icon ?? 'home');
  const [popular, setPopular] = useState(initial?.popular ?? false);
  const [status, setStatus] = useState<string>(initial?.status ?? 'active');
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      comparisonName: comparisonName.trim() || name.trim(),
      pricePerSqFt: pricePerSqFt ? Number(pricePerSqFt) : 0,
      pricePrefix: pricePrefix.trim(),
      priceUnit: priceUnit.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      features: features.split('\n').map((f) => f.trim()).filter(Boolean),
      icon: icon.trim() || 'home',
      popular,
      status: status as 'active' | 'inactive',
      isDefault,
    });
  };

  return (
    <div className="admin-project-row admin-project-row--edit">
      <div className="admin-edit-form">
        <div className="admin-edit-grid">
          <label className="admin-field">
            <span className="admin-field-label">Name *</span>
            <input type="text" className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium" />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Comparison Name</span>
            <input type="text" className="admin-input" value={comparisonName} onChange={(e) => setComparisonName(e.target.value)} placeholder="e.g. Premium" />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Price (₹/sq.ft)</span>
            <input type="number" className="admin-input" value={pricePerSqFt} onChange={(e) => setPricePerSqFt(e.target.value)} placeholder="e.g. 1995" min="0" />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Price Prefix</span>
            <input type="text" className="admin-input" value={pricePrefix} onChange={(e) => setPricePrefix(e.target.value)} placeholder="₹" />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Price Unit</span>
            <input type="text" className="admin-input" value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} placeholder="per sq.ft" />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Icon</span>
            <input type="text" className="admin-input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="home" />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Tagline</span>
            <input type="text" className="admin-input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Best value for money" />
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Status</span>
            <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Popular</span>
            <select className="admin-input" value={popular ? 'true' : 'false'} onChange={(e) => setPopular(e.target.value === 'true')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="admin-field-label">Default</span>
            <select className="admin-input" value={isDefault ? 'true' : 'false'} onChange={(e) => setIsDefault(e.target.value === 'true')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="admin-field admin-field--wide">
            <span className="admin-field-label">Description</span>
            <textarea className="admin-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="admin-field admin-field--wide">
            <span className="admin-field-label">Features (one per line)</span>
            <textarea className="admin-textarea" rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={"Trusted brand steel & cement\nStandard floor tiles upto ₹50/sqft\nEssential kitchen & bathroom fittings"} />
          </label>
        </div>
        <div className="admin-edit-actions">
          <button className="admin-btn admin-btn--save" onClick={handleSubmit} type="button">
            {initial ? 'Save Changes' : 'Create Package'}
          </button>
          <button className="admin-btn admin-btn--cancel" onClick={onCancel} type="button">Cancel</button>
        </div>
      </div>
    </div>
  );
}
