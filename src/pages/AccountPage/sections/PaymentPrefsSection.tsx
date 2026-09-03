import { useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import AccountSectionHeader from '../AccountSectionHeader';
import {
  getPaymentPreferences,
  upsertPaymentPreference,
  deletePaymentPreference,
  generatePaymentPreferenceId,
  type PaymentMethodPreference,
  type PaymentPreference,
} from '../../../data/customerStore';

const METHOD_LABELS: Record<PaymentMethodPreference, string> = {
  UPI: 'UPI',
  CARD: 'Card',
  NETBANKING: 'Net Banking',
  CASH: 'Cash Payment',
};

interface PrefForm {
  method: PaymentMethodPreference;
  label: string;
  upiId: string;
  cardLast4: string;
  bankName: string;
  isDefault: boolean;
}

const EMPTY: PrefForm = {
  method: 'UPI',
  label: '',
  upiId: '',
  cardLast4: '',
  bankName: '',
  isDefault: true,
};

export default function PaymentPrefsSection() {
  const { customerId } = useOutletContext<{ customerId: string }>();
  const prefs = useMemo(() => getPaymentPreferences(customerId), [customerId]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PrefForm>(EMPTY);
  const [error, setError] = useState('');
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const startNew = (method: PaymentMethodPreference) => {
    setEditingId(null);
    setForm({ ...EMPTY, method, isDefault: prefs.length === 0 });
    setError('');
    setShowForm(true);
  };

  const startEdit = (p: PaymentPreference) => {
    setEditingId(p.id);
    setForm({
      method: p.method,
      label: p.label,
      upiId: p.upiId ?? '',
      cardLast4: p.cardLast4 ?? '',
      bankName: p.bankName ?? '',
      isDefault: p.isDefault,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.method === 'UPI' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(form.upiId.trim())) {
      setError('Enter a valid UPI ID (e.g. name@upi).');
      return;
    }
    if (form.method === 'CARD' && !/^\d{4}$/.test(form.cardLast4.trim())) {
      setError('Enter the last 4 digits of your card.');
      return;
    }
    if (form.method === 'NETBANKING' && !form.bankName.trim()) {
      setError('Enter your bank name.');
      return;
    }

    const label = form.method === 'UPI' ? form.upiId.trim() : form.method === 'CARD' ? `Card •••• ${form.cardLast4.trim()}` : form.method === 'NETBANKING' ? form.bankName.trim() : 'Cash Payment';

    upsertPaymentPreference({
      id: editingId ?? generatePaymentPreferenceId(),
      customerId,
      method: form.method,
      label,
      upiId: form.method === 'UPI' ? form.upiId.trim() : undefined,
      cardLast4: form.method === 'CARD' ? form.cardLast4.trim() : undefined,
      bankName: form.method === 'NETBANKING' ? form.bankName.trim() : undefined,
      isDefault: form.isDefault || prefs.length === 0,
    });
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
    refresh();
  };

  const handleDelete = (id: string) => {
    deletePaymentPreference(id);
    refresh();
  };

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Checkout"
        title="Payment Preferences"
        description="Save your preferred payment methods for a faster checkout."
      />

      <div className="acc-method-grid">
        {(Object.keys(METHOD_LABELS) as PaymentMethodPreference[]).map((m) => (
          <button key={m} type="button" className="acc-method-btn" onClick={() => startNew(m)}>
            {METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="acc-form" onSubmit={handleSubmit} noValidate>
          <div className="acc-form-card">
            <h2 className="acc-form-title">{editingId ? 'Edit Method' : 'Add ' + METHOD_LABELS[form.method]}</h2>

            {form.method === 'UPI' && (
              <div className="acc-field">
                <label className="acc-label" htmlFor="pay-upi">UPI ID</label>
                <input id="pay-upi" type="text" className="acc-input" placeholder="name@upi"
                  value={form.upiId} onChange={(e) => setForm((p) => ({ ...p, upiId: e.target.value }))} />
              </div>
            )}
            {form.method === 'CARD' && (
              <div className="acc-field">
                <label className="acc-label" htmlFor="pay-card">Card last 4 digits</label>
                <input id="pay-card" type="text" className="acc-input" placeholder="4321" inputMode="numeric"
                  value={form.cardLast4}
                  onChange={(e) => setForm((p) => ({ ...p, cardLast4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
              </div>
            )}
            {form.method === 'NETBANKING' && (
              <div className="acc-field">
                <label className="acc-label" htmlFor="pay-bank">Bank Name</label>
                <input id="pay-bank" type="text" className="acc-input" placeholder="e.g. State Bank of India"
                  value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} />
              </div>
            )}
            {form.method === 'CASH' && (
              <p className="acc-note">
                Cash payment at the time of service. No details needed.
              </p>
            )}

            {error && <span className="acc-error">{error}</span>}
            <div className="acc-form-actions">
              <button type="button" className="acc-btn acc-btn--ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button type="submit" className="acc-btn acc-btn--primary">
                {editingId ? 'Save Changes' : 'Save Method'}
              </button>
            </div>
          </div>
        </form>
      )}

      {!showForm && prefs.length === 0 && (
        <div className="acc-empty">
          <h2 className="acc-empty-title">No saved payment methods</h2>
          <p className="acc-empty-text">Add a payment preference above for faster checkout.</p>
        </div>
      )}

      {!showForm && prefs.length > 0 && (
        <div className="acc-pref-list">
          {prefs.map((p) => (
            <article key={p.id} className="acc-pref-card">
              <div className="acc-pref-card-head">
                <span className={`acc-pref-method acc-pref-method--${p.method.toLowerCase()}`}>
                  {METHOD_LABELS[p.method]}
                </span>
                {p.isDefault && <span className="acc-badge">Default</span>}
              </div>
              <p className="acc-pref-card-label">{p.label}</p>
              <div className="acc-addr-actions">
                <button type="button" className="acc-btn acc-btn--ghost" onClick={() => startEdit(p)}>Edit</button>
                <button type="button" className="acc-btn acc-btn--danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
