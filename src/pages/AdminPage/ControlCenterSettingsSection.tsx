import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  getControlCenterSettings,
  saveControlCenterSettings,
  resetControlCenterSettings,
  type ControlCenterSettings,
  type SystemDateFormat,
  type SystemLanguage,
  type SystemTimeFormat,
  type SystemTimeZone,
} from '../../data/controlCenterSettings';
import './AdminShell.css';
import './AdminPage.css';
import './ControlCenterModules.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

type BusinessKeys = 'companyName' | 'businessType' | 'registeredAddress';
type ContactKeys = 'supportEmail' | 'supportPhone' | 'publicAddress';

const BUSINESS_FIELDS: Array<{ key: BusinessKeys; label: string; placeholder: string }> = [
  { key: 'companyName', label: 'Company Name', placeholder: 'Enter company name' },
  { key: 'businessType', label: 'Business Type', placeholder: 'Enter business type' },
  { key: 'registeredAddress', label: 'Registered Address', placeholder: 'Enter registered address' },
];

const CONTACT_FIELDS: Array<{
  key: ContactKeys;
  label: string;
  placeholder: string;
  type?: string;
}> = [
  { key: 'supportEmail', label: 'Support Email', placeholder: 'Enter support email', type: 'email' },
  { key: 'supportPhone', label: 'Support Phone', placeholder: 'Enter 10-digit mobile number', type: 'tel' },
  { key: 'publicAddress', label: 'Public Address', placeholder: 'Enter public address', type: 'text' },
];

const NOTIFICATION_OPTIONS = [
  { key: 'emailNotifications', label: 'Email Notifications' },
  { key: 'bookingAlerts', label: 'Booking Alerts' },
  { key: 'leadAlerts', label: 'Lead Alerts' },
] as const;

type NotificationKey = (typeof NOTIFICATION_OPTIONS)[number]['key'];

const NOT_CONNECTED_NOTE =
  'These settings are currently stored on this device. Centralized settings will be connected when the backend is available.';

function SettingsSwitch({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: () => void;
}) {
  const stateLabel = active ? 'enabled' : 'disabled';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${label} ${stateLabel}`}
      title={stateLabel}
      className={`admin-toggle${active ? ' admin-toggle--on' : ''}`}
      onClick={onChange}
    >
      <span className="admin-toggle-track" aria-hidden="true" />
    </button>
  );
}

function SystemSelect<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: ReadonlyArray<{ value: V; label: string }>;
  onChange: (value: V) => void;
}) {
  const selectId = `settings-system-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="cc-setting-select-row">
      <label className="cc-setting-label" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        className="admin-input cc-setting-select"
        value={value}
        onChange={(e) => onChange(e.target.value as V)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ControlCenterSettingsSection() {
  const [settings, setSettings] = useState<ControlCenterSettings>(() =>
    getControlCenterSettings()
  );
  const [editing, setEditing] = useState<'business' | 'contact' | null>(null);
  const [businessDraft, setBusinessDraft] = useState({
    companyName: '',
    businessType: '',
    registeredAddress: '',
  });
  const [contactDraft, setContactDraft] = useState({
    supportEmail: '',
    supportPhone: '',
    publicAddress: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!resetConfirm) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setResetConfirm(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resetConfirm]);

  const startEdit = (section: 'business' | 'contact') => {
    if (section === 'business') {
      setBusinessDraft({ ...settings.business });
    } else {
      setContactDraft({ ...settings.contact });
    }
    setErrors({});
    setEditing(section);
  };

  const cancelEdit = () => {
    setErrors({});
    setEditing(null);
  };

  const handleBusinessChange = (key: BusinessKeys, value: string) => {
    setBusinessDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleContactChange = (key: ContactKeys, value: string) => {
    setContactDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateBusiness = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!businessDraft.companyName.trim()) next.companyName = 'Company name is required';
    if (!businessDraft.businessType.trim()) next.businessType = 'Business type is required';
    if (!businessDraft.registeredAddress.trim()) {
      next.registeredAddress = 'Registered address is required';
    }
    return next;
  };

  const validateContact = (): Record<string, string> => {
    const next: Record<string, string> = {};
    const email = contactDraft.supportEmail.trim();
    if (!email) next.supportEmail = 'Support email is required';
    else if (!EMAIL_RE.test(email)) next.supportEmail = 'Enter a valid email address';
    const phone = contactDraft.supportPhone.trim();
    if (phone && !MOBILE_RE.test(phone)) {
      next.supportPhone = 'Enter a valid 10-digit mobile number';
    }
    if (!contactDraft.publicAddress.trim()) next.publicAddress = 'Public address is required';
    return next;
  };

  const handleBusinessSave = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateBusiness();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = saveControlCenterSettings({
      ...settings,
      business: {
        companyName: businessDraft.companyName.trim(),
        businessType: businessDraft.businessType.trim(),
        registeredAddress: businessDraft.registeredAddress.trim(),
      },
    });
    setSettings(next);
    setEditing(null);
    setErrors({});
    showToast('Settings saved on this device.');
  };

  const handleContactSave = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateContact();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const next = saveControlCenterSettings({
      ...settings,
      contact: {
        supportEmail: contactDraft.supportEmail.trim(),
        supportPhone: contactDraft.supportPhone.trim(),
        publicAddress: contactDraft.publicAddress.trim(),
      },
    });
    setSettings(next);
    setEditing(null);
    setErrors({});
    showToast('Settings saved on this device.');
  };

  const toggleNotification = (key: NotificationKey) => {
    const next = saveControlCenterSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] },
    });
    setSettings(next);
  };

  const updateSystem = <K extends keyof ControlCenterSettings['system']>(
    key: K,
    value: ControlCenterSettings['system'][K]
  ) => {
    const next = saveControlCenterSettings({
      ...settings,
      system: { ...settings.system, [key]: value },
    });
    setSettings(next);
  };

  const handleConfirmReset = () => {
    const next = resetControlCenterSettings();
    setSettings(next);
    setEditing(null);
    setErrors({});
    setResetConfirm(false);
    showToast('Settings reset to default values on this device.');
  };

  const displayValue = (value: string) => (value.trim() ? value : 'Not configured');

  interface EditableField<K extends string> {
  key: K;
  label: string;
  placeholder: string;
  type?: string;
}

const renderEditableFields = <K extends string>(
    fields: ReadonlyArray<EditableField<K>>,
    draft: Record<K, string>,
    handleChange: (key: K, value: string) => void,
    section: 'business' | 'contact'
  ): ReactNode => (
    <div className="cc-settings-form-fields">
      {fields.map((field) => (
        <div
          className={`admin-field cc-profile-field${errors[field.key] ? ' cc-profile-field--error' : ''}`}
          key={field.key}
        >
          <label className="admin-field-label" htmlFor={`settings-${section}-${field.key}`}>
            {field.label} *
          </label>
          <input
            id={`settings-${section}-${field.key}`}
            className="admin-input"
            type={field.type ?? 'text'}
            placeholder={field.placeholder}
            value={draft[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            aria-invalid={Boolean(errors[field.key])}
            aria-describedby={errors[field.key] ? `settings-${section}-${field.key}-error` : undefined}
          />
          {errors[field.key] && (
            <span id={`settings-${section}-${field.key}-error`} className="cc-profile-error">
              {errors[field.key]}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Settings</h1>
        <p className="admin-dash-subtitle">Manage Control Center preferences and configuration.</p>
      </header>

      <div className="cc-settings-grid">
        {/* BUSINESS INFORMATION */}
        <section className="cc-settings-card">
          <div className="cc-settings-card-head">
            <div>
              <h2 className="cc-settings-card-title">Business Information</h2>
              <p className="cc-settings-card-desc">Core details about the business.</p>
            </div>
            {editing !== 'business' && (
              <button
                type="button"
                className="admin-btn admin-btn--view"
                onClick={() => startEdit('business')}
              >
                Edit
              </button>
            )}
          </div>
          {editing === 'business' ? (
            <form className="cc-settings-form" onSubmit={handleBusinessSave} noValidate>
              {renderEditableFields(BUSINESS_FIELDS, businessDraft, handleBusinessChange, 'business')}
              <div className="cc-profile-form-actions">
                <button type="submit" className="admin-btn admin-btn--save">
                  Save Changes
                </button>
                <button type="button" className="admin-btn admin-btn--cancel" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <ul className="cc-setting-rows">
              <li className="cc-setting-row">
                <span className="cc-setting-label">Company Name</span>
                <span className="cc-setting-value">{displayValue(settings.business.companyName)}</span>
              </li>
              <li className="cc-setting-row">
                <span className="cc-setting-label">Business Type</span>
                <span className="cc-setting-value">{displayValue(settings.business.businessType)}</span>
              </li>
              <li className="cc-setting-row">
                <span className="cc-setting-label">Registered Address</span>
                <span className="cc-setting-value">
                  {displayValue(settings.business.registeredAddress)}
                </span>
              </li>
            </ul>
          )}
        </section>

        {/* CONTACT INFORMATION */}
        <section className="cc-settings-card">
          <div className="cc-settings-card-head">
            <div>
              <h2 className="cc-settings-card-title">Contact Information</h2>
              <p className="cc-settings-card-desc">Public contact details shown to customers.</p>
            </div>
            {editing !== 'contact' && (
              <button
                type="button"
                className="admin-btn admin-btn--view"
                onClick={() => startEdit('contact')}
              >
                Edit
              </button>
            )}
          </div>
          {editing === 'contact' ? (
            <form className="cc-settings-form" onSubmit={handleContactSave} noValidate>
              {renderEditableFields(
                CONTACT_FIELDS,
                contactDraft,
                handleContactChange,
                'contact'
              )}
              <div className="cc-profile-form-actions">
                <button type="submit" className="admin-btn admin-btn--save">
                  Save Changes
                </button>
                <button type="button" className="admin-btn admin-btn--cancel" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <ul className="cc-setting-rows">
              <li className="cc-setting-row">
                <span className="cc-setting-label">Support Email</span>
                <span className="cc-setting-value">
                  {displayValue(settings.contact.supportEmail)}
                </span>
              </li>
              <li className="cc-setting-row">
                <span className="cc-setting-label">Support Phone</span>
                <span className="cc-setting-value">
                  {displayValue(settings.contact.supportPhone)}
                </span>
              </li>
              <li className="cc-setting-row">
                <span className="cc-setting-label">Public Address</span>
                <span className="cc-setting-value">
                  {displayValue(settings.contact.publicAddress)}
                </span>
              </li>
            </ul>
          )}
        </section>

        {/* NOTIFICATION PREFERENCES */}
        <section className="cc-settings-card">
          <div className="cc-settings-card-head">
            <div>
              <h2 className="cc-settings-card-title">Notification Preferences</h2>
              <p className="cc-settings-card-desc">How the Control Center sends alerts and updates.</p>
            </div>
          </div>
          <ul className="cc-setting-rows">
            {NOTIFICATION_OPTIONS.map((option) => (
              <li className="cc-setting-row" key={option.key}>
                <span className="cc-setting-label">{option.label}</span>
                <span className="cc-settings-toggle">
                  <span
                    className={`admin-featured-badge${settings.notifications[option.key] ? ' admin-featured-badge--on' : ''}`}
                  >
                    {settings.notifications[option.key] ? 'On' : 'Off'}
                  </span>
                  <SettingsSwitch
                    label={option.label}
                    active={settings.notifications[option.key]}
                    onChange={() => toggleNotification(option.key)}
                  />
                </span>
              </li>
            ))}
          </ul>
          <p className="cc-setting-note">
            Notification delivery will be connected when the notification system is available.
          </p>
        </section>

        {/* SYSTEM PREFERENCES */}
        <section className="cc-settings-card">
          <div className="cc-settings-card-head">
            <div>
              <h2 className="cc-settings-card-title">System Preferences</h2>
              <p className="cc-settings-card-desc">General behaviour of the Control Center.</p>
            </div>
          </div>
          <div className="cc-setting-rows">
            <SystemSelect<SystemLanguage>
              label="Language"
              value={settings.system.language}
              options={[{ value: 'english', label: 'English' }]}
              onChange={(value) => updateSystem('language', value)}
            />
            <SystemSelect<SystemTimeZone>
              label="Time Zone"
              value={settings.system.timeZone}
              options={[{ value: 'Asia/Kolkata', label: 'Asia/Kolkata' }]}
              onChange={(value) => updateSystem('timeZone', value)}
            />
            <SystemSelect<SystemDateFormat>
              label="Date Format"
              value={settings.system.dateFormat}
              options={[{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }]}
              onChange={(value) => updateSystem('dateFormat', value)}
            />
            <SystemSelect<SystemTimeFormat>
              label="Time Format"
              value={settings.system.timeFormat}
              options={[
                { value: '12-hour', label: '12-hour' },
                { value: '24-hour', label: '24-hour' },
              ]}
              onChange={(value) => updateSystem('timeFormat', value)}
            />
          </div>
          <p className="cc-setting-note">These preferences apply to the Control Center only.</p>
        </section>
      </div>

      <div className="cc-settings-footer">
        <button
          type="button"
          className="admin-btn admin-btn--reset"
          onClick={() => setResetConfirm(true)}
        >
          Reset to Defaults
        </button>
        <p className="cc-settings-note cc-settings-note--center">{NOT_CONNECTED_NOTE}</p>
      </div>

      {/* RESET CONFIRMATION */}
      {resetConfirm && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setResetConfirm(false)}
          role="presentation"
        >
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Reset Control Center settings"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Reset Settings?</h3>
            <p className="admin-modal-text">
              Reset Control Center settings to their default values?
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn admin-btn--cancel"
                onClick={() => setResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--danger"
                onClick={handleConfirmReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="admin-toast" role="status">
          <span className="admin-toast-dot" />
          {toast}
        </div>
      )}
    </div>
  );
}