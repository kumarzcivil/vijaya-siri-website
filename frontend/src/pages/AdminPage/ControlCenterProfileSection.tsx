import { useState, type FormEvent } from 'react';
import Icon from '../../components/Icon/Icon';
import './AdminPage.css';
import './AdminShell.css';
import './ControlCenterModules.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

interface ProfileFormState {
  fullName: string;
  role: string;
  email: string;
  mobile: string;
}

interface ProfileErrors {
  fullName?: string;
  role?: string;
  email?: string;
  mobile?: string;
}

const EMPTY_FORM: ProfileFormState = { fullName: '', role: '', email: '', mobile: '' };

const PROFILE_FIELDS: Array<{
  key: keyof ProfileFormState;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  required: boolean;
}> = [
  {
    key: 'fullName',
    label: 'Full Name',
    type: 'text',
    placeholder: 'Enter your full name',
    autoComplete: 'name',
    required: true,
  },
  {
    key: 'role',
    label: 'Role',
    type: 'text',
    placeholder: 'Enter your role',
    autoComplete: 'organization-title',
    required: true,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    autoComplete: 'email',
    required: true,
  },
  {
    key: 'mobile',
    label: 'Mobile Number',
    type: 'tel',
    placeholder: 'Enter 10-digit mobile number',
    autoComplete: 'tel',
    required: false,
  },
];

function validateProfile(form: ProfileFormState): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  if (!form.role.trim()) errors.role = 'Role is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (form.mobile.trim() && !MOBILE_RE.test(form.mobile.trim())) {
    errors.mobile = 'Enter a valid 10-digit mobile number';
  }
  return errors;
}

const EM_DASH = '\u2014';

export default function ControlCenterProfileSection() {
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileFormState>(EMPTY_FORM);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [showNotice, setShowNotice] = useState(false);

  const openEdit = () => {
    setForm(savedProfile);
    setErrors({});
    setShowNotice(false);
    setEditing(true);
  };

  const handleFieldChange = (key: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setForm(savedProfile);
    setErrors({});
    setEditing(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      const next = {
        fullName: form.fullName.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
      };
      setSavedProfile(next);
      setForm(next);
      setHasSavedProfile(true);
      setEditing(false);
      setShowNotice(true);
      setIsSubmitting(false);
    }, 350);
  };

  const hasMobile = savedProfile.mobile.trim().length > 0;

  return (
    <div className="cc-page">
      <header className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Admin Profile</h1>
        <p className="admin-dash-subtitle">Manage your Control Center profile.</p>
      </header>

      <div className="cc-profile-card">
        <div className="cc-profile-head">
          <span className="cc-profile-avatar" aria-hidden="true">
            <Icon name="users" size={30} />
          </span>
          <div className="cc-profile-title">
            <h2>Control Center Profile</h2>
            <p>Profile details will appear once administrator accounts are connected.</p>
          </div>
          {!editing && (
            <div className="cc-profile-actions">
              <button
                type="button"
                className="admin-btn admin-btn--view"
                onClick={openEdit}
                aria-label={hasSavedProfile ? 'Edit profile details' : 'Add profile details'}
              >
                {hasSavedProfile ? 'Edit Details' : 'Add Details'}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <form className="cc-profile-form" onSubmit={handleSubmit} noValidate>
            <div className="cc-profile-form-grid">
              {PROFILE_FIELDS.map((field) => (
                <div
                  className={`admin-field cc-profile-field${errors[field.key] ? ' cc-profile-field--error' : ''}`}
                  key={field.key}
                >
                  <label className="admin-field-label" htmlFor={`profile-${field.key}`}>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  <input
                    id={`profile-${field.key}`}
                    type={field.type}
                    className="admin-input"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    autoComplete={field.autoComplete}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={errors[field.key] ? `profile-${field.key}-error` : undefined}
                  />
                  {errors[field.key] && (
                    <span id={`profile-${field.key}-error`} className="cc-profile-error">
                      {errors[field.key]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="cc-profile-form-actions">
              <button type="submit" className="admin-btn admin-btn--save" disabled={isSubmitting}>
                Save Details
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <ul className="cc-setting-rows">
              <li className="cc-setting-row">
                <span className="cc-setting-label">Name</span>
                <span className="cc-setting-value">Sri-Kumar</span>
              </li>
              <li className="cc-setting-row">
                <span className="cc-setting-label">Role</span>
                <span className="cc-setting-value">Admin</span>
              </li>
              <li className="cc-setting-row">
                <span className="cc-setting-label">Email</span>
                <span className="cc-setting-value">admin@vijayasiri.com</span>
              </li>
              {hasMobile && (
                <li className="cc-setting-row">
                  <span className="cc-setting-label">Mobile</span>
                  <span className="cc-setting-value">{savedProfile.mobile}</span>
                </li>
              )}
              <li className="cc-setting-row">
                <span className="cc-setting-label">Account Status</span>
                <span className="cc-setting-value">
                  <span className="cc-empty-status">Not connected</span>
                </span>
              </li>
            </ul>

            {showNotice && (
              <div className="cc-profile-notice" role="status">
                Profile details are ready to be connected to your administrator account.
              </div>
            )}

            <p className="cc-setting-note">
              Profile and account management will be connected with authentication later.
            </p>
          </>
        )}
      </div>
    </div>
  );
}