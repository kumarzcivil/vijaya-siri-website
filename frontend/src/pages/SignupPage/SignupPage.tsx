import { useState, useEffect, useRef, useCallback, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sendOTPAPI, verifyOTPAPI, resendOTPAPI } from '../../api/auth';
import '../LoginPage/LoginPage.css';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface SignupErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

type Step = 'form' | 'otp';

export default function SignupPage() {
  const [step, setStep] = useState<Step>('form');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitialized = useRef(false);
  const { error: authError, clearError, isAuthenticated, authenticate, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (step !== 'otp') return;
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (googleInitialized.current) return;
    if (!window.google?.accounts?.id) return;
    if (step !== 'form') return;

    googleInitialized.current = true;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      callback: handleGoogleCallback,
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
      });
    }
  }, [step]);

  const handleGoogleCallback = async (response: { credential?: string }) => {
    if (!response.credential) return;
    setGoogleLoading(true);
    try {
      await googleLogin(response.credential);
      const returnTo = searchParams.get('return');
      if (returnTo && returnTo.startsWith('/')) {
        navigate(returnTo, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      // error is set in context
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleVerifyOTP = useCallback(async (otp?: string) => {
    const otpValue = otp || otpDigits.join('');
    if (otpValue.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      return;
    }

    setVerifying(true);
    setOtpError('');
    try {
      const res = await verifyOTPAPI({
        email: email.trim(),
        otp: otpValue,
      });
      if (res.success && res.data) {
        authenticate(res.data.user, res.data.token);
        setOtpSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          const returnTo = searchParams.get('return');
          if (returnTo && returnTo.startsWith('/')) {
            navigate(returnTo, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 1000);
      }
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || 'Invalid OTP. Please try again.';
      setOtpError(message);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }, [otpDigits, email, navigate, searchParams, authenticate]);

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

  const handleFormSubmit = async (e: FormEvent) => {
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

    setSendingOTP(true);
    try {
      const res = await sendOTPAPI({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      if (res.success) {
        setMaskedEmail(res.data?.email || email.trim());
        setStep('otp');
        setCountdown(120);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError('');
      }
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || 'Failed to send OTP. Please try again.';
      setErrors({ email: message });
    } finally {
      setSendingOTP(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpError('');

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const fullOTP = next.join('');
      if (fullOTP.length === 6) {
        handleVerifyOTP(fullOTP);
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const next = [...otpDigits];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    setOtpError('');

    const focusIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOTP(pasted);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setOtpError('');
    try {
      await resendOTPAPI(email.trim());
      setCountdown(120);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || 'Failed to resend OTP.';
      setOtpError(message);
    } finally {
      setResending(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setOtpError('');
    setOtpSuccess('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

          {step === 'form' ? (
            <>
              <h1 className="login-title">Create Account</h1>
              <p className="login-subtitle">
                Sign up to manage your bookings, projects, and account.
              </p>

              {authError && (
                <div className="login-error-banner" role="alert">
                  {authError}
                </div>
              )}

              <div
                ref={googleBtnRef}
                className="google-btn-container"
                style={{ marginBottom: 'var(--space-lg)' }}
              />
              {googleLoading && (
                <p className="google-loading-text">Authenticating with Google...</p>
              )}

              <div className="google-divider">
                <span>or</span>
              </div>

              <form className="login-form" onSubmit={handleFormSubmit} noValidate>
                <div className="login-field">
                  <label className="login-label" htmlFor="signup-name">Full Name</label>
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
                    <span id="signup-name-error" className="login-error">{errors.fullName}</span>
                  )}
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="signup-mobile">Mobile Number</label>
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
                    <span id="signup-mobile-error" className="login-error">{errors.mobile}</span>
                  )}
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="signup-email">Email Address</label>
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
                    <span id="signup-email-error" className="login-error">{errors.email}</span>
                  )}
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="signup-password">Password</label>
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
                    <span id="signup-password-error" className="login-error">{errors.password}</span>
                  )}
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="signup-confirm">Confirm Password</label>
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
                    <span id="signup-confirm-error" className="login-error">{errors.confirmPassword}</span>
                  )}
                </div>

                <button type="submit" className="login-submit" disabled={sendingOTP}>
                  {sendingOTP ? 'Sending OTP...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="login-title">Verify Your Email</h1>
              <p className="login-subtitle">
                We&apos;ve sent a 6-digit verification code to <strong>{maskedEmail}</strong>
              </p>

              {otpError && (
                <div className="login-error-banner" role="alert">{otpError}</div>
              )}

              {otpSuccess && (
                <div className="otp-success-banner" role="status">{otpSuccess}</div>
              )}

              <div className="otp-input-container">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpInputRefs.current[i] = el; }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    className={`otp-input ${digit ? 'otp-input--filled' : ''} ${otpError ? 'otp-input--error' : ''}`}
                    value={digit}
                    onChange={(e) => handleOTPChange(i, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(i, e)}
                    onPaste={i === 0 ? handleOTPPaste : undefined}
                    disabled={verifying}
                    autoComplete="one-time-code"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="login-submit"
                onClick={() => handleVerifyOTP()}
                disabled={verifying || otpDigits.join('').length !== 6}
              >
                {verifying ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="otp-resend">
                {canResend ? (
                  <button
                    type="button"
                    className="otp-resend-btn"
                    onClick={handleResendOTP}
                    disabled={resending}
                  >
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </button>
                ) : (
                  <span className="otp-countdown">
                    Resend OTP in {formatCountdown(countdown)}
                  </span>
                )}
              </div>

              <p className="login-secondary">
                <button type="button" className="otp-back-btn" onClick={handleBackToForm}>
                  &larr; Back to registration
                </button>
              </p>
            </>
          )}

          {step === 'form' && (
            <p className="login-secondary">
              Already have an account?{' '}
              <Link to="/login" className="login-secondary-link">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
