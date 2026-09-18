import { useState, useEffect, useRef, useCallback, type FormEvent, type KeyboardEvent, type ClipboardEvent } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sendOTPAPI, verifyOTPAPI, resendOTPAPI } from "../../api/auth";
import "./AccountPage.css";
import {
  Home,
  User,
  MapPin,
  Tag,
  Bell,
  CreditCard,
  ShieldCheck,
  Headphones,
} from "lucide-react";

interface AccountErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

const NAV_ITEMS = [
  { to: "/account", label: "Overview", end: true, icon: Home },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/offers", label: "Offers & Coupons", icon: Tag },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/payment-preferences", label: "Payment Preferences", icon: CreditCard },
  { to: "/account/security", label: "Security", icon: ShieldCheck },
  { to: "/account/support", label: "Support", icon: Headphones },
];

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAccountHome = location.pathname === "/account";

  if (!isAuthenticated) {
    return (
      <RegistrationForm onNavigate={navigate} />
    );
  }

  return (
    <div className="account-page account-page--dashboard">
      <div className="section-container">
        <div className="account-dash-head">
          <div className="account-dash-head-text">
            <span className="acc-section-eyebrow">My Account</span>
            <h1 className="account-dash-title">
              {user?.fullName?.trim()
                ? `Welcome, ${user.fullName.split(" ")[0]}`
                : "My Dashboard"}
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
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `account-nav-item${isActive ? " account-nav-item--active" : ""}`
                      }
                    >
                      <span className="account-nav-icon" aria-hidden="true">
                        <Icon size={17} strokeWidth={2} />
                      </span>
                      {item.label}
                    </NavLink>
                  );
                })}
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
                    logout();
                    navigate("/login");
                  }}
                >
                  Sign Out
                </button>
              </div>
            </aside>
          )}

          <div className="account-content">
            <Outlet context={{ customerId: user?.id }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RegistrationForm({
  onNavigate,
}: {
  onNavigate: ReturnType<typeof useNavigate>;
}) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<AccountErrors>({});
  const { error: authError, clearError: clearAuthError, authenticate } = useAuth();

  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "otp") return;
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, step]);

  useEffect(() => {
    if (step === "otp" && otpInputRefs.current[0]) {
      otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  const clearFieldError = (field: keyof AccountErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    clearAuthError();
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAuthError();

    const nextErrors: AccountErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Please enter your full name";
    if (!mobile.trim()) nextErrors.mobile = "Please enter your mobile number";
    else if (!/^[6-9]\d{9}$/.test(mobile.trim()))
      nextErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!email.trim()) nextErrors.email = "Please enter your email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      nextErrors.email = "Enter a valid email address";
    if (!password) nextErrors.password = "Please enter a password";
    else if (password.length < 6)
      nextErrors.password = "Password must be at least 6 characters";
    if (!confirm) nextErrors.confirm = "Please confirm your password";
    else if (password && confirm !== password)
      nextErrors.confirm = "Passwords do not match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSendingOTP(true);
    try {
      const res = await sendOTPAPI({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        password,
        confirmPassword: confirm,
      });
      if (res.success) {
        setMaskedEmail(res.data?.email || email.trim());
        setStep("otp");
        setCountdown(120);
        setOtpDigits(["", "", "", "", "", ""]);
        setOtpError("");
      }
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || "Failed to send OTP.";
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
    setOtpError("");

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const fullOTP = next.join("");
      if (fullOTP.length === 6) {
        handleVerifyOTP(fullOTP);
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const next = [...otpDigits];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    setOtpError("");

    const focusIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIndex]?.focus();

    if (pasted.length === 6) {
      handleVerifyOTP(pasted);
    }
  };

  const handleVerifyOTP = useCallback(
    async (otp?: string) => {
      const otpValue = otp || otpDigits.join("");
      if (otpValue.length !== 6) {
        setOtpError("Please enter the complete 6-digit OTP");
        return;
      }

      setVerifying(true);
      setOtpError("");
      try {
        const res = await verifyOTPAPI({
          email: email.trim(),
          otp: otpValue,
        });
        if (res.success && res.data) {
          authenticate(res.data.user, res.data.token);
          setOtpSuccess("Account created successfully! Redirecting...");
          setTimeout(() => {
            onNavigate("/", { replace: true });
          }, 1000);
        }
      } catch (err: any) {
        const message = err?.message || err?.errors?.[0]?.message || "Invalid OTP. Please try again.";
        setOtpError(message);
        setOtpDigits(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      } finally {
        setVerifying(false);
      }
    },
    [otpDigits, email, onNavigate, authenticate],
  );

  const handleResendOTP = async () => {
    setResending(true);
    setOtpError("");
    try {
      await resendOTPAPI(email.trim());
      setCountdown(120);
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || "Failed to resend OTP.";
      setOtpError(message);
    } finally {
      setResending(false);
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setOtpError("");
    setOtpSuccess("");
    setOtpDigits(["", "", "", "", "", ""]);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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

          {step === "form" ? (
            <>
              <h1 className="account-title">Create Your Account</h1>
              <p className="account-subtitle">
                Create an account to manage your bookings, projects, and more.
              </p>

              {authError && (
                <div className="login-error-banner" role="alert">
                  {authError}
                </div>
              )}

              <form className="account-form" onSubmit={handleFormSubmit} noValidate>
                <div className="account-field">
                  <label className="account-label" htmlFor="register-fullname">
                    Full Name
                  </label>
                  <input
                    id="register-fullname"
                    type="text"
                    className={`account-input ${errors.fullName ? "account-input--error" : ""}`}
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearFieldError("fullName");
                    }}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.fullName)}
                  />
                  {errors.fullName && (
                    <span className="account-error">{errors.fullName}</span>
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
                      className={`account-input account-input--phone ${errors.mobile ? "account-input--error" : ""}`}
                      placeholder="98765 43210"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                        clearFieldError("mobile");
                      }}
                      autoComplete="tel-national"
                      inputMode="numeric"
                      aria-invalid={Boolean(errors.mobile)}
                    />
                  </div>
                  {errors.mobile && (
                    <span className="account-error">{errors.mobile}</span>
                  )}
                </div>

                <div className="account-field">
                  <label className="account-label" htmlFor="register-email">
                    Email Address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    className={`account-input ${errors.email ? "account-input--error" : ""}`}
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError("email");
                    }}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <span className="account-error">{errors.email}</span>
                  )}
                </div>

                <div className="account-field">
                  <label className="account-label" htmlFor="register-password">
                    Password
                  </label>
                  <div className="account-password-wrap">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      className={`account-input account-input--password ${errors.password ? "account-input--error" : ""}`}
                      placeholder="Enter a password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError("password");
                      }}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                    />
                    <PasswordToggle
                      show={showPassword}
                      onToggle={() => setShowPassword((p) => !p)}
                    />
                  </div>
                  {errors.password && (
                    <span className="account-error">{errors.password}</span>
                  )}
                </div>

                <div className="account-field">
                  <label className="account-label" htmlFor="register-confirm">
                    Confirm Password
                  </label>
                  <div className="account-password-wrap">
                    <input
                      id="register-confirm"
                      type={showConfirm ? "text" : "password"}
                      className={`account-input account-input--password ${errors.confirm ? "account-input--error" : ""}`}
                      placeholder="Re-enter your password"
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        clearFieldError("confirm");
                      }}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirm)}
                    />
                    <PasswordToggle
                      show={showConfirm}
                      onToggle={() => setShowConfirm((p) => !p)}
                    />
                  </div>
                  {errors.confirm && (
                    <span className="account-error">{errors.confirm}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="account-submit"
                  disabled={sendingOTP}
                >
                  {sendingOTP ? "Sending OTP..." : "Send Verification Code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="account-title">Verify Your Email</h1>
              <p className="account-subtitle">
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
                    className={`otp-input ${digit ? "otp-input--filled" : ""} ${otpError ? "otp-input--error" : ""}`}
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
                className="account-submit"
                onClick={() => handleVerifyOTP()}
                disabled={verifying || otpDigits.join("").length !== 6}
              >
                {verifying ? "Verifying..." : "Verify & Create Account"}
              </button>

              <div className="otp-resend" style={{ marginTop: "var(--space-lg)", textAlign: "center" }}>
                {canResend ? (
                  <button
                    type="button"
                    className="otp-resend-btn"
                    onClick={handleResendOTP}
                    disabled={resending}
                  >
                    {resending ? "Sending..." : "Resend OTP"}
                  </button>
                ) : (
                  <span className="otp-countdown">
                    Resend OTP in {formatCountdown(countdown)}
                  </span>
                )}
              </div>

              <p className="account-secondary" style={{ textAlign: "center" }}>
                <button type="button" className="otp-back-btn" onClick={handleBackToForm}>
                  &larr; Back to registration
                </button>
              </p>
            </>
          )}

          {step === "form" && (
            <p className="account-secondary">
              Already have an account?{" "}
              <Link to="/login" className="account-secondary-link">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="account-password-toggle"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}
