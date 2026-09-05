import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon/Icon';
import './AdminLoginPage.css';

interface AdminLoginErrors {
  email?: string;
  password?: string;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AdminLoginErrors>({});
  const { adminLogin, isLoading, error: authError, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: undefined }));
    clearError();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: undefined }));
    clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const nextErrors: AdminLoginErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Please enter your admin email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      nextErrors.password = 'Please enter your password';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await adminLogin({ email: email.trim(), password });
      navigate('/admin', { replace: true });
    } catch {
      // error is set in context
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <span className="admin-login-shield" aria-hidden="true">
          <Icon name="shield-check" size={26} />
        </span>

        <Link to="/" className="admin-login-brand" aria-label="Vijaya Siri home">
          <img
            src="/assests/brand/vijaya-siri-logo-header-transparent.svg"
            alt="Vijaya Siri"
            className="admin-login-logo"
          />
        </Link>

        <span className="admin-login-eyebrow">Admin Portal</span>

        <h1 className="admin-login-title">Admin Sign In</h1>
        <p className="admin-login-subtitle">
          Sign in to manage Vijaya Siri operations.
        </p>

        {authError && (
          <div className="login-error-banner" role="alert">
            {authError}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-email">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              className={`admin-login-input ${errors.email ? 'admin-login-input--error' : ''}`}
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'admin-email-error' : undefined}
            />
            {errors.email && (
              <span id="admin-email-error" className="admin-login-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-password">
              Password
            </label>
            <div className="admin-login-password-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className={`admin-login-input admin-login-input--password ${errors.password ? 'admin-login-input--error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'admin-password-error' : undefined}
              />
              <button
                type="button"
                className="admin-login-password-toggle"
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
              <span id="admin-password-error" className="admin-login-error">
                {errors.password}
              </span>
            )}
          </div>

          <button type="submit" className="admin-login-submit" disabled={isLoading}>
            {isLoading ? 'Signing In\u2026' : 'Sign In'}
          </button>
        </form>

        <Link to="/" className="admin-login-back">
          Back to Website
        </Link>
      </div>
    </div>
  );
}
