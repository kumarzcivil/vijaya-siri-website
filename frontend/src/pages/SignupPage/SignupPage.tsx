import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../LoginPage/LoginPage.css';

interface SignupErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const { signup, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const returnTo = searchParams.get('return');
    if (returnTo && returnTo.startsWith('/')) {
      return <Navigate to={returnTo} replace />;
    }
    return <Navigate to="/account" replace />;
  }

  const handleFieldChange = <K extends keyof SignupErrors>(field: K, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    clearError();
    switch (field) {
      case 'fullName': setFullName(value); break;
      case 'mobile': setMobile(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const nextErrors: SignupErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Please enter your full name';
    if (!mobile.trim()) nextErrors.mobile = 'Please enter your mobile number';
    else if (!/^[6-9]\d{9}$/.test(mobile.trim())) nextErrors.mobile = 'Please enter a valid 10-digit Indian mobile number';
    if (!email.trim()) nextErrors.email = 'Please enter your email address';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Please enter a valid email address';
    if (!password) nextErrors.password = 'Please enter a password';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await signup({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      const returnTo = searchParams.get('return');
      if (returnTo && returnTo.startsWith('/')) {
        navigate(returnTo, { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch {
      // error is set in context
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

          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">
            Sign up to manage your bookings, projects, and account.
          </p>

          {authError && (
            <div className="login-error-banner" role="alert">
              {authError}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="signup-name">
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                className={`login-input ${errors.fullName ? 'login-input--error' : ''}`}
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'signup-name-error' : undefined}
              />
              {errors.fullName && (
                <span id="signup-name-error" className="login-error">
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="signup-mobile">
                Mobile Number
              </label>
              <div className="login-input-group">
                <span className="login-input-prefix">+91</span>
                <input
                  id="signup-mobile"
                  type="tel"
                  className={`login-input login-input--phone ${errors.mobile ? 'login-input--error' : ''}`}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => handleFieldChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  autoComplete="tel-national"
                  aria-invalid={Boolean(errors.mobile)}
                  aria-describedby={errors.mobile ? 'signup-mobile-error' : undefined}
                />
              </div>
              {errors.mobile && (
                <span id="signup-mobile-error" className="login-error">
                  {errors.mobile}
                </span>
              )}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="signup-email">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                className={`login-input ${errors.email ? 'login-input--error' : ''}`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'signup-email-error' : undefined}
              />
              {errors.email && (
                <span id="signup-email-error" className="login-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="signup-password">
                Password
              </label>
              <div className="login-password-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`login-input login-input--password ${errors.password ? 'login-input--error' : ''}`}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'signup-password-error' : undefined}
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
                <span id="signup-password-error" className="login-error">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="signup-confirm">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                className={`login-input ${errors.confirmPassword ? 'login-input--error' : ''}`}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
              />
              {errors.confirmPassword && (
                <span id="signup-confirm-error" className="login-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="login-secondary">
            Already have an account?{' '}
            <Link to="/login" className="login-secondary-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
