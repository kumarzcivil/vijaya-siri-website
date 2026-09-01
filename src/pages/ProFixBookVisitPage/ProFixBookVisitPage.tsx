import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import {
  getProFixService,
  getProFixCategoryName,
  getProFixSiteVisitCharge,
  getProFixSiteVisitWaiver,
  formatINR,
  calculateProFixWorkCost,
  type ProFixBillingDetails,
  type ProFixSiteVisitOrder,
} from '../../data/profix';
import { setProFixBooking } from '../../store/proFixBooking';
import './ProFixBookVisitPage.css';

type FieldErrors = Partial<Record<keyof ProFixBillingDetails, string>>;

const PAYMENT_METHODS = ['UPI', 'Card', 'NetBanking'] as const;

function validateBillingDetails(details: ProFixBillingDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (!details.name.trim()) errors.name = 'Please enter your name.';
  if (!/^\d{10}$/.test(details.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!details.siteAddress.trim()) errors.siteAddress = 'Please enter the site address.';
  if (!details.siteLocation.trim()) errors.siteLocation = 'Please enter the site location or city.';
  if (details.email.trim() && !/^\S+@\S+\.\S+$/.test(details.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

function processMockSiteVisitPayment(): Promise<string> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(`PF-${Date.now().toString(36).toUpperCase()}`);
    }, 900);
  });
}

export default function ProFixBookVisitPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const service = getProFixService(serviceId);

  const pricing = service?.pricing;
  const pricingEnabled = !!pricing && pricing.enabled && pricing.mode !== 'custom';

  const quantity = useMemo(() => {
    if (!pricingEnabled || !pricing) return 0;
    const parsed = parseFloat(searchParams.get('qty') ?? '');
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    return pricing.defaultQuantity ?? pricing.minQuantity ?? 1;
  }, [pricingEnabled, pricing, searchParams]);

  const workCost = useMemo(
    () => (pricing && pricingEnabled ? calculateProFixWorkCost(pricing, quantity) : null),
    [pricing, pricingEnabled, quantity]
  );

  const siteVisitCharge = service ? getProFixSiteVisitCharge(service) : 0;
  const waiver = service ? getProFixSiteVisitWaiver(service) : null;

  const [details, setDetails] = useState<ProFixBillingDetails>({
    name: '',
    mobile: '',
    siteAddress: '',
    siteLocation: '',
    email: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>('UPI');
  const [processing, setProcessing] = useState(false);

  const handleBack = useCallback(() => {
    navigate(service ? `/pro-fix/${service.id}/estimate?qty=${quantity}` : '/pro-fix');
  }, [navigate, service, quantity]);

  const updateField = useCallback((field: keyof ProFixBillingDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handlePayAndSchedule = useCallback(async () => {
    if (!service || !pricing || workCost === null) return;
    const nextErrors = validateBillingDetails(details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setProcessing(true);
    try {
      const paymentRef = await processMockSiteVisitPayment();
      const effectiveWaiver = waiver?.enabled ? Math.min(waiver.amount, siteVisitCharge) : 0;
      const order: ProFixSiteVisitOrder = {
        serviceId: service.id,
        serviceName: service.name,
        categoryName: getProFixCategoryName(service.category),
        quantity,
        unit: pricing.unit ?? service.unit,
        rate: pricing.rate ?? 0,
        estimatedWorkCost: workCost,
        siteVisitCharge,
        siteVisitWaiverAmount: effectiveWaiver,
        effectiveSiteVisitCost: siteVisitCharge - effectiveWaiver,
        payableNow: siteVisitCharge,
        billingDetails: details,
        estimateStatus: 'booked',
        paymentStatus: 'paid',
        paymentRef,
        createdAt: new Date().toISOString(),
      };
      setProFixBooking(order);
      navigate(`/pro-fix/${service.id}/estimate/confirmed`, { replace: true });
    } finally {
      setProcessing(false);
    }
  }, [service, pricing, workCost, details, siteVisitCharge, waiver, quantity, navigate]);

  if (!service || !pricingEnabled || workCost === null || !pricing) {
    return (
      <div className="pfbook-page">
        <div className="section-container">
          <div className="pfbook-not-found">
            <h2>Estimate Not Available</h2>
            <p>We could not load your estimate. Please review your estimate first.</p>
            <button
              className="pfbook-back"
              onClick={() =>
                navigate(service ? `/pro-fix/${service.id}/estimate` : '/pro-fix')
              }
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Estimate
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = getProFixCategoryName(service.category);
  const unit = pricing.unit ?? service.unit;

  const field = (
    key: keyof ProFixBillingDetails,
    label: string,
    placeholder: string,
    opts?: { optional?: boolean }
  ) => (
    <div className={`pfbook-field ${errors[key] ? 'pfbook-field--error' : ''}`}>
      <label className="pfbook-label" htmlFor={`pfbook-${key}`}>
        {label}
        {opts?.optional && <span className="pfbook-label-optional"> (optional)</span>}
      </label>
      <input
        id={`pfbook-${key}`}
        className="pfbook-input"
        type={key === 'email' ? 'email' : 'text'}
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
      {errors[key] && <span className="pfbook-field-error">{errors[key]}</span>}
    </div>
  );

  const payButton = (
    <button
      className="pfbook-pay-btn"
      onClick={handlePayAndSchedule}
      disabled={processing}
      type="button"
    >
      {processing ? 'Processing…' : `Pay ${formatINR(siteVisitCharge)} & Schedule Visit`}
      {!processing && <Icon name="arrow-right" size={16} />}
    </button>
  );

  return (
    <div className="pfbook-page">
      <div className="section-container">
        <button className="pfbook-back" onClick={handleBack} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Estimate
        </button>

        <header className="pfbook-header">
          <span className="pfbook-eyebrow">Vijaya Siri Pro Fix</span>
          <h1 className="pfbook-title">Get the Work Done</h1>
          <p className="pfbook-subtitle">Only the site visit charge is payable now.</p>
        </header>

        <div className="pfbook-layout">
          <section className="pfbook-card pfbook-context" aria-label="Service context">
            <div className="pfbook-service-row">
              {service.imageUrl && (
                <img src={service.imageUrl} alt="" className="pfbook-service-thumb" />
              )}
              <div className="pfbook-service-info">
                <span className="pfbook-card-label">Service</span>
                <h2 className="pfbook-service-name">{service.name}</h2>
                <span className="pfbook-service-meta">
                  {categoryName} &middot; {quantity.toLocaleString('en-IN')} {unit}
                </span>
              </div>
            </div>
          </section>

          <section className="pfbook-card pfbook-billing" aria-labelledby="pfbook-billing-title">
            <span className="pfbook-card-label" id="pfbook-billing-title">Billing Details</span>
            <div className="pfbook-field-grid">
              {field('name', 'Name', 'Your full name')}
              {field('mobile', 'Mobile', '10-digit mobile number')}
            </div>

            <span className="pfbook-card-label pfbook-card-label--sub" id="pfbook-site-title">
              Site Details
            </span>
            <div className="pfbook-field-grid">
              {field('siteAddress', 'Site Address', 'Flat / Plot / Street / Area')}
              {field('siteLocation', 'Site Location', 'Site Location / Landmark / City')}
              {field('email', 'Email', 'you@example.com', { optional: true })}
            </div>
          </section>

          <aside className="pfbook-side">
            <div className="pfbook-visit" role="note">
              <div className="pfbook-visit-main">
                <span className="pfbook-visit-label">Site Visit Charge</span>
                <span className="pfbook-visit-amount">{formatINR(siteVisitCharge)}</span>
              </div>
              <span className="pfbook-visit-waiver">
                <Icon name="check" size={13} />
                Waived after work completion
              </span>
            </div>

            <section className="pfbook-summary" aria-labelledby="pfbook-summary-title">
              <h2 className="pfbook-summary-title" id="pfbook-summary-title">Payment Summary</h2>
              <dl className="pfbook-summary-rows">
                <div className="pfbook-summary-row">
                  <dt>Estimated Work Cost</dt>
                  <dd>{formatINR(workCost)}</dd>
                </div>
                <div className="pfbook-summary-row">
                  <dt>Site Visit Charge</dt>
                  <dd>{formatINR(siteVisitCharge)}</dd>
                </div>
              </dl>
              <div className="pfbook-payable">
                <span className="pfbook-payable-label">Payable Now</span>
                <span className="pfbook-payable-value">{formatINR(siteVisitCharge)}</span>
              </div>
              <p className="pfbook-payable-note">
                You&apos;re paying only the site visit charge now. The work estimate is confirmed
                after site assessment.
              </p>
            </section>

            <div className="pfbook-methods-block">
              <div className="pfbook-methods" role="group" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`pfbook-method ${paymentMethod === m ? 'pfbook-method--active' : ''}`}
                    onClick={() => setPaymentMethod(m)}
                    aria-pressed={paymentMethod === m}
                  >
                    {m}
                  </button>
                ))}
                <span className="pfbook-test-badge">Test Mode</span>
              </div>
              <p className="pfbook-methods-note">Test payment &mdash; no real money is charged.</p>
            </div>

            <div className="pfbook-side-action">{payButton}</div>
          </aside>
        </div>
      </div>

      <div className="pfbook-actionbar">
        <div className="pfbook-actionbar-total">
          <span className="pfbook-actionbar-label">Payable Now</span>
          <span className="pfbook-actionbar-amount">{formatINR(siteVisitCharge)}</span>
        </div>
        {payButton}
      </div>
    </div>
  );
}
