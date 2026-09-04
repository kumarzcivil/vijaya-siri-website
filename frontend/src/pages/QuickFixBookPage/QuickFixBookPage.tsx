import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import {
  getQuickFixService,
  getQuickFixCategoryName,
  formatINR,
} from '../../data/quickfix';
import {
  getQuickFixSlotDays,
  QUICK_FIX_TIME_SLOTS,
  type QuickFixBooking,
  type QuickFixBookingDetails,
} from '../../data/quickfixBooking';
import { useLocation } from '../../context/LocationContext';
import {
  CURRENCY,
  generateBookingId,
  generatePaymentId,
  getOrCreateCustomerId,
  type Payment,
  type PaymentDraft,
} from '../../data/payment';
import { DEFAULT_SLOT_DURATION_MIN } from '../../data/bookingSchedule';
import { setQuickFixBooking } from '../../store/quickFixBooking';
import { setPaymentDraft } from '../../store/payment';
import { findBookingConflict } from '../../store/bookingConflict';
import './QuickFixBookPage.css';

type FieldErrors = Partial<Record<keyof QuickFixBookingDetails, string>>;

function validateDetails(details: QuickFixBookingDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (!details.name.trim()) errors.name = 'Please enter your name.';
  if (!/^\d{10}$/.test(details.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!details.siteAddress.trim()) errors.siteAddress = 'Please enter the site address.';
  if (!details.siteLocation.trim()) errors.siteLocation = 'Please enter the area or city.';
  return errors;
}

export default function QuickFixBookPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { selected } = useLocation();
  const service = getQuickFixService(serviceId);

  const requiresTimeSlot = service?.bookingConfiguration.requiresTimeSlot ?? false;
  const requiresPayment = service?.bookingConfiguration.requiresPayment ?? false;
  const amount = service?.pricing.enabled ? service.pricing.price ?? 0 : 0;

  const [slotDate, setSlotDate] = useState<string>('');
  const [slotTime, setSlotTime] = useState<string>('');
  const [details, setDetails] = useState<QuickFixBookingDetails>({
    name: '',
    mobile: '',
    siteAddress: '',
    siteLocation: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [slotError, setSlotError] = useState<string | null>(null);

  const slotDays = useMemo(getQuickFixSlotDays, []);

  const handleBack = useCallback(() => {
    navigate(service ? `/quick-fix/${service.id}` : '/quick-fix');
  }, [navigate, service]);

  const updateField = useCallback(
    (field: keyof QuickFixBookingDetails, value: string) => {
      setDetails((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (!service) return;

    const nextErrors = validateDetails(details);
    setErrors(nextErrors);

    let hasSlotError = false;
    if (requiresTimeSlot && (!slotDate || !slotTime)) {
      setSlotError('Please select a date and time slot.');
      hasSlotError = true;
    } else {
      setSlotError(null);
    }

    if (Object.keys(nextErrors).length > 0 || hasSlotError) return;

    if (requiresTimeSlot) {
      const conflict = findBookingConflict({
        serviceType: 'QUICK_FIX',
        date: slotDate,
        timeLabel: slotTime,
        durationMin: DEFAULT_SLOT_DURATION_MIN,
      });
      if (conflict !== null) {
        setSlotError(
          'Both services can\u2019t be placed at the same time. Please choose another time.'
        );
        return;
      }
    }

    const customerId = getOrCreateCustomerId();
    const bookingId = generateBookingId('QUICK_FIX');

    const pendingBooking: QuickFixBooking = {
      serviceId: service.id,
      serviceName: service.name,
      categoryName: getQuickFixCategoryName(service.categoryId),
      slotDate,
      slotTime,
      amount,
      payableNow: requiresPayment ? amount : 0,
      paymentRequired: requiresPayment,
      paymentStatus: requiresPayment ? 'pending' : 'pay_after_service',
      paymentRef: '',
      paymentId: requiresPayment ? generatePaymentId() : undefined,
      bookingId,
      customerId,
      customerDetails: details,
      createdAt: new Date().toISOString(),
    };

    if (!requiresPayment) {
      setQuickFixBooking(pendingBooking);
      navigate(`/quick-fix/${service.id}/confirmed`, { replace: true });
      return;
    }

    const payment: Payment = {
      paymentId: pendingBooking.paymentId as string,
      bookingId,
      customerId,
      amount: pendingBooking.payableNow,
      currency: CURRENCY,
      method: null,
      status: 'INITIATED',
      transactionReference: '',
      gatewayReference: null,
      createdAt: new Date().toISOString(),
    };

    const draft: PaymentDraft = {
      serviceType: 'QUICK_FIX',
      bookingId,
      currency: CURRENCY,
      payment,
      serviceId: service.id,
      serviceName: service.name,
      categoryName: pendingBooking.categoryName,
      locationId: selected.id,
      locationLabel: selected.label,
      scheduledDate: slotDate,
      scheduledTime: slotTime,
      customer: {
        customerId,
        name: details.name,
        mobile: details.mobile,
        siteAddress: details.siteAddress,
        siteLocation: details.siteLocation,
      },
      price: {
        basePrice: amount,
        addOnsAmount: 0,
        discount: 0,
        finalAmount: amount,
      },
      quickFixBooking: pendingBooking,
    };

    setQuickFixBooking(pendingBooking);
    setPaymentDraft(draft);
    navigate(`/payment?service=QUICK_FIX`, { replace: true });
  }, [
    service,
    details,
    requiresTimeSlot,
    requiresPayment,
    slotDate,
    slotTime,
    amount,
    selected,
    navigate,
  ]);

  if (!service) {
    return (
      <div className="qfk-page">
        <div className="section-container">
          <div className="qfk-not-found">
            <h2>Service Not Found</h2>
            <p>The Quick Fix service you are looking for does not exist.</p>
            <button className="qfk-back" onClick={() => navigate('/quick-fix')} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Quick Fix
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = getQuickFixCategoryName(service.categoryId);
  const selectedDayLabel = slotDays.find((d) => d.value === slotDate)?.label ?? '';

  const confirmButton = (
    <button
      className="qfk-confirm-btn"
      onClick={handleConfirm}
      type="button"
    >
      {requiresPayment ? `Continue to Payment \u00B7 ${formatINR(amount)}` : 'Confirm Booking'}
      <Icon name="arrow-right" size={16} />
    </button>
  );

  const field = (
    key: keyof QuickFixBookingDetails,
    label: string,
    placeholder: string
  ) => (
    <div className={`qfk-field ${errors[key] ? 'qfk-field--error' : ''}`}>
      <label className="qfk-label" htmlFor={`qfk-${key}`}>
        {label}
      </label>
      <input
        id={`qfk-${key}`}
        className="qfk-input"
        type="text"
        inputMode={key === 'mobile' ? 'numeric' : undefined}
        value={details[key]}
        onChange={(e) =>
          updateField(
            key,
            key === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
          )
        }
        placeholder={placeholder}
      />
      {errors[key] && <span className="qfk-field-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="qfk-page">
      <div className="section-container">
        <button className="qfk-back" onClick={handleBack} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {service.name}
        </button>

        <header className="qfk-header">
          <span className="qfk-eyebrow">Vijaya Siri Quick Fix</span>
          <h1 className="qfk-title">Book Service</h1>
          <p className="qfk-subtitle">Confirm your service in under a minute.</p>
        </header>

        <div className="qfk-layout">
          <div className="qfk-main">
            {/* STEP — CONFIRM SERVICE */}
            <section className="qfk-card qfk-context" aria-label="Selected service">
              <span className="qfk-step-tag">Step 1</span>
              <div className="qfk-service-row">
                {service.image && (
                  <img src={service.image} alt="" className="qfk-service-thumb" />
                )}
                <div className="qfk-service-info">
                  <span className="qfk-card-label">Service</span>
                  <h2 className="qfk-service-name">{service.name}</h2>
                  <span className="qfk-service-meta">{categoryName}</span>
                </div>
                <span className="qfk-service-amount">{formatINR(amount)}</span>
              </div>
            </section>

            {/* STEP — TIME SLOT (only when required) */}
            {requiresTimeSlot && (
              <section
                className={`qfk-card ${slotError ? 'qfk-card--error' : ''}`}
                aria-labelledby="qfk-slot-title"
              >
                <span className="qfk-step-tag">Step 2</span>
                <h2 className="qfk-card-title" id="qfk-slot-title">Pick a Convenient Time</h2>
                <div className="qfk-chip-row" role="group" aria-label="Select date">
                  {slotDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={`qfk-chip ${slotDate === day.value ? 'qfk-chip--active' : ''}`}
                      onClick={() => {
                        setSlotDate(day.value);
                        setSlotError(null);
                      }}
                      aria-pressed={slotDate === day.value}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <div className="qfk-chip-row" role="group" aria-label="Select time slot">
                  {QUICK_FIX_TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`qfk-chip ${slotTime === slot ? 'qfk-chip--active' : ''}`}
                      onClick={() => {
                        setSlotTime(slot);
                        setSlotError(null);
                      }}
                      aria-pressed={slotTime === slot}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {slotError && <span className="qfk-field-error">{slotError}</span>}
              </section>
            )}

            {/* STEP — CUSTOMER / SITE DETAILS */}
            <section className="qfk-card" aria-labelledby="qfk-details-title">
              <span className="qfk-step-tag">Step {requiresTimeSlot ? 3 : 2}</span>
              <h2 className="qfk-card-title" id="qfk-details-title">Your Details</h2>
              <div className="qfk-field-grid">
                {field('name', 'Name', 'Your full name')}
                {field('mobile', 'Mobile', '10-digit mobile number')}
                {field('siteAddress', 'Site Address', 'Flat / House / Street / Area')}
                {field('siteLocation', 'Site Location', 'Landmark / City')}
              </div>
            </section>
          </div>

          {/* STEP — CONFIRM / PAY */}
          <aside className="qfk-side">
            <section className="qfk-summary" aria-labelledby="qfk-summary-title">
              <span className="qfk-step-tag">Step {requiresTimeSlot ? 4 : 3}</span>
              <h2 className="qfk-summary-title" id="qfk-summary-title">
                {requiresPayment ? 'Payment Summary' : 'Booking Summary'}
              </h2>
              <dl className="qfk-summary-rows">
                <div className="qfk-summary-row">
                  <dt>Service</dt>
                  <dd>{service.name}</dd>
                </div>
                {requiresTimeSlot && slotDate && slotTime && (
                  <div className="qfk-summary-row">
                    <dt>Schedule</dt>
                    <dd>{selectedDayLabel} &middot; {slotTime}</dd>
                  </div>
                )}
                <div className="qfk-summary-row">
                  <dt>Amount</dt>
                  <dd>{formatINR(amount)}</dd>
                </div>
              </dl>
              <div className="qfk-payable">
                <span className="qfk-payable-label">Payable Now</span>
                <span className="qfk-payable-value">
                  {requiresPayment ? formatINR(amount) : '\u20B90'}
                </span>
              </div>
              <p className="qfk-payable-note">
                {requiresPayment
                  ? 'You will choose a payment method on the next step to confirm your slot. Balance if any is quoted before extra work.'
                  : 'No prepayment needed. Pay after the service is completed.'}
              </p>

              <div className="qfk-side-action">{confirmButton}</div>
            </section>
          </aside>
        </div>
      </div>

      {/* STICKY MOBILE ACTION BAR */}
      <div className="qfk-actionbar">
        <div className="qfk-actionbar-total">
          <span className="qfk-actionbar-label">{requiresPayment ? 'Payable Now' : 'Amount'}</span>
          <span className="qfk-actionbar-amount">{formatINR(requiresPayment ? amount : 0)}</span>
        </div>
        {confirmButton}
      </div>
    </div>
  );
}
