import { useState, type FormEvent } from 'react';
import AccountSectionHeader from '../AccountSectionHeader';

const LOCAL_PIN_KEY = 'vs_account_local_pin';

export default function SecuritySection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError('');

    const existing = (() => {
      try {
        return localStorage.getItem(LOCAL_PIN_KEY) ?? '';
      } catch {
        return '';
      }
    })();

    if (!current.trim()) {
      setError('Enter your current password.');
      return;
    }
    if (existing && current.trim() !== existing) {
      setError('Current password is incorrect.');
      return;
    }
    if (!next.trim() || next.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      localStorage.setItem(LOCAL_PIN_KEY, next.trim());
    } catch {
      setError('Could not save on this device.');
      return;
    }
    setCurrent('');
    setNext('');
    setConfirm('');
    setSaved(true);
  };

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Privacy & Safety"
        title="Security"
        description="Manage your password and review how sign-in works."
      />

      <form className="acc-form" onSubmit={handleSubmit} noValidate>
        <div className="acc-form-card">
          <h2 className="acc-form-title">Change Password</h2>
          <p className="acc-form-note">
            Update your password to keep your account secure.
          </p>
          <div className="acc-field">
            <label className="acc-label" htmlFor="sec-current">Current Password</label>
            <input id="sec-current" type="password" className="acc-input" placeholder="Current password"
              value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="acc-grid">
            <div className="acc-field">
              <label className="acc-label" htmlFor="sec-new">New Password</label>
              <input id="sec-new" type="password" className="acc-input" placeholder="Enter new password"
                value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="acc-field">
              <label className="acc-label" htmlFor="sec-confirm">Confirm New Password</label>
              <input id="sec-confirm" type="password" className="acc-input" placeholder="Re-enter new password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          {error && <span className="acc-error">{error}</span>}
          {saved && (
            <div className="acc-notice" role="status">
              Your password has been updated on this device.
            </div>
          )}
          <div className="acc-form-actions">
            <button type="submit" className="acc-btn acc-btn--primary">Update Password</button>
          </div>
        </div>
      </form>

      <div className="acc-form-card acc-form-card--static">
        <h2 className="acc-form-title">About Sign-in</h2>
        <p className="acc-form-note">
          Sign-in is currently UI-only for this preview. Your mobile number and password are not stored
          or validated against any server. A real secure sign-in will replace this when an authentication
          service is connected.
        </p>
      </div>
    </div>
  );
}
