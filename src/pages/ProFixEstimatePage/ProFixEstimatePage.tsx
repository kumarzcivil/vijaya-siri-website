import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon/Icon';
import {
  getProFixService,
  getProFixCategoryName,
  formatINR,
  calculateProFixWorkCost,
  type ProFixPricing,
} from '../../data/profix';
import './ProFixEstimatePage.css';

const WHATSAPP = 'https://wa.me/919008855088';

function clampQuantity(value: number, pricing: ProFixPricing): number {
  const min = pricing.minQuantity ?? 0;
  const max = pricing.maxQuantity ?? Number.MAX_SAFE_INTEGER;
  if (Number.isNaN(value) || value < min) return min;
  if (value > max) return max;
  return value;
}

export default function ProFixEstimatePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const service = getProFixService(serviceId);

  const pricing = service?.pricing;
  const pricingEnabled = !!pricing && pricing.enabled && pricing.mode !== 'custom';

  const [quantityText, setQuantityText] = useState<string>(() =>
    pricingEnabled ? String(pricing?.defaultQuantity ?? pricing?.minQuantity ?? 1) : ''
  );

  const quantity = useMemo(
    () => (pricingEnabled ? clampQuantity(parseFloat(quantityText), pricing as ProFixPricing) : 0),
    [quantityText, pricingEnabled, pricing]
  );

  const subtotal = useMemo(
    () => (pricing && pricingEnabled ? calculateProFixWorkCost(pricing, quantity) : null),
    [pricing, pricingEnabled, quantity]
  );

  const handleBack = useCallback(() => {
    navigate(service ? `/pro-fix/${service.id}` : '/pro-fix');
  }, [navigate, service]);

  const changeQuantity = useCallback(
    (delta: number) => {
      if (!pricing) return;
      const next = clampQuantity(quantity + delta * (pricing.step ?? 1), pricing);
      setQuantityText(String(next));
    },
    [pricing, quantity]
  );

  const handleQuantityBlur = useCallback(() => {
    if (!pricing) return;
    setQuantityText(String(clampQuantity(parseFloat(quantityText), pricing)));
  }, [pricing, quantityText]);

  const handleGetWorkDone = useCallback(() => {
    if (!service || subtotal === null) return;
    navigate(`/pro-fix/${service.id}/estimate/book?qty=${quantity}`);
  }, [navigate, service, subtotal, quantity]);

  if (!service) {
    return (
      <div className="pfest-page">
        <div className="section-container">
          <div className="pfest-not-found">
            <h2>Service Not Found</h2>
            <p>The Pro Fix service you are looking for does not exist.</p>
            <button className="pfest-back" onClick={() => navigate('/pro-fix')} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Pro Fix
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = getProFixCategoryName(service.category);
  const unit = pricing?.unit ?? service.unit;
  const quantityLabel = pricing?.quantityLabel ?? 'Quantity';

  return (
    <div className="pfest-page">
      <div className="section-container">
        <button className="pfest-back" onClick={handleBack} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {service.name}
        </button>

        <header className="pfest-header">
          <span className="pfest-eyebrow">Vijaya Siri Pro Fix</span>
          <h1 className="pfest-title">Create Estimate</h1>
          <p className="pfest-subtitle">
            Estimate only &mdash; not an invoice or final quotation.
          </p>
        </header>

        <div className="pfest-layout">
          <div className="pfest-main">
            <section className="pfest-card pfest-service-card" aria-label="Selected service">
              <span className="pfest-card-label">Service</span>
              <div className="pfest-service-row">
                {service.imageUrl && (
                  <img src={service.imageUrl} alt="" className="pfest-service-thumb" />
                )}
                <div className="pfest-service-info">
                  <h2 className="pfest-service-name">{service.name}</h2>
                  <span className="pfest-service-cat">{categoryName}</span>
                </div>
              </div>
            </section>

            {pricingEnabled && pricing && (
              <section className="pfest-card" aria-label="Estimate inputs">
                <span className="pfest-card-label">{quantityLabel}</span>
                <div className="pfest-qty-row">
                  <button
                    className="pfest-step-btn"
                    onClick={() => changeQuantity(-(pricing.step ?? 1))}
                    type="button"
                    aria-label={`Decrease ${quantityLabel.toLowerCase()}`}
                  >
                    &minus;
                  </button>
                  <input
                    className="pfest-qty-input"
                    type="text"
                    inputMode="decimal"
                    value={quantityText}
                    onChange={(e) => setQuantityText(e.target.value.replace(/[^\d.]/g, ''))}
                    onBlur={handleQuantityBlur}
                    aria-label={`${quantityLabel} in ${unit}`}
                  />
                  <button
                    className="pfest-step-btn"
                    onClick={() => changeQuantity(pricing.step ?? 1)}
                    type="button"
                    aria-label={`Increase ${quantityLabel.toLowerCase()}`}
                  >
                    +
                  </button>
                  <span className="pfest-qty-unit">{unit}</span>
                </div>

                {pricing.mode === 'fixed' ? (
                  <div className="pfest-rate-row">
                    <span className="pfest-rate-label">Fixed Price</span>
                    <span className="pfest-rate-value">{formatINR(pricing.rate ?? 0)}</span>
                  </div>
                ) : (
                  <div className="pfest-rate-row">
                    <span className="pfest-rate-label">Rate</span>
                    <span className="pfest-rate-value">
                      {formatINR(pricing.rate ?? 0)} / {unit}
                    </span>
                  </div>
                )}

                {subtotal !== null && (
                  <div className="pfest-subtotal-row">
                    <span className="pfest-subtotal-label">Subtotal</span>
                    <span className="pfest-subtotal-value">{formatINR(subtotal)}</span>
                  </div>
                )}
              </section>
            )}

            {!pricingEnabled && (
              <section className="pfest-card pfest-custom-card" aria-label="Custom estimate">
                <span className="pfest-custom-icon">
                  <Icon name="receipt" size={22} />
                </span>
                <h2 className="pfest-custom-title">Custom Estimate</h2>
                <p className="pfest-custom-text">
                  This service is priced individually based on your requirements. Chat with our
                  team and we&apos;ll prepare a detailed estimate for you.
                </p>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pfest-custom-chat"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat with us
                </a>
              </section>
            )}
          </div>

          <aside className="pfest-summary-wrap">
            <section className="pfest-summary" aria-labelledby="pfest-summary-title">
              <h2 className="pfest-summary-title" id="pfest-summary-title">Estimate Summary</h2>
              {pricingEnabled && subtotal !== null && pricing ? (
                <>
                  <dl className="pfest-summary-rows">
                    <div className="pfest-summary-row">
                      <dt>Service</dt>
                      <dd>{service.name}</dd>
                    </div>
                    {pricing.mode !== 'fixed' && (
                      <div className="pfest-summary-row">
                        <dt>{quantityLabel}</dt>
                        <dd>
                          {quantity.toLocaleString('en-IN')} {unit}
                        </dd>
                      </div>
                    )}
                    <div className="pfest-summary-row">
                      <dt>{pricing.mode === 'fixed' ? 'Fixed Price' : 'Rate'}</dt>
                      <dd>
                        {formatINR(pricing.rate ?? 0)}
                        {pricing.mode !== 'fixed' ? ` / ${unit}` : ''}
                      </dd>
                    </div>
                    <div className="pfest-summary-row">
                      <dt>Subtotal</dt>
                      <dd>{formatINR(subtotal)}</dd>
                    </div>
                  </dl>
                  <div className="pfest-total">
                    <span className="pfest-total-label">Estimated Total</span>
                    <span className="pfest-total-value">{formatINR(subtotal)}</span>
                  </div>
                </>
              ) : (
                <div className="pfest-summary-empty">
                  <span className="pfest-summary-empty-value">Custom Estimate</span>
                  <p className="pfest-summary-empty-text">
                    No standard rate configured. Our team will prepare your estimate personally.
                  </p>
                </div>
              )}
              <p className="pfest-disclaimer">
                This is an indicative estimate for planning purposes only. It is not an invoice,
                final quotation, or payment request. Final amount is confirmed after site
                assessment.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {pricingEnabled && subtotal !== null && (
        <div className="pfest-actionbar">
          <div className="pfest-actionbar-total">
            <span className="pfest-actionbar-label">Estimated Total</span>
            <span className="pfest-actionbar-amount">{formatINR(subtotal)}</span>
          </div>
          <button className="pfest-review-btn" onClick={handleGetWorkDone} type="button">
            Get the Work Done
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
