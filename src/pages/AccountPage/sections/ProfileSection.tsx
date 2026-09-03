import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import AccountSectionHeader from '../AccountSectionHeader';
import { getCustomer, saveCustomers, getCustomers } from '../../../data/customerStore';

function validateMobile(v: string): boolean {
  return /^[6-9]\d{9}$/.test(v.trim());
}

function validateEmail(v: string): boolean {
  if (!v.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function ProfileSection() {
  const { customerId } = useOutletContext<{ customerId: string }>();
  const profile = useMemo(() => getCustomer(customerId), [customerId]);

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [mobile, setMobile] = useState(profile?.mobile ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [marketingOptIn, setMarketingOptIn] = useState(profile?.marketingOptIn ?? false);
  const [bookingsPref, setBookingsPref] = useState(profile?.notificationPrefs.bookings ?? true);
  const [offersPref, setOffersPref] = useState(profile?.notificationPrefs.offers ?? true);
  const [servicePref, setServicePref] = useState(profile?.notificationPrefs.service ?? true);
  const [errors, setErrors] = useState<{ fullName?: string; mobile?: string; email?: string }>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFullName(profile?.fullName ?? '');
    setMobile(profile?.mobile ?? '');
    setEmail(profile?.email ?? '');
    setMarketingOptIn(profile?.marketingOptIn ?? false);
    setBookingsPref(profile?.notificationPrefs.bookings ?? true);
    setOffersPref(profile?.notificationPrefs.offers ?? true);
    setServicePref(profile?.notificationPrefs.service ?? true);
  }, [profile]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const nextErrors: { fullName?: string; mobile?: string; email?: string } = {};
    if (!fullName.trim()) nextErrors.fullName = 'Please enter your full name';
    if (!mobile.trim()) nextErrors.mobile = 'Please enter your mobile number';
    else if (!validateMobile(mobile)) nextErrors.mobile = 'Enter a valid 10-digit Indian mobile number';
    if (email && !validateEmail(email)) nextErrors.email = 'Enter a valid email address';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const existing = getCustomer(customerId);
    const current = existing ?? {
      id: customerId,
      fullName: '',
      mobile: '',
      email: '',
      createdAt: new Date().toISOString(),
      marketingOptIn: false,
      notificationPrefs: { bookings: true, offers: true, service: true },
    };
    const updated = {
      ...current,
      id: customerId,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      marketingOptIn,
      notificationPrefs: {
        bookings: bookingsPref,
        offers: offersPref,
        service: servicePref,
      },
    };
    const all = getCustomers().map((c) => (c.id === customerId ? updated : c));
    if (!all.some((c) => c.id === customerId)) all.push(updated);
    saveCustomers(all);
    setSaved(true);
  };

  return (
    <div>
      <AccountSectionHeader
        eyebrow="Personal Information"
        title="Your Profile"
        description="Update your name, contact details, and notification preferences."
      />

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
              onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined })); }}
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
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); if (errors.mobile) setErrors((p) => ({ ...p, mobile: undefined })); }}
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
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
              autoComplete="email"
            />
            {errors.email && <span className="acc-error">{errors.email}</span>}
          </div>
        </div>

        <div className="acc-form-card">
          <h2 className="acc-form-title">Notification Preferences</h2>
          <PreferenceRow
            label="Booking updates"
            desc="Get notified about your service bookings."
            checked={bookingsPref}
            onChange={setBookingsPref}
          />
          <PreferenceRow
            label="Offers & promotions"
            desc="Hear about new offers and coupons."
            checked={offersPref}
            onChange={setOffersPref}
          />
          <PreferenceRow
            label="Service updates"
            desc="Updates about services you may be interested in."
            checked={servicePref}
            onChange={setServicePref}
          />
          <PreferenceRow
            label="Marketing emails"
            desc="Receive occasional marketing emails from Vijaya Siri."
            checked={marketingOptIn}
            onChange={setMarketingOptIn}
          />
        </div>

        {saved && (
          <div className="acc-notice" role="status">
            Your profile has been updated successfully.
          </div>
        )}

        <div className="acc-form-actions">
          <button type="submit" className="acc-btn acc-btn--primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function PreferenceRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="acc-pref-row">
      <span className="acc-pref-text">
        <span className="acc-pref-label">{label}</span>
        <span className="acc-pref-desc">{desc}</span>
      </span>
      <input
        type="checkbox"
        className="acc-pref-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
