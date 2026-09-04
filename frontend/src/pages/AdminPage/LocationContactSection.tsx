import { useCallback, useEffect, useRef, useState } from 'react';
import { locations } from '../../data/locations';
import {
  getLocationContacts,
  updateLocationContact,
  resetLocationContacts,
  seedLocationContacts,
  type LocationContact,
} from '../../data/locationContacts';
import AdminToggle from './AdminToggle';
import './AdminPage.css';
import './AdminShell.css';

interface LocationContactForm {
  displayAddress: string;
  phone: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  mapUrl: string;
  active: boolean;
}

function buildForm(c: LocationContact): LocationContactForm {
  return {
    displayAddress: c.displayAddress,
    phone: c.phone,
    phoneTel: c.phoneTel,
    whatsapp: c.whatsapp,
    email: c.email,
    mapUrl: c.mapUrl ?? '',
    active: c.active,
  };
}

function buildSeedForms(): Record<string, LocationContactForm> {
  const forms: Record<string, LocationContactForm> = {};
  seedLocationContacts.forEach((c) => {
    forms[c.id] = buildForm(c);
  });
  return forms;
}

const DEFAULT_TOAST_MS = 2600;

interface ToastState {
  message: string;
  isError: boolean;
}

export default function LocationContactSection() {
  const [contacts, setContacts] = useState<LocationContact[]>(() => getLocationContacts());
  const [drafts, setDrafts] = useState<Record<string, LocationContactForm>>(() => {
    const forms: Record<string, LocationContactForm> = {};
    getLocationContacts().forEach((c) => {
      forms[c.id] = buildForm(c);
    });
    return forms;
  });
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

  const contactById = (id: string) => contacts.find((c) => c.id === id);

  const setField = (id: string, field: keyof LocationContactForm, value: string | boolean) => {
    setDrafts((prev) => {
      const current = prev[id] ?? buildForm(contactById(id) ?? seedLocationContacts[0]);
      return { ...prev, [id]: { ...current, [field]: value } };
    });
  };

  const handleToggle = (id: string) => {
    const current = contactById(id);
    if (!current) return;
    const updated = updateLocationContact(id, { active: !current.active });
    setContacts(updated);
    setDrafts((prev) => {
      const draft = prev[id] ?? buildForm(current);
      return { ...prev, [id]: { ...draft, active: !current.active } };
    });
    showToast(!current.active ? 'Location activated' : 'Location deactivated');
  };

  const handleSave = (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    const updated = updateLocationContact(id, {
      displayAddress: draft.displayAddress.trim(),
      phone: draft.phone.trim(),
      phoneTel: draft.phoneTel.trim(),
      whatsapp: draft.whatsapp.trim(),
      email: draft.email.trim(),
      mapUrl: draft.mapUrl.trim() || undefined,
      active: draft.active,
    });
    setContacts(updated);
    showToast('Contact details saved');
  };

  const handleResetLocation = (id: string) => {
    const seed = seedLocationContacts.find((c) => c.id === id);
    if (!seed) return;
    const updated = updateLocationContact(id, { ...seed });
    setContacts(updated);
    setDrafts((prev) => ({ ...prev, [id]: buildForm(seed) }));
    showToast('Location reset to default');
  };

  const handleResetClick = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    setResetConfirm(false);
    setContacts(resetLocationContacts());
    setDrafts(buildSeedForms());
    showToast('Locations restored to defaults');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Locations</h1>
        <p className="admin-subtitle">
          Manage the contact details shown in the website Footer for each service location.
          The Footer automatically uses the details of the location a visitor selects.
          Changes are saved to browser storage.
        </p>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--reset" onClick={handleResetClick} type="button">
            {resetConfirm ? 'Confirm reset?' : 'Reset to Defaults'}
          </button>
        </div>
      </div>

      <div className="admin-locations-list">
        {locations.map((loc) => {
          const contact = contactById(loc.id);
          const draft = drafts[loc.id] ?? buildForm(contact ?? seedLocationContacts[0]);
          return (
            <div
              key={loc.id}
              className={`admin-location-card${draft.active ? ' admin-location-card--active' : ''}`}
            >
              <div className="admin-location-head">
                <div className="admin-location-heading">
                  <h3 className="admin-project-name">{loc.city}</h3>
                  <p className="admin-project-meta">
                    {loc.id} &middot; {loc.state}
                  </p>
                </div>
                <span className={`admin-featured-badge${draft.active ? ' admin-featured-badge--on' : ''}`}>
                  {draft.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="admin-edit-grid">
                <label className="admin-field admin-field--wide">
                  <span className="admin-field-label">Display Address</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={draft.displayAddress}
                    onChange={(e) => setField(loc.id, 'displayAddress', e.target.value)}
                    placeholder="City, State, India"
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-field-label">Phone (display)</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={draft.phone}
                    onChange={(e) => setField(loc.id, 'phone', e.target.value)}
                    placeholder="+91 90088 55088"
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-field-label">Phone Link</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={draft.phoneTel}
                    onChange={(e) => setField(loc.id, 'phoneTel', e.target.value)}
                    placeholder="tel:+919008855088"
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-field-label">WhatsApp URL</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={draft.whatsapp}
                    onChange={(e) => setField(loc.id, 'whatsapp', e.target.value)}
                    placeholder="https://wa.me/919008855088"
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-field-label">Email</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={draft.email}
                    onChange={(e) => setField(loc.id, 'email', e.target.value)}
                    placeholder="info@vijayasiri.com"
                  />
                </label>
                <label className="admin-field">
                  <span className="admin-field-label">Map URL (optional)</span>
                  <input
                    type="text"
                    className="admin-input"
                    value={draft.mapUrl}
                    onChange={(e) => setField(loc.id, 'mapUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                  />
                </label>
                <div className="admin-field admin-field--wide">
                  <span className="admin-field-label">Status</span>
                  <div className="admin-location-status">
                    <div className="admin-location-status-row">
                      <AdminToggle active={draft.active} onClick={() => handleToggle(loc.id)} />
                      <span className="admin-location-status-label">
                        {draft.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="admin-location-status-note">
                      {draft.active
                        ? 'Customers who select this location will see these contact details.'
                        : 'Inactive — customers who select this location will continue seeing the default Siruguppa contact details until real details are entered.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="admin-edit-actions">
                <button
                  className="admin-btn admin-btn--save"
                  onClick={() => handleSave(loc.id)}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="admin-btn admin-btn--reset"
                  onClick={() => handleResetLocation(loc.id)}
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          );
        })}
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