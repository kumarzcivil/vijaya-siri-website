import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import {
  formatINR,
  getOrCreateCustomerId,
  type PriceSummary,
} from '../../data/payment';
import {
  applyCoupon,
  type AppliedCoupon,
} from '../../data/coupons';
import { DEFAULT_SLOT_DURATION_MIN } from '../../data/bookingSchedule';
import { findBookingConflict } from '../../store/bookingConflict';
import { usePaymentDraft } from '../../hooks/usePaymentDraft';
import { setQuickFixBooking } from '../../store/quickFixBooking';
import { setProFixBooking } from '../../store/proFixBooking';
import { clearPaymentDraft } from '../../store/payment';
import './PaymentPage.css';

type MethodId = 'UPI' | 'Card' | 'NetBanking' | 'Cash';

const METHODS: Array<{ id: MethodId; label: string; desc: string; icon: string; sub: string }> = [
  { id: 'UPI', label: 'UPI', desc: 'Pay using any UPI app', icon: 'phone', sub: '' },
  { id: 'Card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: 'building', sub: '' },
  { id: 'NetBanking', label: 'Net Banking', desc: 'All major banks', icon: 'store', sub: '' },
  {
    id: 'Cash',
    label: 'Cash Payment',
    desc: 'Pay directly at the time of service',
    icon: 'cash',
    sub: 'Recommended',
  },
];

function scheduleLabel(date?: string): string {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const draft = usePaymentDraft();

  const [method, setMethod] = useState<MethodId | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [applied, setApplied] = useState<AppliedCoupon | null>(draft?.coupon ?? null);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = draft?.price ?? ({} as PriceSummary);
  const priceBase = price.finalAmount ?? 0;
  const couponDiscount = applied?.discount ?? 0;
  const finalAmount = Math.max(0, priceBase - couponDiscount);
  const isCash = method === 'Cash';

  const detailsPath = useMemo(() => {
    if (!draft) return '';
    return draft.serviceType === 'QUICK_FIX'
      ? `/quick-fix/${draft.serviceId}/confirmed`
      : `/pro-fix/${draft.serviceId}/estimate/confirmed`;
  }, [draft]);

  const handleGoBack = useCallback(() => {
    if (!draft) return;
    clearPaymentDraft();
    if (draft.serviceType === 'QUICK_FIX') {
      navigate(`/quick-fix/${draft.serviceId}/book`);
    } else {
      navigate(`/pro-fix/${draft.serviceId}/estimate/book`);
    }
  }, [draft, navigate]);

  const handleApplyCoupon = useCallback(() => {
    if (!draft) return;
    const result = applyCoupon({
      code: couponInput,
      serviceType: draft.serviceType,
      bookingAmount: priceBase,
      locationId: draft.locationId,
    });
    if (result.ok) {
      setApplied(result.applied);
      setCouponMessage({ type: 'success', text: 'Coupon applied successfully.' });
    } else {
      setApplied(null);
      setCouponMessage({ type: 'error', text: result.error.message });
    }
  }, [draft, couponInput, priceBase]);

  const handleRemoveCoupon = useCallback(() => {
    setApplied(null);
    setCouponInput('');
    setCouponMessage(null);
  }, []);

  const handleSelectMethod = useCallback((id: MethodId) => {
    setMethod(id);
    setFormError(null);
  }, []);

  const commitCash = useCallback(() => {
    if (!draft) return;
    const customerId = getOrCreateCustomerId();
    const couponCode = applied?.code;
    const couponDiscount = applied?.discount ?? 0;

    if (draft.serviceType === 'QUICK_FIX' && draft.quickFixBooking) {
      setQuickFixBooking({
        ...draft.quickFixBooking,
        customerId,
        paymentStatus: 'submitted',
        paymentMethod: 'CASH',
        paymentRef: '',
        payableNow: finalAmount,
        couponCode,
        couponDiscount: couponCode ? couponDiscount : undefined,
      });
    } else if (draft.serviceType === 'PRO_FIX' && draft.proFixOrder) {
      setProFixBooking({
        ...draft.proFixOrder,
        customerId,
        paymentStatus: 'submitted',
        paymentMethod: 'CASH',
        paymentRef: '',
        payableNow: finalAmount,
        couponCode,
        couponDiscount: couponCode ? couponDiscount : undefined,
      });
    }
  }, [draft, applied, finalAmount]);

  const handleConfirm = useCallback(() => {
    if (!draft) return;

    if (!method) {
      setFormError('Please select a payment method.');
      return;
    }

    if (!isCash) {
      setFormError('Online payment isn\u2019t connected yet. Please use Cash Payment to confirm your booking.');
      return;
    }

    if (draft.scheduledDate && draft.scheduledTime) {
      const conflict = findBookingConflict({
        serviceType: draft.serviceType,
        date: draft.scheduledDate,
        timeLabel: draft.scheduledTime,
        durationMin: DEFAULT_SLOT_DURATION_MIN,
        excludeBookingId: draft.bookingId,
      });
      if (conflict !== null) {
        setFormError('Both services can\u2019t be placed at the same time. Please choose another time.');
        return;
      }
    }

    setFormError(null);
    setProcessing(true);
    window.setTimeout(() => {
      commitCash();
      setProcessing(false);
      setSuccess(true);
    }, 700);
  }, [draft, method, isCash, commitCash]);

  if (!draft) {
    return (
      <div className="pay-page">
        <div className="section-container">
          <div className="pay-empty-card">
            <h1 className="pay-empty-title">No Booking Found</h1>
            <p className="pay-empty-text">
              We could not find a pending booking to pay for. Please start a new booking.
            </p>
            <Link to="/" className="pay-home-btn">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isQuickFix = draft.serviceType === 'QUICK_FIX';

  return (
    <div className="pay-page">
      <div className="section-container">
        <button className="pay-back" onClick={handleGoBack} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        <header className="pay-header">
          <span className="pay-eyebrow">
            {isQuickFix ? 'Vijaya Siri Quick Fix' : 'Vijaya Siri Pro Fix'} Payment
          </span>
          <h1 className="pay-title">Payment</h1>
          <p className="pay-subtitle">Booking {draft.bookingId}</p>
        </header>

        {success ? (
          <section className="pay-card pay-success" aria-live="polite">
            <span className="pay-success-icon">
              <Icon name="check-circle" size={30} />
            </span>
            <h2 className="pay-success-title">Booking Confirmed</h2>
            <p className="pay-success-text">
              {applied
                ? `Your booking is confirmed. Pay ${formatINR(finalAmount)} in cash at the time of service.`
                : 'Your booking is confirmed. Pay in cash at the time of service.'}
            </p>
            <div className="pay-success-actions">
              <Link to={detailsPath} className="pay-primary-btn pay-primary-btn--link">
                View Booking Confirmation
                <Icon name="arrow-right" size={16} />
              </Link>
              <Link to="/bookings" className="pay-secondary-btn pay-secondary-btn--link">
                View My Bookings
              </Link>
            </div>
          </section>
        ) : (
          <div className="pay-layout">
            {/* PAYMENT METHODS */}
            <section className="pay-methods pay-card" aria-labelledby="pay-methods-title">
              <h2 className="pay-card-title" id="pay-methods-title">Payment Methods</h2>
              <div className="pay-method-list" role="radiogroup" aria-label="Payment method">
                {METHODS.map((m) => {
                  const active = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`pay-method-option ${active ? 'pay-method-option--active' : ''}`}
                      onClick={() => handleSelectMethod(m.id)}
                    >
                      <span className="pay-method-radio" aria-hidden="true" />
                      <span className="pay-method-option-icon">
                        <Icon name={m.icon} size={18} />
                      </span>
                      <span className="pay-method-option-body">
                        <span className="pay-method-option-label">
                          {m.label}
                          {m.sub && <em className="pay-method-option-reco">{m.sub}</em>}
                        </span>
                        <span className="pay-method-option-desc">{m.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {method && !isCash && (
                <div className="pay-integration-note" role="status">
                  <Icon name="clipboard" size={18} />
                  <p>
                    Online payment is not connected yet. You will be able to pay securely
                    with {methodLabel(method)} once a payment gateway is configured. For now,
                    use Cash Payment to confirm your booking.
                  </p>
                </div>
              )}
            </section>

            {/* BOOKING SUMMARY */}
            <section className="pay-summary-slot pay-card" aria-labelledby="pay-summary-title">
              <h2 className="pay-card-title" id="pay-summary-title">Booking Summary</h2>
              <div className="pay-summary-line">
                <span className="pay-summary-service">
                  <strong>{isQuickFix ? 'Quick Fix' : 'Pro Fix'}</strong>
                  <span>{draft.serviceName}</span>
                </span>
                <span className="pay-summary-meta">{draft.locationLabel}</span>
              </div>
              {(draft.scheduledDate || draft.scheduledTime) && (
                <p className="pay-summary-schedule">
                  {scheduleLabel(draft.scheduledDate)}
                  {draft.scheduledDate && draft.scheduledTime ? ' \u00B7 ' : ''}
                  {draft.scheduledTime}
                </p>
              )}
            </section>

            {/* COUPON */}
            <section className="pay-coupon pay-card" aria-labelledby="pay-coupon-title">
              <button
                type="button"
                className="pay-coupon-toggle"
                onClick={() => setCouponOpen((open) => !open)}
                aria-expanded={couponOpen}
              >
                <span className="pay-coupon-toggle-label">
                  {applied ? (
                    <>
                      <Icon name="check-circle" size={16} />
                      {applied.code} applied
                    </>
                  ) : (
                    'Have a coupon code?'
                  )}
                </span>
                <Icon name="chevron-down" size={16} />
              </button>

              {couponOpen && !applied && (
                <form
                  className="pay-coupon-form"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                  noValidate
                >
                  <input
                    className="pay-coupon-input"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponMessage(null);
                    }}
                    placeholder="Enter coupon code"
                    aria-label="Coupon code"
                    autoComplete="off"
                  />
                  <button className="pay-coupon-apply" type="submit">Apply</button>
                </form>
              )}

              {applied && (
                <div className="pay-coupon-applied">
                  <span className="pay-coupon-applied-label">
                    {applied.code} applied
                  </span>
                  <span className="pay-coupon-applied-remove" role="button" tabIndex={0} onClick={handleRemoveCoupon} onKeyDown={(e) => { if (e.key === 'Enter') handleRemoveCoupon(); }}>
                    Remove
                  </span>
                </div>
              )}

              {couponMessage && (
                <p className={`pay-coupon-message pay-coupon-message--${couponMessage.type}`}>
                  {couponMessage.text}
                </p>
              )}
            </section>

            {/* PRICE DETAILS */}
            <section className="pay-price pay-card" aria-labelledby="pay-price-title">
              <h2 className="pay-card-title" id="pay-price-title">Price Details</h2>
              <dl className="pay-price-rows">
                <div className="pay-price-row">
                  <dt>Service Price</dt>
                  <dd>{formatINR(priceBase)}</dd>
                </div>
                {price.addOnsAmount > 0 && (
                  <div className="pay-price-row">
                    <dt>Add-ons</dt>
                    <dd>{formatINR(price.addOnsAmount)}</dd>
                  </div>
                )}
                {price.discount > 0 && (
                  <div className="pay-price-row">
                    <dt>Discount</dt>
                    <dd>&minus;{formatINR(price.discount)}</dd>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="pay-price-row pay-price-row--discount">
                    <dt>Coupon {applied?.code ?? 'Discount'}</dt>
                    <dd>&minus;{formatINR(couponDiscount)}</dd>
                  </div>
                )}
              </dl>
              <div className="pay-price-total">
                <span className="pay-price-total-label">Total</span>
                <span className="pay-price-total-value">{formatINR(finalAmount)}</span>
              </div>
            </section>

            {/* FINAL CTA */}
            <div className="pay-cta">
              {formError && <p className="pay-form-error">{formError}</p>}
              <button
                className="pay-confirm-btn"
                type="button"
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? 'Confirming\u2026' : `Confirm ${formatINR(finalAmount)}`}
              </button>
              <button className="pay-cancel-btn pay-cancel-btn--block" onClick={handleGoBack} type="button">
                Cancel Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function methodLabel(method: MethodId): string {
  switch (method) {
    case 'UPI':
      return 'UPI';
    case 'Card':
      return 'Card';
    case 'NetBanking':
      return 'Net Banking';
    default:
      return method;
  }
}
