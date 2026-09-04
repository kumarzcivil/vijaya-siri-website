import { useState } from 'react';
import AccountSectionHeader from '../AccountSectionHeader';

export default function SecuritySection() {
  const [notice] = useState('Change password functionality will be available once the backend endpoint is connected.');

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Privacy & Safety"
        title="Security"
        description="Manage your password and review how sign-in works."
      />

      <div className="acc-form-card">
        <h2 className="acc-form-title">Change Password</h2>
        <p className="acc-form-note">
          {notice}
        </p>
      </div>

      <div className="acc-form-card acc-form-card--static">
        <h2 className="acc-form-title">About Sign-in</h2>
        <p className="acc-form-note">
          Your account is secured with JWT authentication backed by MongoDB and Redis.
          Passwords are hashed with bcrypt and never stored in plain text.
        </p>
      </div>
    </div>
  );
}
