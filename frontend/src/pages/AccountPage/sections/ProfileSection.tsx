import { useEffect, useState, type FormEvent } from 'react';
import AccountSectionHeader from '../AccountSectionHeader';
import { getMeAPI, updateProfileAPI } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';

interface ProfileData {
  fullName: string;
  mobile: string;
  email: string;
}

interface ProfileErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
}

export default function ProfileSection() {
  const { updateUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      try {
        const res = await getMeAPI();
        if (!cancelled && res.success && res.data) {
          const u = res.data.user;
          setFullName(u.fullName || '');
          setMobile(u.mobile || '');
          setEmail(u.email || '');
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError('');

    const nextErrors: ProfileErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Please enter your full name';
    if (!mobile.trim()) nextErrors.mobile = 'Please enter your mobile number';
    else if (!/^[6-9]\d{9}$/.test(mobile.trim())) nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await updateProfileAPI({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
      });
      if (res.success && res.data) {
        const u = res.data.user;
        setFullName(u.fullName);
        setMobile(u.mobile);
        setEmail(u.email);
        updateUser(u);
        setSaved(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AccountSectionHeader
          eyebrow="Personal Information"
          title="Your Profile"
          description="Update your name, contact details, and notification preferences."
        />
        <div className="acc-form-card">
          <p className="acc-form-note">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Personal Information"
        title="Your Profile"
        description="Update your name, contact details, and notification preferences."
      />

      {error && (
        <div className="login-error-banner" role="alert">
          {error}
        </div>
      )}

      <form className="acc-form" onSubmit={handleSubmit} noValidate>
        <div className="acc-form-card">
          <h2 className="acc-form-title">Contact Details</h2>
          <div className="acc-field">
            <label className="acc-label" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              className={`acc-input ${errors.fullName ? 'acc-input--error' : ''}`}
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined })); setSaved(false); }}
              autoComplete="name"
            />
            {errors.fullName && <span className="acc-error">{errors.fullName}</span>}
          </div>
          <div className="acc-field">
            <label className="acc-label" htmlFor="profile-mobile">Mobile Number</label>
            <div className="acc-input-group">
              <span className="acc-input-prefix">+91</span>
              <input
                id="profile-mobile"
                type="tel"
                className={`acc-input acc-input--phone ${errors.mobile ? 'acc-input--error' : ''}`}
                placeholder="98765 43210"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); if (errors.mobile) setErrors((p) => ({ ...p, mobile: undefined })); setSaved(false); }}
                autoComplete="tel-national"
                inputMode="numeric"
              />
            </div>
            {errors.mobile && <span className="acc-error">{errors.mobile}</span>}
          </div>
          <div className="acc-field">
            <label className="acc-label" htmlFor="profile-email">Email Address</label>
            <input
              id="profile-email"
              type="email"
              className={`acc-input ${errors.email ? 'acc-input--error' : ''}`}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); setSaved(false); }}
              autoComplete="email"
            />
            {errors.email && <span className="acc-error">{errors.email}</span>}
          </div>
        </div>

        {saved && (
          <div className="acc-notice" role="status">
            Your profile has been updated successfully.
          </div>
        )}

        <div className="acc-form-actions">
          <button type="submit" className="acc-btn acc-btn--primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
