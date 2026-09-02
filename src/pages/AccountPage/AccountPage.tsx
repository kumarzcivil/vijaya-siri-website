import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './AccountPage.css';

function validateMobile(v: string): boolean {
  return /^[6-9]\d{9}$/.test(v.trim());
}

function validateEmail(v: string): boolean {
  if (!v.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

interface AccountErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function AccountPage() {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<AccountErrors>({});
  const [notified, setNotified] = useState(false);

  const clearError = (field: keyof AccountErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setNotified(false);
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    clearError('fullName');
  };

  const handleMobileChange = (value: string) => {
    setMobile(value.replace(/\D/g, '').slice(0, 10));
    clearError('mobile');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearError('email');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearError('password');
  };

  const handleConfirmChange = (value: string) => {
    setConfirm(value);
    clearError('confirm');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setNotified(false);

    const nextErrors: AccountErrors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = 'Please enter your full name';
    }
    if (!mobile.trim()) {
      nextErrors.mobile = 'Please enter your mobile number';
    } else if (!validateMobile(mobile)) {
      nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number';
    }
    if (email && !validateEmail(email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      nextErrors.password = 'Please enter a password';
    }
    if (!confirm) {
      nextErrors.confirm = 'Please confirm your password';
    } else if (password && confirm !== password) {
      nextErrors.confirm = 'Passwords do not match';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setNotified(true);
    }
  };

  return (
    <div className="account-page">
      <div className="section-container">
        <div className="account-card">
          <Link to="/" className="account-brand" aria-label="Vijaya Siri home">
            <img
              src="/assests/brand/vijaya-siri-logo-header-transparent.svg"
              alt="Vijaya Siri"
              className="account-logo"
            />
          </Link>

          <h1 className="account-title">Create Your Account</h1>
          <p className="account-subtitle">
            Create an account to manage your bookings, projects, and more.
          </p>

          <form className="account-form" onSubmit={handleSubmit} noValidate>
            <div className="account-field">
              <label className="account-label" htmlFor="register-fullname">
                Full Name
              </label>
              <input
                id="register-fullname"
                type="text"
                className={`account-input ${errors.fullName ? 'account-input--error' : ''}`}
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => handleFullNameChange(e.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'register-fullname-error' : undefined}
              />
              {errors.fullName && (
                <span id="register-fullname-error" className="account-error">
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-mobile">
                Mobile Number
              </label>
              <div className="account-input-group">
                <span className="account-input-prefix">+91</span>
                <input
                  id="register-mobile"
                  type="tel"
                  className={`account-input account-input--phone ${errors.mobile ? 'account-input--error' : ''}`}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  autoComplete="tel-national"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.mobile)}
                  aria-describedby={errors.mobile ? 'register-mobile-error' : undefined}
                />
              </div>
              {errors.mobile && (
                <span id="register-mobile-error" className="account-error">
                  {errors.mobile}
                </span>
              )}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-email">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                className={`account-input ${errors.email ? 'account-input--error' : ''}`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
              />
              {errors.email && (
                <span id="register-email-error" className="account-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-password">
                Password
              </label>
              <div className="account-password-wrap">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`account-input account-input--password ${errors.password ? 'account-input--error' : ''}`}
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'register-password-error' : undefined}
                />
                <button
                  type="button"
                  className="account-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span id="register-password-error" className="account-error">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-confirm">
                Confirm Password
              </label>
              <div className="account-password-wrap">
                <input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`account-input account-input--password ${errors.confirm ? 'account-input--error' : ''}`}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => handleConfirmChange(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirm)}
                  aria-describedby={errors.confirm ? 'register-confirm-error' : undefined}
                />
                <button
                  type="button"
                  className="account-password-toggle"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirm && (
                <span id="register-confirm-error" className="account-error">
                  {errors.confirm}
                </span>
              )}
            </div>

            <button type="submit" className="account-submit">
              Create Account
            </button>
          </form>

          {notified && (
            <div className="account-notice" role="status">
              Account creation is not connected yet.
            </div>
          )}

          <p className="account-secondary">
            Already have an account?{' '}
            <Link to="/login" className="account-secondary-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
