import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { isCustomerSignedIn } from '../../data/customerAuth';
import { getOrCreateCustomerId } from '../../data/payment';
import { getCustomer, upsertCustomer } from '../../data/customerStore';
import { clearCustomerSignedIn } from '../../data/customerAuth';
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

const NAV_ITEMS = [
  { to: '/account', label: 'Overview', end: true, icon: 'home' },
  { to: '/account/profile', label: 'Profile', icon: 'users' },
  { to: '/account/addresses', label: 'Addresses', icon: 'map-pin' },
  { to: '/account/offers', label: 'Offers & Coupons', icon: 'diamond' },
  { to: '/account/notifications', label: 'Notifications', icon: 'bell' },
  { to: '/account/payment-preferences', label: 'Payment Preferences', icon: 'cash' },
  { to: '/account/security', label: 'Security', icon: 'shield-check' },
  { to: '/account/support', label: 'Support', icon: 'phone' },
];

export default function AccountPage() {
  const signedIn = isCustomerSignedIn();
  const navigate = useNavigate();
  const location = useLocation();

  const customerId = useMemo(() => getOrCreateCustomerId(), []);
  const profile = useMemo(() => getCustomer(customerId), [customerId]);

  // Ensure a persisted profile shell exists for this session customer once
  // signed in (avoids side effects during render).
  useEffect(() => {
    if (!signedIn || profile) return;
    upsertCustomer({
      id: customerId,
      fullName: '',
      mobile: '',
      email: '',
      createdAt: new Date().toISOString(),
      marketingOptIn: false,
      notificationPrefs: { bookings: true, offers: true, service: true },
    });
  }, [signedIn, profile, customerId]);

  const activeProfile = profile;

  const isAccountHome = location.pathname === '/account';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (!signedIn) {
    return (
      <RegistrationForm
        returnTo={location.pathname}
        onNavigate={navigate}
      />
    );
  }

  return (
    <div className="account-page account-page--dashboard">
      <div className="section-container">
        <button className="account-back" onClick={handleBack} type="button" aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        <div className="account-dash-head">
          <div className="account-dash-head-text">
            <span className="acc-section-eyebrow">My Account</span>
            <h1 className="account-dash-title">
              {activeProfile?.fullName?.trim() ? `Welcome, ${activeProfile.fullName.split(' ')[0]}` : 'My Dashboard'}
            </h1>
            <p className="account-dash-sub">
              Manage your profile, addresses, bookings and preferences.
            </p>
          </div>
        </div>

        <div className="account-layout">
          {!isAccountHome && (
            <aside className="account-sidebar">
              <nav className="account-nav" aria-label="Account navigation">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `account-nav-item${isActive ? ' account-nav-item--active' : ''}`
                    }
                  >
                    <span className="account-nav-icon" aria-hidden="true">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <AccountNavGlyph name={item.icon} />
                      </svg>
                    </span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="account-sidebar-foot">
                <Link to="/bookings" className="account-quick-link">
                  My Bookings
                </Link>
                <Link to="/projects" className="account-quick-link">
                  My Projects
                </Link>
                <button
                  type="button"
                  className="account-signout"
                  onClick={() => {
                    clearCustomerSignedIn();
                    navigate('/login');
                  }}
                >
                  Sign Out
                </button>
              </div>
            </aside>
          )}

          <div className="account-content">
            <Outlet context={{ customerId }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountNavGlyph({ name }: { name: string }) {
  switch (name) {
    case 'home':
      return (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      );
    case 'users':
      return (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case 'map-pin':
      return (
        <>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </>
      );
    case 'diamond':
      return (
        <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
      );
    case 'bell':
      return (
        <>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </>
      );
    case 'cash':
      return (
        <>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01" />
          <path d="M18 12h.01" />
        </>
      );
    case 'shield-check':
      return (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </>
      );
    case 'phone':
      return (
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      );
    default:
      return null;
  }
}

function RegistrationForm({
  returnTo,
  onNavigate,
}: {
  returnTo: string;
  onNavigate: ReturnType<typeof useNavigate>;
}) {
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setNotified(false);

    const nextErrors: AccountErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Please enter your full name';
    if (!mobile.trim()) nextErrors.mobile = 'Please enter your mobile number';
    else if (!validateMobile(mobile)) nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number';
    if (email && !validateEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!password) nextErrors.password = 'Please enter a password';
    if (!confirm) nextErrors.confirm = 'Please confirm your password';
    else if (password && confirm !== password) nextErrors.confirm = 'Passwords do not match';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      const customerId = getOrCreateCustomerId();
      const existing = getCustomer(customerId);
      upsertCustomer({
        id: customerId,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        marketingOptIn: existing?.marketingOptIn ?? false,
        notificationPrefs: existing?.notificationPrefs ?? {
          bookings: true,
          offers: true,
          service: true,
        },
      });
      setNotified(true);
      setTimeout(() => onNavigate(`/login?return=${encodeURIComponent(returnTo)}`), 350);
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
              <label className="account-label" htmlFor="register-fullname">Full Name</label>
              <input
                id="register-fullname"
                type="text"
                className={`account-input ${errors.fullName ? 'account-input--error' : ''}`}
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && <span className="account-error">{errors.fullName}</span>}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-mobile">Mobile Number</label>
              <div className="account-input-group">
                <span className="account-input-prefix">+91</span>
                <input
                  id="register-mobile"
                  type="tel"
                  className={`account-input account-input--phone ${errors.mobile ? 'account-input--error' : ''}`}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); clearError('mobile'); }}
                  autoComplete="tel-national"
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.mobile)}
                />
              </div>
              {errors.mobile && <span className="account-error">{errors.mobile}</span>}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                className={`account-input ${errors.email ? 'account-input--error' : ''}`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className="account-error">{errors.email}</span>}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-password">Password</label>
              <div className="account-password-wrap">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`account-input account-input--password ${errors.password ? 'account-input--error' : ''}`}
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                />
                <PasswordToggle show={showPassword} onToggle={() => setShowPassword((p) => !p)} />
              </div>
              {errors.password && <span className="account-error">{errors.password}</span>}
            </div>

            <div className="account-field">
              <label className="account-label" htmlFor="register-confirm">Confirm Password</label>
              <div className="account-password-wrap">
                <input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={`account-input account-input--password ${errors.confirm ? 'account-input--error' : ''}`}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); clearError('confirm'); }}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirm)}
                />
                <PasswordToggle show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />
              </div>
              {errors.confirm && <span className="account-error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="account-submit">Create Account</button>
          </form>

          {notified && (
            <div className="account-notice" role="status">
              Account details saved locally. You can now sign in with your mobile number and password.
            </div>
          )}

          <p className="account-secondary">
            Already have an account?{' '}
            <Link to="/login" className="account-secondary-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="account-password-toggle" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? (
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
  );
}
