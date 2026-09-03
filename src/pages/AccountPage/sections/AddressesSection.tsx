import { useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import AccountSectionHeader from '../AccountSectionHeader';
import {
  getCustomerAddresses,
  upsertCustomerAddress,
  deleteCustomerAddress,
  generateAddressId,
  type CustomerAddress,
} from '../../../data/customerStore';

interface AddressForm {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const EMPTY: AddressForm = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

export default function AddressesSection() {
  const { customerId } = useOutletContext<{ customerId: string }>();
  const addresses = useMemo(() => getCustomerAddresses(customerId), [customerId]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [, force] = useState(0);

  const refresh = () => force((n) => n + 1);

  const startNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY, isDefault: addresses.length === 0 });
    setErrors({});
    setShowForm(true);
  };

  const startEdit = (a: CustomerAddress) => {
    setEditingId(a.id);
    setForm({
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 ?? '',
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.isDefault,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.label.trim()) nextErrors.label = 'Add a label (e.g. Home)';
    if (!form.fullName.trim()) nextErrors.fullName = 'Enter the recipient name';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid 10-digit mobile number';
    if (!form.line1.trim()) nextErrors.line1 = 'Enter the address line 1';
    if (!form.city.trim()) nextErrors.city = 'Enter the city';
    if (!form.state.trim()) nextErrors.state = 'Enter the state';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) nextErrors.pincode = 'Enter a valid 6-digit pincode';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    upsertCustomerAddress({
      id: editingId ?? generateAddressId(),
      customerId,
      label: form.label.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      isDefault: form.isDefault || addresses.length === 0,
    });
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteCustomerAddress(id);
    refresh();
  };

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Delivery & Service"
        title="Saved Addresses"
        description="Manage the addresses used for deliveries and service visits."
        action={
          !showForm ? (
            <button type="button" className="acc-btn acc-btn--primary" onClick={startNew}>
              + Add Address
            </button>
          ) : undefined
        }
      />

      {showForm && (
        <form className="acc-form" onSubmit={handleSubmit} noValidate>
          <div className="acc-form-card">
            <h2 className="acc-form-title">{editingId ? 'Edit Address' : 'Add Address'}</h2>
            <div className="acc-field">
              <label className="acc-label" htmlFor="addr-label">Label</label>
              <input id="addr-label" type="text" className="acc-input" placeholder="Home / Office / Site"
                value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
              {errors.label && <span className="acc-error">{errors.label}</span>}
            </div>
            <div className="acc-grid">
              <div className="acc-field">
                <label className="acc-label" htmlFor="addr-name">Recipient Name</label>
                <input id="addr-name" type="text" className="acc-input" placeholder="Full name"
                  value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
                {errors.fullName && <span className="acc-error">{errors.fullName}</span>}
              </div>
              <div className="acc-field">
                <label className="acc-label" htmlFor="addr-phone">Phone</label>
                <input id="addr-phone" type="tel" className="acc-input" placeholder="98765 43210"
                  value={form.phone} inputMode="numeric"
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                {errors.phone && <span className="acc-error">{errors.phone}</span>}
              </div>
            </div>
            <div className="acc-field">
              <label className="acc-label" htmlFor="addr-line1">Address Line 1</label>
              <input id="addr-line1" type="text" className="acc-input" placeholder="House no., street"
                value={form.line1} onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))} />
              {errors.line1 && <span className="acc-error">{errors.line1}</span>}
            </div>
            <div className="acc-field">
              <label className="acc-label" htmlFor="addr-line2">Address Line 2 (optional)</label>
              <input id="addr-line2" type="text" className="acc-input" placeholder="Area, landmark"
                value={form.line2} onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))} />
            </div>
            <div className="acc-grid">
              <div className="acc-field">
                <label className="acc-label" htmlFor="addr-city">City</label>
                <input id="addr-city" type="text" className="acc-input" placeholder="City"
                  value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                {errors.city && <span className="acc-error">{errors.city}</span>}
              </div>
              <div className="acc-field">
                <label className="acc-label" htmlFor="addr-state">State</label>
                <input id="addr-state" type="text" className="acc-input" placeholder="State"
                  value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
                {errors.state && <span className="acc-error">{errors.state}</span>}
              </div>
            </div>
            <div className="acc-field">
              <label className="acc-label" htmlFor="addr-pincode">Pincode</label>
              <input id="addr-pincode" type="text" className="acc-input" placeholder="6-digit pincode"
                value={form.pincode} inputMode="numeric"
                onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} />
              {errors.pincode && <span className="acc-error">{errors.pincode}</span>}
            </div>
            <label className="acc-pref-row">
              <span className="acc-pref-text">
                <span className="acc-pref-label">Set as default address</span>
              </span>
              <input type="checkbox" className="acc-pref-input" checked={form.isDefault}
                onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} />
            </label>
            <div className="acc-form-actions">
              <button type="button" className="acc-btn acc-btn--ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button type="submit" className="acc-btn acc-btn--primary">
                {editingId ? 'Save Changes' : 'Add Address'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="acc-empty">
          <h2 className="acc-empty-title">No saved addresses</h2>
          <p className="acc-empty-text">Add an address to use for deliveries and service visits.</p>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="acc-addr-list">
          {addresses.map((addr) => (
            <article key={addr.id} className="acc-addr-card">
              <div className="acc-addr-head">
                <span className="acc-addr-label">{addr.label}</span>
                {addr.isDefault && <span className="acc-badge">Default</span>}
              </div>
              <p className="acc-addr-name">{addr.fullName}</p>
              <p className="acc-addr-detail">+91 {addr.phone}</p>
              <p className="acc-addr-detail">
                {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
              </p>
              <div className="acc-addr-actions">
                <button type="button" className="acc-btn acc-btn--ghost" onClick={() => startEdit(addr)}>
                  Edit
                </button>
                <button type="button" className="acc-btn acc-btn--danger" onClick={() => handleDelete(addr.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
