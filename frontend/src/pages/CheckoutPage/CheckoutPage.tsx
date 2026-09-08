import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import { getAddressesAPI } from '../../api/addresses';
import { validateCoupon } from '../../api/coupons';
import { createBooking } from '../../api/bookings';
import { createNotification } from '../../api/notifications';
import { getPaymentPreferences, type PaymentPreference } from '../../data/customerStore';
import Icon from '../../components/Icon/Icon';
import { SkeletonRow } from '../../components/Skeleton/Skeleton';
import { logger } from '../../utils/logger';
import './CheckoutPage.css';

function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

interface Address {
  _id: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { items, count, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [isManual, setIsManual] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'NETBANKING'>('CASH');
  const [savedPrefs, setSavedPrefs] = useState<PaymentPreference[]>([]);
  const [selectedPrefId, setSelectedPrefId] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    if (user) {
      setCustomerName(user.name || '');
      setCustomerMobile(user.mobile || user.phone || '');

      const prefs = getPaymentPreferences(user._id || user.id || '');
      setSavedPrefs(prefs);
      const defaultPref = prefs.find((p) => p.isDefault);
      if (defaultPref) {
        setPaymentMethod(defaultPref.method);
        setSelectedPrefId(defaultPref.id);
      }
    }
  }, [items.length, navigate, user]);

  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    getAddressesAPI()
      .then((data) => {
        setAddresses(data);
        const def = data.find((a: Address) => a.isDefault);
        if (def) setSelectedAddressId(def._id);
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const siteAddress = isManual ? manualAddress : selectedAddress ? `${selectedAddress.addressLine1}${selectedAddress.addressLine2 ? ', ' + selectedAddress.addressLine2 : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}` : manualAddress;
  const siteLocation = isManual ? manualLocation : selectedAddress ? `${selectedAddress.city}, ${selectedAddress.state}` : manualLocation;

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage('');
    try {
      const result = await validateCoupon(couponCode.trim(), 'BOTH', total);
      if (result.valid && result.discount) {
        setCouponDiscount(result.discount);
        setCouponMessage(result.message || `You save ${formatINR(result.discount)}!`);
        logger.success('Checkout', `Coupon ${couponCode} applied: ${formatINR(result.discount)} off`);
      } else {
        setCouponDiscount(0);
        setCouponMessage(result.message || 'Invalid coupon');
        logger.warn('Checkout', `Coupon ${couponCode} invalid: ${result.message}`);
      }
    } catch (err: any) {
      setCouponDiscount(0);
      setCouponMessage(err.message || 'Invalid coupon');
      logger.error('Checkout', `Coupon validation failed: ${err.message}`);
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, total]);

  const finalAmount = Math.max(0, total - couponDiscount);

  const handleSubmit = async () => {
    setError('');
    if (!customerName.trim()) { setError('Name is required'); return; }
    if (!customerMobile.trim() || !/^\d{10}$/.test(customerMobile.trim())) { setError('Valid 10-digit mobile number is required'); return; }
    if (!siteAddress.trim()) { setError('Site address is required'); return; }

    setSubmitting(true);
    try {
      logger.info('Checkout', `Creating ${count} bookings...`);

      for (const item of items) {
        const bookingData = {
          kind: item.kind,
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          categoryName: item.categoryName,
          slotDate,
          slotTime,
          amount: item.price * item.quantity,
          paymentRequired: true,
          paymentStatus: 'pending' as const,
          paymentMethod,
          couponCode: couponDiscount > 0 ? couponCode : '',
          couponDiscount: couponDiscount > 0 ? Math.round(couponDiscount / items.length) : 0,
          customerName: customerName.trim(),
          customerMobile: customerMobile.trim(),
          customerId: user?._id || '',
          siteAddress: siteAddress.trim(),
          siteLocation: siteLocation.trim(),
        };

        const booking = await createBooking(bookingData as any);
        logger.success('Checkout', `Booking created: ${booking._id}`);

        await createNotification({
          title: 'Booking Confirmed',
          message: `Your ${item.kind === 'quick-fix' ? 'Quick Fix' : 'Pro Fix'} booking for ${item.serviceName} has been confirmed.`,
          type: 'booking',
        }).catch(() => {});
      }

      clearCart();
      logger.success('Checkout', 'All bookings created, cart cleared');
      navigate('/bookings', { replace: true });
    } catch (err: any) {
      logger.error('Checkout', `Booking creation failed: ${err.message}`);
      setError(err.message || 'Failed to create bookings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const TIME_SLOTS = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM',
  ];

  return (
    <div className="checkout-page">
      <div className="section-container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Contact */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                <span className="checkout-section-num">1</span>
                Contact Details
              </h2>
              <div className="checkout-form-grid">
                <label className="checkout-field">
                  <span className="checkout-label">Full Name *</span>
                  <input type="text" className="checkout-input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" />
                </label>
                <label className="checkout-field">
                  <span className="checkout-label">Mobile Number *</span>
                  <input type="tel" className="checkout-input" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" />
                </label>
              </div>
            </section>

            {/* Address */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                <span className="checkout-section-num">2</span>
                Site Address
              </h2>
              {user && (
                <div className="checkout-address-toggle">
                  <button className={`checkout-addr-tab ${!isManual ? 'checkout-addr-tab--active' : ''}`} onClick={() => setIsManual(false)} type="button">Saved Addresses</button>
                  <button className={`checkout-addr-tab ${isManual ? 'checkout-addr-tab--active' : ''}`} onClick={() => setIsManual(true)} type="button">Enter Manually</button>
                </div>
              )}
              {!isManual && user && (
                <>
                  {loadingAddresses ? (
                    <div className="checkout-addr-list">
                      {[1, 2].map((i) => <SkeletonRow key={i} />)}
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="checkout-addr-list">
                      {addresses.map((addr) => (
                        <label key={addr._id} className={`checkout-addr-card ${selectedAddressId === addr._id ? 'checkout-addr-card--selected' : ''}`}>
                          <input type="radio" name="address" value={addr._id} checked={selectedAddressId === addr._id} onChange={() => setSelectedAddressId(addr._id)} className="checkout-radio" />
                          <div className="checkout-addr-info">
                            <span className="checkout-addr-label">{addr.label}</span>
                            <span className="checkout-addr-text">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</span>
                            <span className="checkout-addr-city">{addr.city}, {addr.state} - {addr.pincode}</span>
                          </div>
                          {addr.isDefault && <span className="checkout-addr-default">Default</span>}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="checkout-addr-empty">No saved addresses. Enter manually below.</p>
                  )}
                </>
              )}
              {(isManual || !user || addresses.length === 0) && (
                <div className="checkout-form-grid">
                  <label className="checkout-field checkout-field--wide">
                    <span className="checkout-label">Site Address *</span>
                    <textarea className="checkout-textarea" rows={2} value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Full site address" />
                  </label>
                  <label className="checkout-field">
                    <span className="checkout-label">Area / Location</span>
                    <input type="text" className="checkout-input" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="e.g. Koramangala, Bangalore" />
                  </label>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                <span className="checkout-section-num">3</span>
                Payment Method
              </h2>
              {savedPrefs.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span className="checkout-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Saved Payment Methods</span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {savedPrefs.map((pref) => (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => { setPaymentMethod(pref.method); setSelectedPrefId(pref.id); }}
                        style={{
                          padding: '0.75rem 1rem',
                          border: `2px solid ${selectedPrefId === pref.id ? 'var(--color-brand, #4F46E5)' : 'var(--color-border, #E5E7EB)'}`,
                          borderRadius: '8px',
                          background: selectedPrefId === pref.id ? 'var(--color-brand-50, #EEF2FF)' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          minWidth: '140px',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pref.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                          {pref.method === 'UPI' && pref.upiId}
                          {pref.method === 'CARD' && pref.cardLast4 && `**** ${pref.cardLast4}`}
                          {pref.method === 'NETBANKING' && pref.bankName}
                          {pref.method === 'CASH' && 'Cash Payment'}
                        </div>
                        {pref.isDefault && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-brand, #4F46E5)', fontWeight: 600 }}>DEFAULT</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {([
                  { id: 'CASH', label: 'Cash', icon: 'banknotes' },
                  { id: 'UPI', label: 'UPI', icon: 'device-phone-mobile' },
                  { id: 'CARD', label: 'Card', icon: 'credit-card' },
                  { id: 'NETBANKING', label: 'Net Banking', icon: 'building-library' },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setPaymentMethod(m.id); setSelectedPrefId(''); }}
                    style={{
                      padding: '0.75rem 1rem',
                      border: `2px solid ${paymentMethod === m.id && !selectedPrefId ? 'var(--color-brand, #4F46E5)' : 'var(--color-border, #E5E7EB)'}`,
                      borderRadius: '8px',
                      background: paymentMethod === m.id && !selectedPrefId ? 'var(--color-brand-50, #EEF2FF)' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <Icon name={m.icon} size={24} style={{ display: 'block', margin: '0 auto 0.35rem' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Schedule */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                <span className="checkout-section-num">4</span>
                Preferred Schedule
              </h2>
              <div className="checkout-form-grid">
                <label className="checkout-field">
                  <span className="checkout-label">Date</span>
                  <input type="date" className="checkout-input" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
                </label>
                <label className="checkout-field">
                  <span className="checkout-label">Time Slot</span>
                  <select className="checkout-input" value={slotTime} onChange={(e) => setSlotTime(e.target.value)}>
                    <option value="">Select time</option>
                    {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </label>
              </div>
            </section>

            {/* Coupon */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                <span className="checkout-section-num">5</span>
                Coupon Code
              </h2>
              <div className="checkout-coupon-row">
                <input type="text" className="checkout-input checkout-coupon-input" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" />
                <button className="checkout-coupon-btn" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} type="button">
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {couponMessage && (
                <p className={`checkout-coupon-msg ${couponDiscount > 0 ? 'checkout-coupon-msg--ok' : 'checkout-coupon-msg--err'}`}>
                  {couponMessage}
                </p>
              )}
            </section>
          </div>

          {/* Summary sidebar */}
          <aside className="checkout-summary">
            <h2 className="checkout-summary-title">Order Summary</h2>
            <div className="checkout-summary-items">
              {items.map((item) => (
                <div key={`${item.kind}-${item.serviceId}`} className="checkout-summary-item">
                  <div className="checkout-summary-item-info">
                    <span className="checkout-summary-item-name">{item.serviceName}</span>
                    <span className="checkout-summary-item-qty">{item.quantity} x {formatINR(item.price)} / {item.unit}</span>
                  </div>
                  <span className="checkout-summary-item-total">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>{formatINR(total)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="checkout-summary-row checkout-summary-row--discount">
                  <span>Coupon ({couponCode})</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="checkout-summary-divider" />
              <div className="checkout-summary-row checkout-summary-row--total">
                <span>Total</span>
                <span>{formatINR(finalAmount)}</span>
              </div>
            </div>
            {error && <p className="checkout-error">{error}</p>}
            <button className="checkout-submit" onClick={handleSubmit} disabled={submitting || items.length === 0} type="button">
              {submitting ? 'Placing Order...' : `Place Order \u00B7 ${formatINR(finalAmount)}`}
            </button>
            <p className="checkout-note">Pay at the time of service via cash or UPI.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
