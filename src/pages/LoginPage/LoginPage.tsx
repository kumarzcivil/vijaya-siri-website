import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { setCustomerSignedIn } from '../../data/customerAuth';
import './LoginPage.css';

function validateMobile(v: string): boolean {
  return /^[6-9]\d{9}$/.test(v.trim());
}

interface LoginErrors {
  mobile?: string;
  password?: string;
}

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [notified, setNotified] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleMobileChange = (value: string) => {
    setMobile(value.replace(/\D/g, '').slice(0, 10));
    setErrors((prev) => ({ ...prev, mobile: undefined }));
    setNotified(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: undefined }));
    setNotified(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setNotified(false);

    const nextErrors: LoginErrors = {};
    if (!mobile.trim()) {
      nextErrors.mobile = 'Please enter your mobile number';
    } else if (!validateMobile(mobile)) {
      nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number';
    }
    if (!password) {
      nextErrors.password = 'Please enter your password';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setCustomerSignedIn();
      const returnTo = searchParams.get('return');
      if (returnTo && returnTo.startsWith('/')) {
        navigate(returnTo, { replace: true });
      } else {
        setNotified(true);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="section-container">
        <div className="login-card">
          <Link to="/" className="login-brand" aria-label="Vijaya Siri home">
            <img
              src="/assests/brand/vijaya-siri-logo-header-transparent.svg"
              alt="Vijaya Siri"
              className="login-logo"
            />
          </Link>

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to manage your bookings, projects, and account.
          </p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="login-mobile">
                Mobile Number
              </label>
              <div className="login-input-group">
                <span className="login-input-prefix">+91</span>
                <input
                  id="login-mobile"
                  type="tel"
                  className={`login-input login-input--phone ${errors.mobile ? 'login-input--error' : ''}`}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  autoComplete="tel-national"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.mobile)}
                  aria-describedby={errors.mobile ? 'login-mobile-error' : undefined}
                />
              </div>
              {errors.mobile && (
                <span id="login-mobile-error" className="login-error">
                  {errors.mobile}
                </span>
              )}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">
                Password
              </label>
              <div className="login-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`login-input login-input--password ${errors.password ? 'login-input--error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                />
                <button
                  type="button"
                  className="login-password-toggle"
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
                <span id="login-password-error" className="login-error">
                  {errors.password}
                </span>
              )}
            </div>

            <button type="submit" className="login-submit">
              Sign In
            </button>

            <button type="button" className="login-forgot">
              Forgot Password?
            </button>
          </form>

          {notified && (
            <div className="login-notice" role="status">
              Your details look valid, but authentication is not connected yet.
            </div>
          )}

          <p className="login-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/account" className="login-secondary-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
