import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfileAPI } from '../../api/auth';
import './ProfileCompletionModal.css';

interface ProfileCompletionErrors {
  fullName?: string;
  mobile?: string;
}

export default function ProfileCompletionModal() {
  const { user, updateUser, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState<ProfileCompletionErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      completeProfile();
      navigate('/', { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [success, completeProfile, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const nextErrors: ProfileCompletionErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Please enter your full name';
    else if (fullName.trim().length < 2) nextErrors.fullName = 'Name must be at least 2 characters';
    if (!mobile.trim()) nextErrors.mobile = 'Please enter your mobile number';
    else if (!/^[6-9]\d{9}$/.test(mobile.trim())) nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await updateProfileAPI({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: user?.email || '',
      });
      if (res.success && res.data) {
        updateUser(res.data.user);
        setSuccess(true);
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || 'Failed to update profile';
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pcm-overlay" role="dialog" aria-modal="true">
        <div className="pcm-card">
          <div className="pcm-success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="pcm-title">Profile Updated!</h2>
          <p className="pcm-subtitle">
            Welcome to Vijaya Siri. Redirecting you now...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pcm-overlay" role="dialog" aria-modal="true" aria-labelledby="pcm-title">
      <div className="pcm-card">
        <div className="pcm-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h2 id="pcm-title" className="pcm-title">Complete Your Profile</h2>
        <p className="pcm-subtitle">
          Just a couple more details to get you started with Vijaya Siri.
        </p>

        {serverError && (
          <div className="pcm-error-banner" role="alert">{serverError}</div>
        )}

        <form className="pcm-form" onSubmit={handleSubmit} noValidate>
          <div className="pcm-field">
            <label className="pcm-label" htmlFor="pcm-name">Full Name</label>
            <input
              id="pcm-name"
              type="text"
              className={`pcm-input ${errors.fullName ? 'pcm-input--error' : ''}`}
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              autoComplete="name"
            />
            {errors.fullName && <span className="pcm-field-error">{errors.fullName}</span>}
          </div>

          <div className="pcm-field">
            <label className="pcm-label" htmlFor="pcm-mobile">Mobile Number</label>
            <div className="pcm-input-group">
              <span className="pcm-input-prefix">+91</span>
              <input
                id="pcm-mobile"
                type="tel"
                className={`pcm-input pcm-input--phone ${errors.mobile ? 'pcm-input--error' : ''}`}
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setErrors((prev) => ({ ...prev, mobile: undefined }));
                }}
                autoComplete="tel-national"
                inputMode="numeric"
              />
            </div>
            {errors.mobile && <span className="pcm-field-error">{errors.mobile}</span>}
          </div>

          <button type="submit" className="pcm-submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
