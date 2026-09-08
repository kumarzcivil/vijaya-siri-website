import { useState, useCallback, useEffect, useRef } from 'react';
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  fetchCouponStats,
  type Coupon,
} from '../../api/coupons';
import AdminToggle from './AdminToggle';
import { SkeletonTable } from '../../components/Skeleton/Skeleton';
import { logger } from '../../utils/logger';
import './AdminPage.css';
import './AdminShell.css';
import './AdminOffers.css';
import './CouponsSection.css';

const DEFAULT_TOAST_MS = 2600;

interface ToastState {
  message: string;
  isError?: boolean;
}

interface CouponForm {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  serviceType: 'QUICK_FIX' | 'PRO_FIX' | 'BOTH';
  usageLimit: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

function emptyForm(): CouponForm {
  return {
    code: '', description: '', discountType: 'percentage', discountValue: 0,
    maxDiscount: 0, minOrder: 0, serviceType: 'BOTH', usageLimit: 0,
    startDate: '', endDate: '', status: 'active',
  };
}

function buildForm(c: Coupon): CouponForm {
  return {
    code: c.code, description: c.description || '', discountType: c.discountType,
    discountValue: c.discountValue, maxDiscount: c.maxDiscount, minOrder: c.minOrder,
    serviceType: c.serviceType, usageLimit: c.usageLimit, startDate: c.startDate || '',
    endDate: c.endDate || '', status: c.status,
  };
}

function formatShortDate(iso: string): string {
  const key = iso.slice(0, 10);
  if (!key) return iso;
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function couponStatusText(c: Coupon): string {
  if (c.status !== 'active') return 'Inactive';
  const today = new Date().toISOString().slice(0, 10);
  const s = c.startDate?.slice(0, 10) || '';
  const e = c.endDate?.slice(0, 10) || '';
  if (s && s > today) return `Scheduled \u00B7 From ${formatShortDate(s)}`;
  if (e && e < today) return `Expired \u00B7 Until ${formatShortDate(e)}`;
  if (s && e) return `Active \u00B7 ${formatShortDate(s)} \u2192 ${formatShortDate(e)}`;
  if (e) return `Active \u00B7 Until ${formatShortDate(e)}`;
  if (s) return `Active \u00B7 From ${formatShortDate(s)}`;
  return 'Active';
}

function discountDisplay(c: Coupon): string {
  if (c.discountType === 'percentage') {
    const base = `${c.discountValue}% off`;
    return c.maxDiscount > 0 ? `${base} (max \u20B9${c.maxDiscount})` : base;
  }
  return `\u20B9${c.discountValue} off`;
}

export default function CouponsSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm());
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
      logger.info('Coupons', 'Fetching coupons...');
      const [data, statsData] = await Promise.all([fetchCoupons(), fetchCouponStats()]);
      setCoupons(data);
      setStats(statsData);
      logger.success('Coupons', `Loaded ${data.length} coupons`);
    } catch (err: any) {
      logger.error('Coupons', 'Failed to load coupons', err);
      showToast(err.message || 'Failed to load coupons', true);
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
  const openEdit = useCallback((c: Coupon) => { setShowForm(false); setEditingId(c._id); setDeleteConfirmId(null); setForm(buildForm(c)); }, []);
  const closeForm = useCallback(() => { setEditingId(null); setShowForm(false); setForm(emptyForm()); }, []);
  const setF = useCallback((patch: Partial<CouponForm>) => setForm((p) => ({ ...p, ...patch })), []);

  const handleSave = useCallback(async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) { showToast('Coupon code is required', true); return; }
    if (!form.discountValue || form.discountValue <= 0) { showToast('Discount value must be > 0', true); return; }
    const payload = {
      code, description: form.description.trim(), discountType: form.discountType,
      discountValue: form.discountValue, maxDiscount: form.maxDiscount, minOrder: form.minOrder,
      serviceType: form.serviceType, usageLimit: form.usageLimit, startDate: form.startDate,
      endDate: form.endDate, status: form.status,
    };
    try {
      if (showForm && !editingId) {
        logger.info('Coupons', `Creating coupon ${code}...`);
        const created = await createCoupon(payload);
        setCoupons((p) => [...p, created]);
        logger.success('Coupons', `Coupon ${code} created`);
        showToast('Coupon created');
      } else if (editingId) {
        logger.info('Coupons', `Updating coupon ${code}...`);
        const updated = await updateCoupon(editingId, payload);
        setCoupons((p) => p.map((c) => c._id === editingId ? updated : c));
        logger.success('Coupons', `Coupon ${code} updated`);
        showToast('Changes saved');
      }
      closeForm();
    } catch (err: any) {
      logger.error('Coupons', `Failed to save coupon: ${err.message}`, err);
      showToast(err.message || 'Failed to save', true);
    }
  }, [editingId, showForm, form, closeForm, showToast]);

  const handleToggle = useCallback(async (id: string) => {
    try {
      const updated = await toggleCouponStatus(id);
      setCoupons((p) => p.map((c) => c._id === id ? updated : c));
      logger.success('Coupons', `Coupon ${updated.code} ${updated.status}`);
    } catch (err: any) {
      logger.error('Coupons', 'Failed to toggle coupon', err);
      showToast(err.message || 'Failed to update', true);
    }
  }, [showToast]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const coupon = coupons.find((c) => c._id === id);
      await deleteCoupon(id);
      setCoupons((p) => p.filter((c) => c._id !== id));
      setDeleteConfirmId(null);
      logger.success('Coupons', `Coupon ${coupon?.code} deleted`);
      showToast('Coupon deleted');
    } catch (err: any) {
      logger.error('Coupons', 'Failed to delete coupon', err);
      showToast(err.message || 'Failed to delete', true);
    }
  }, [coupons, showToast]);

  const sorted = [...coupons].sort((a, b) => a.code.localeCompare(b.code));
  const deletingCoupon = coupons.find((c) => c._id === deleteConfirmId) ?? null;
  const formOpen = showForm || editingId !== null;

  if (loading) {
    return (
      <div className="admin-page admin-page--banners">
        <div className="admin-section admin-section--primary">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Coupons</h2>
            <p className="admin-section-desc">Loading...</p>
          </div>
          <SkeletonTable rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-page--banners">
      <div className="admin-section admin-section--primary">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Coupons</h2>
            <p className="admin-section-desc">Manage promo codes and discounts customers can apply at checkout.</p>
          </div>
          <div className="admin-actions">
            <div className="coupon-stats-row">
              <span className="coupon-stat">{stats.active} active</span>
              <span className="coupon-stat">{stats.inactive} inactive</span>
            </div>
            <button className="admin-btn admin-btn--add" onClick={openAdd} type="button">+ Add Coupon</button>
          </div>
        </div>

        {showForm && !editingId && (
          <div className="admin-edit-form">
            <div className="admin-edit-grid">
              <label className="admin-field">
                <span className="admin-field-label">Code *</span>
                <input type="text" className="admin-input" value={form.code} onChange={(e) => setF({ code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" maxLength={20} />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Discount Type *</span>
                <select className="admin-input" value={form.discountType} onChange={(e) => setF({ discountType: e.target.value as 'percentage' | 'flat' })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (\u20B9)</option>
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Discount Value *</span>
                <input type="number" className="admin-input" value={form.discountValue || ''} onChange={(e) => setF({ discountValue: Number(e.target.value) })} min={0} placeholder={form.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 500'} />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">{form.discountType === 'percentage' ? 'Max Discount (Cap)' : 'Max Discount'}</span>
                <input type="number" className="admin-input" value={form.maxDiscount || ''} onChange={(e) => setF({ maxDiscount: Number(e.target.value) })} min={0} placeholder="0 = no cap" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Min Order (\u20B9)</span>
                <input type="number" className="admin-input" value={form.minOrder || ''} onChange={(e) => setF({ minOrder: Number(e.target.value) })} min={0} placeholder="0 = no minimum" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Service Type</span>
                <select className="admin-input" value={form.serviceType} onChange={(e) => setF({ serviceType: e.target.value as CouponForm['serviceType'] })}>
                  <option value="BOTH">All Services</option>
                  <option value="QUICK_FIX">Quick Fix Only</option>
                  <option value="PRO_FIX">Pro Fix Only</option>
                </select>
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Usage Limit</span>
                <input type="number" className="admin-input" value={form.usageLimit || ''} onChange={(e) => setF({ usageLimit: Number(e.target.value) })} min={0} placeholder="0 = unlimited" />
              </label>
              <label className="admin-field admin-field--wide">
                <span className="admin-field-label">Description</span>
                <input type="text" className="admin-input" value={form.description} onChange={(e) => setF({ description: e.target.value })} placeholder="What this coupon is for" />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Start Date</span>
                <input type="date" className="admin-input" value={form.startDate} onChange={(e) => setF({ startDate: e.target.value })} />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">End Date</span>
                <input type="date" className="admin-input" value={form.endDate} onChange={(e) => setF({ endDate: e.target.value })} />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Status</span>
                <select className="admin-input" value={form.status} onChange={(e) => setF({ status: e.target.value as 'active' | 'inactive' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
            <div className="admin-edit-actions">
              <button className="admin-btn admin-btn--save" onClick={handleSave} type="button">Create</button>
              <button className="admin-btn admin-btn--cancel" onClick={closeForm} type="button">Cancel</button>
            </div>
          </div>
        )}

        <div className="admin-projects-list admin-banners-list">
          {sorted.length === 0 && <p className="admin-empty">No coupons yet.</p>}
          {sorted.map((coupon) => (
            <div key={coupon._id} className={`admin-project-row admin-offer-row${editingId === coupon._id ? ' admin-project-row--edit' : ''} ${coupon.status === 'active' ? 'admin-project-row--featured' : ''}`}>
              {editingId === coupon._id ? (
                <div className="admin-edit-form">
                  <div className="admin-edit-grid">
                    <label className="admin-field">
                      <span className="admin-field-label">Code *</span>
                      <input type="text" className="admin-input" value={form.code} onChange={(e) => setF({ code: e.target.value.toUpperCase() })} maxLength={20} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Discount Type</span>
                      <select className="admin-input" value={form.discountType} onChange={(e) => setF({ discountType: e.target.value as 'percentage' | 'flat' })}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat (\u20B9)</option>
                      </select>
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Discount Value</span>
                      <input type="number" className="admin-input" value={form.discountValue || ''} onChange={(e) => setF({ discountValue: Number(e.target.value) })} min={0} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Max Discount</span>
                      <input type="number" className="admin-input" value={form.maxDiscount || ''} onChange={(e) => setF({ maxDiscount: Number(e.target.value) })} min={0} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Min Order (\u20B9)</span>
                      <input type="number" className="admin-input" value={form.minOrder || ''} onChange={(e) => setF({ minOrder: Number(e.target.value) })} min={0} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Service Type</span>
                      <select className="admin-input" value={form.serviceType} onChange={(e) => setF({ serviceType: e.target.value as CouponForm['serviceType'] })}>
                        <option value="BOTH">All Services</option>
                        <option value="QUICK_FIX">Quick Fix Only</option>
                        <option value="PRO_FIX">Pro Fix Only</option>
                      </select>
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Usage Limit</span>
                      <input type="number" className="admin-input" value={form.usageLimit || ''} onChange={(e) => setF({ usageLimit: Number(e.target.value) })} min={0} />
                    </label>
                    <label className="admin-field admin-field--wide">
                      <span className="admin-field-label">Description</span>
                      <input type="text" className="admin-input" value={form.description} onChange={(e) => setF({ description: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Start Date</span>
                      <input type="date" className="admin-input" value={form.startDate} onChange={(e) => setF({ startDate: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">End Date</span>
                      <input type="date" className="admin-input" value={form.endDate} onChange={(e) => setF({ endDate: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span className="admin-field-label">Status</span>
                      <select className="admin-input" value={form.status} onChange={(e) => setF({ status: e.target.value as 'active' | 'inactive' })}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
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
                    <div className="admin-coupon-icon">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `\u20B9${coupon.discountValue}`}</div>
                    <div className="admin-project-details">
                      <h3 className="admin-project-name">{coupon.code}</h3>
                      <p className="admin-project-meta">
                        {discountDisplay(coupon)} \u00B7 {coupon.serviceType === 'BOTH' ? 'All' : coupon.serviceType.replace('_', ' ')} \u00B7 {couponStatusText(coupon)}
                        {coupon.usageLimit > 0 && ` \u00B7 ${coupon.usedCount}/${coupon.usageLimit} used`}
                      </p>
                    </div>
                    <span className={`admin-featured-badge ${coupon.status === 'active' ? 'admin-featured-badge--on' : ''}`}>
                      {coupon.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <AdminToggle active={coupon.status === 'active'} onClick={() => handleToggle(coupon._id)} />
                  </div>
                  <div className="admin-project-actions">
                    <button className="admin-btn admin-btn--edit" onClick={() => openEdit(coupon)} type="button">Edit</button>
                    <button className="admin-btn admin-btn--cancel admin-banner-delete" onClick={() => setDeleteConfirmId(coupon._id)} type="button">Delete</button>
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

      {deletingCoupon && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="admin-modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Delete Coupon?</h3>
            <p className="admin-modal-text">Are you sure you want to delete &ldquo;{deletingCoupon.code}&rdquo;?</p>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn--cancel" onClick={() => setDeleteConfirmId(null)} type="button">Cancel</button>
              <button className="admin-btn admin-btn--danger" onClick={() => handleDelete(deletingCoupon._id)} type="button">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
