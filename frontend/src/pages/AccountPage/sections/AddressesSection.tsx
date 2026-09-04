import { useState, useEffect, useCallback, type FormEvent } from 'react';
import AccountSectionHeader from '../AccountSectionHeader';
import {
  getAddressesAPI,
  addAddressAPI,
  updateAddressAPI,
  deleteAddressAPI,
  setDefaultAddressAPI,
  type Address,
  type AddressFormData,
} from '../../../api/addresses';

interface AddressForm {
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const EMPTY: AddressForm = {
  label: 'Home',
  recipientName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

export default function AddressesSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});

  const fetchAddresses = useCallback(async () => {
    try {
      setApiError(null);
      const res = await getAddressesAPI();
      if (res.success && res.data) {
        setAddresses(res.data.addresses);
      }
    } catch (err: any) {
      setApiError(err?.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const startNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY, isDefault: addresses.length === 0 });
    setErrors({});
    setApiError(null);
    setShowForm(true);
  };

  const startEdit = (a: Address) => {
    setEditingId(a._id);
    setForm({
      label: a.label,
      recipientName: a.recipientName,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? '',
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.isDefault,
    });
    setErrors({});
    setApiError(null);
    setShowForm(true);
  };

  const toApiPayload = (f: AddressForm): AddressFormData => ({
    label: f.label.trim(),
    recipientName: f.recipientName.trim(),
    phone: f.phone.trim(),
    addressLine1: f.addressLine1.trim(),
    addressLine2: f.addressLine2.trim(),
    city: f.city.trim(),
    state: f.state.trim(),
    pincode: f.pincode.trim(),
    isDefault: f.isDefault,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const nextErrors: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.label.trim()) nextErrors.label = 'Add a label (e.g. Home)';
    if (!form.recipientName.trim()) nextErrors.recipientName = 'Enter the recipient name';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid 10-digit mobile number';
    if (!form.addressLine1.trim()) nextErrors.addressLine1 = 'Enter the address line 1';
    if (!form.city.trim()) nextErrors.city = 'Enter the city';
    if (!form.state.trim()) nextErrors.state = 'Enter the state';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) nextErrors.pincode = 'Enter a valid 6-digit pincode';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = toApiPayload(form);
      if (editingId) {
        await updateAddressAPI(editingId, payload);
      } else {
        await addAddressAPI(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY);
      await fetchAddresses();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setApiError(null);
      await deleteAddressAPI(id);
      await fetchAddresses();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setApiError(null);
      await setDefaultAddressAPI(id);
      await fetchAddresses();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to set default address');
    }
  };

  if (loading) {
    return (
      <div>
        <AccountSectionHeader
          eyebrow="Delivery & Service"
          title="Saved Addresses"
          description="Manage the addresses used for deliveries and service visits."
        />
        <div className="acc-empty">
          <p className="acc-empty-text">Loading addresses...</p>
        </div>
      </div>
    );
  }

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

      {apiError && (
        <div className="login-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
          {apiError}
        </div>
      )}

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
                  value={form.recipientName} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} />
                {errors.recipientName && <span className="acc-error">{errors.recipientName}</span>}
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
                value={form.addressLine1} onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))} />
              {errors.addressLine1 && <span className="acc-error">{errors.addressLine1}</span>}
            </div>
            <div className="acc-field">
              <label className="acc-label" htmlFor="addr-line2">Address Line 2 (optional)</label>
              <input id="addr-line2" type="text" className="acc-input" placeholder="Area, landmark"
                value={form.addressLine2} onChange={(e) => setForm((p) => ({ ...p, addressLine2: e.target.value }))} />
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
              <button type="submit" className="acc-btn acc-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Address'}
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
            <article key={addr._id} className="acc-addr-card">
              <div className="acc-addr-head">
                <span className="acc-addr-label">{addr.label}</span>
                {addr.isDefault && <span className="acc-badge">Default</span>}
              </div>
              <p className="acc-addr-name">{addr.recipientName}</p>
              <p className="acc-addr-detail">+91 {addr.phone}</p>
              <p className="acc-addr-detail">
                {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
              </p>
              <div className="acc-addr-actions">
                {!addr.isDefault && (
                  <button type="button" className="acc-btn acc-btn--ghost" onClick={() => handleSetDefault(addr._id)}>
                    Set Default
                  </button>
                )}
                <button type="button" className="acc-btn acc-btn--ghost" onClick={() => startEdit(addr)}>
                  Edit
                </button>
                <button type="button" className="acc-btn acc-btn--danger" onClick={() => handleDelete(addr._id)}>
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
