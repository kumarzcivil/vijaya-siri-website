import { useState, useMemo, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { projectTypes, type ProjectType } from '../../data/quoteFormConfig';
import './QuoteFormPage.css';

const STEPS = [
  { num: 1, label: 'About You' },
  { num: 2, label: 'Your Project' },
  { num: 3, label: 'Submit' },
];

const BUDGET_OPTIONS = [
  { id: 'below-10l', label: 'Below \u20B910 Lakhs' },
  { id: '10l-25l', label: '\u20B910\u201325 Lakhs' },
  { id: '25l-50l', label: '\u20B925\u201350 Lakhs' },
  { id: '50l-1cr', label: '\u20B950 Lakhs\u2013\u20B91 Crore' },
  { id: 'above-1cr', label: 'Above \u20B91 Crore' },
  { id: 'not-sure', label: 'Not Sure Yet' },
];

interface QuoteFormData {
  fullName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  location: string;
  projectType: ProjectType | '';
  area: string;
  budget: string;
  requirements: string;
}

const initialData: QuoteFormData = {
  fullName: '',
  mobile: '',
  whatsapp: '',
  email: '',
  location: '',
  projectType: '',
  area: '',
  budget: '',
  requirements: '',
};

type FormErrors = Partial<Record<keyof QuoteFormData, string>>;

function validateMobile(v: string): boolean {
  return /^[6-9]\d{9}$/.test(v.trim());
}

function validateEmail(v: string): boolean {
  if (!v.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function generateRefId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VS-${ts}-${rand}`;
}

export default function QuoteFormPage() {
  const navigate = useNavigate();
  const { selected, options: locationOptions } = useLocation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuoteFormData>({
    ...initialData,
    location: selected.id,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [refId] = useState(generateRefId);

  const handleChange = useCallback(
    (field: keyof QuoteFormData, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const validateStep = useCallback(
    (s: number): boolean => {
      const e: FormErrors = {};

      if (s === 1) {
        if (!data.fullName.trim()) e.fullName = 'Please enter your name';
        if (!data.mobile.trim()) e.mobile = 'Please enter your mobile number';
        else if (!validateMobile(data.mobile)) e.mobile = 'Enter a valid 10-digit Indian mobile number';
        if (data.email && !validateEmail(data.email)) e.email = 'Enter a valid email address';
      }

      if (s === 2) {
        if (!data.location) e.location = 'Please select a location';
        if (!data.projectType) e.projectType = 'Please select a project type';
      }

      setErrors(e);
      return Object.keys(e).length === 0;
    },
    [data]
  );

  const nextStep = useCallback(() => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback(
    (s: number) => {
      if (s < step) setStep(s);
    },
    [step]
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      submitQuoteRequest(data, refId);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [data, refId]
  );

  const selectedLocationLabel = useMemo(
    () => locationOptions.find((l) => l.id === data.location)?.label || '',
    [data.location, locationOptions]
  );

  const selectedProjectTypeLabel = useMemo(
    () => projectTypes.find((p) => p.id === data.projectType)?.label || '',
    [data.projectType]
  );

  const selectedBudgetLabel = useMemo(
    () => BUDGET_OPTIONS.find((b) => b.id === data.budget)?.label || '',
    [data.budget]
  );

  if (submitted) {
    return (
      <div className="quote-form-page">
        <div className="quote-form-container">
          <div className="quote-success">
            <div className="quote-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="quote-success-title">Quote Request Received</h1>
            <p className="quote-success-text">
              Thank you for sharing your project requirements. Our team will review the details and contact you shortly.
            </p>
            <div className="quote-success-ref">
              <span className="quote-success-ref-label">Reference ID</span>
              <span className="quote-success-ref-id">{refId}</span>
            </div>
            <div className="quote-success-actions">
              <button className="quote-btn quote-btn--primary" onClick={() => navigate('/')}>
                Back to Projects
              </button>
              <a
                href="https://wa.me/919008855088?text=Hi%20Vijaya%20Siri%2C%20I%20just%20submitted%20a%20quote%20request.%20Ref%3A%20{refId}"
                target="_blank"
                rel="noopener noreferrer"
                className="quote-btn quote-btn--whatsapp"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Vijaya Siri
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-form-page">
      <div className="quote-form-container">
        {/* Header */}
        <div className="quote-form-header">
          <h1 className="quote-form-title">Get Your Free Quote</h1>
          <p className="quote-form-subtitle">
            Share your project details and our team will prepare a personalised quotation.
          </p>
        </div>

        {/* Progress */}
        <div className="quote-progress" role="navigation" aria-label="Form steps">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`quote-progress-step ${step === s.num ? 'quote-progress-step--active' : ''} ${step > s.num ? 'quote-progress-step--done' : ''}`}
              onClick={() => goToStep(s.num)}
              role="button"
              tabIndex={step > s.num ? 0 : -1}
              aria-current={step === s.num ? 'step' : undefined}
            >
              <span className="quote-progress-num">
                {step > s.num ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s.num
                )}
              </span>
              <span className="quote-progress-label">{s.label}</span>
              {i < STEPS.length - 1 && <div className="quote-progress-line" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <form className="quote-form-body" onSubmit={handleSubmit} noValidate>
          {/* Step 1: About You */}
          {step === 1 && (
            <div className="quote-step quote-step--enter">
              <h2 className="quote-step-title">About You</h2>
              <p className="quote-step-desc">Tell us how to reach you.</p>

              <div className="quote-field">
                <label className="quote-label" htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  className={`quote-input ${errors.fullName ? 'quote-input--error' : ''}`}
                  placeholder="Your full name"
                  value={data.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  autoComplete="name"
                />
                {errors.fullName && <span className="quote-error">{errors.fullName}</span>}
              </div>

              <div className="quote-field">
                <label className="quote-label" htmlFor="mobile">Mobile Number *</label>
                <div className="quote-input-group">
                  <span className="quote-input-prefix">+91</span>
                  <input
                    id="mobile"
                    type="tel"
                    className={`quote-input quote-input--phone ${errors.mobile ? 'quote-input--error' : ''}`}
                    placeholder="98765 43210"
                    value={data.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    autoComplete="tel-national"
                    inputMode="numeric"
                  />
                </div>
                {errors.mobile && <span className="quote-error">{errors.mobile}</span>}
              </div>

              <div className="quote-field">
                <label className="quote-label" htmlFor="whatsapp">WhatsApp Number</label>
                <div className="quote-input-group">
                  <span className="quote-input-prefix">+91</span>
                  <input
                    id="whatsapp"
                    type="tel"
                    className="quote-input quote-input--phone"
                    placeholder="Same as mobile (optional)"
                    value={data.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    autoComplete="tel-national"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="quote-field">
                <label className="quote-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className={`quote-input ${errors.email ? 'quote-input--error' : ''}`}
                  placeholder="your@email.com"
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <span className="quote-error">{errors.email}</span>}
              </div>
            </div>
          )}

          {/* Step 2: Your Project */}
          {step === 2 && (
            <div className="quote-step quote-step--enter">
              <h2 className="quote-step-title">Your Project</h2>
              <p className="quote-step-desc">Tell us a little about your project.</p>

              <div className="quote-field">
                <label className="quote-label">Project Location *</label>
                <div className="quote-radio-group">
                  {locationOptions.map((loc) => (
                    <label key={loc.id} className={`quote-radio-card ${data.location === loc.id ? 'quote-radio-card--selected' : ''}`}>
                      <input
                        type="radio"
                        name="location"
                        value={loc.id}
                        checked={data.location === loc.id}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="quote-radio-input"
                      />
                      <span className="quote-radio-dot" />
                      <span className="quote-radio-label">{loc.city}</span>
                      <span className="quote-radio-sub">{loc.state}</span>
                    </label>
                  ))}
                </div>
                {errors.location && <span className="quote-error">{errors.location}</span>}
              </div>

              <div className="quote-field">
                <label className="quote-label">Project Type *</label>
                <div className="quote-radio-group quote-radio-group--wrap">
                  {projectTypes.map((pt) => (
                    <label key={pt.id} className={`quote-radio-card ${data.projectType === pt.id ? 'quote-radio-card--selected' : ''}`}>
                      <input
                        type="radio"
                        name="projectType"
                        value={pt.id}
                        checked={data.projectType === pt.id}
                        onChange={(e) => handleChange('projectType', e.target.value as ProjectType)}
                        className="quote-radio-input"
                      />
                      <span className="quote-radio-dot" />
                      <span className="quote-radio-label">{pt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.projectType && <span className="quote-error">{errors.projectType}</span>}
              </div>

              <div className="quote-field">
                <label className="quote-label" htmlFor="area">Approximate Area (sq.ft)</label>
                <input
                  id="area"
                  type="text"
                  className="quote-input"
                  placeholder="e.g. 1200"
                  value={data.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className="quote-field">
                <label className="quote-label" htmlFor="budget">Budget</label>
                <select
                  id="budget"
                  className="quote-select"
                  value={data.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                >
                  <option value="">Select your budget</option>
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div className="quote-field">
                <label className="quote-label" htmlFor="requirements">Tell Us More</label>
                <textarea
                  id="requirements"
                  className="quote-textarea"
                  rows={3}
                  placeholder="Tell us briefly about your project or what you need help with..."
                  value={data.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="quote-step quote-step--enter">
              <h2 className="quote-step-title">Review Your Requirement</h2>
              <p className="quote-step-desc">Please verify the details before submitting.</p>

              <div className="quote-review">
                <div className="quote-review-item">
                  <span className="quote-review-label">Name</span>
                  <span className="quote-review-value">{data.fullName || '\u2014'}</span>
                  <button type="button" className="quote-review-edit" onClick={() => goToStep(1)}>Edit</button>
                </div>
                <div className="quote-review-item">
                  <span className="quote-review-label">Phone</span>
                  <span className="quote-review-value">+91 {data.mobile || '\u2014'}</span>
                  <button type="button" className="quote-review-edit" onClick={() => goToStep(1)}>Edit</button>
                </div>
                {data.whatsapp && (
                  <div className="quote-review-item">
                    <span className="quote-review-label">WhatsApp</span>
                    <span className="quote-review-value">+91 {data.whatsapp}</span>
                  </div>
                )}
                {data.email && (
                  <div className="quote-review-item">
                    <span className="quote-review-label">Email</span>
                    <span className="quote-review-value">{data.email}</span>
                    <button type="button" className="quote-review-edit" onClick={() => goToStep(1)}>Edit</button>
                  </div>
                )}
                <div className="quote-review-divider" />
                <div className="quote-review-item">
                  <span className="quote-review-label">Location</span>
                  <span className="quote-review-value">{selectedLocationLabel || '\u2014'}</span>
                  <button type="button" className="quote-review-edit" onClick={() => goToStep(2)}>Edit</button>
                </div>
                <div className="quote-review-item">
                  <span className="quote-review-label">Project Type</span>
                  <span className="quote-review-value">{selectedProjectTypeLabel || '\u2014'}</span>
                  <button type="button" className="quote-review-edit" onClick={() => goToStep(2)}>Edit</button>
                </div>
                {data.area && (
                  <div className="quote-review-item">
                    <span className="quote-review-label">Area</span>
                    <span className="quote-review-value">{data.area} sq.ft</span>
                  </div>
                )}
                {selectedBudgetLabel && (
                  <div className="quote-review-item">
                    <span className="quote-review-label">Budget</span>
                    <span className="quote-review-value">{selectedBudgetLabel}</span>
                  </div>
                )}
                {data.requirements && (
                  <div className="quote-review-item quote-review-item--column">
                    <span className="quote-review-label">Requirements</span>
                    <span className="quote-review-value">{data.requirements}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="quote-nav">
            {step > 1 && (
              <button type="button" className="quote-btn quote-btn--back" onClick={prevStep}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="quote-btn quote-btn--primary" onClick={nextStep}>
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            ) : (
              <button type="submit" className="quote-btn quote-btn--submit">
                Submit Quote Request
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function submitQuoteRequest(_data: QuoteFormData, _refId: string) {
  // Backend integration point.
  // When a real API/CRM is available, replace this stub with an actual submission call.
  // e.g. await fetch('/api/quote', { method: 'POST', body: JSON.stringify({ ..._data, refId: _refId }) });
  console.log('Quote request submitted:', { refId: _refId, ..._data });
}
/* eslint-enable @typescript-eslint/no-unused-vars */
