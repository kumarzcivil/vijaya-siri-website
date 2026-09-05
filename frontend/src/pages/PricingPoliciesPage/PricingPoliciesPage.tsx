import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchPackages, type Package } from '../../api/packages';
import './PricingPoliciesPage.css';

const scopeChangeSteps = ['Requested', 'Costed', 'Confirmed', 'Executed'];

const siteConditionItems = [
  'Difficult soil conditions',
  'Additional foundation requirements',
  'Existing structural issues',
  'Additional demolition',
  'Major level differences',
  'Restricted site access',
  'Additional transportation or handling',
];

const cancellationItems = [
  'Design work',
  'Site assessment',
  'Procurement',
  'Material ordering',
  'Custom manufacturing',
  'Approved third-party services',
];

const discountItems = [
  'Offers cannot be combined',
  'Discounts cannot be exchanged for cash',
  'Offers may have an expiry date',
  'The final quotation will reflect the applicable discount',
];

const quotationItems = [
  'Built-up area',
  'Structural requirements',
  'Floor plans and design',
  'Material brands and specifications',
  'Doors and windows',
  'Flooring selections',
  'Electrical and plumbing requirements',
  'Kitchen and bathroom specifications',
  'Site conditions',
  'Additional or customised work',
];

export default function PricingPoliciesPage() {
  const [activePackages, setActivePackages] = useState<Package[]>([]);
  const s1 = useRef<HTMLElement>(null);
  const s2 = useRef<HTMLElement>(null);
  const s3 = useRef<HTMLElement>(null);
  const s4 = useRef<HTMLElement>(null);
  const s5 = useRef<HTMLElement>(null);
  const s6 = useRef<HTMLElement>(null);
  const s7 = useRef<HTMLElement>(null);
  const s8 = useRef<HTMLElement>(null);
  const s9 = useRef<HTMLElement>(null);
  const s10 = useRef<HTMLElement>(null);
  const s11 = useRef<HTMLElement>(null);
  const s12 = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchPackages()
      .then((data) => setActivePackages(data.filter((p) => p.status === 'active')))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const refs = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('pricing-section--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    refs.forEach((r) => { if (r.current) observer.observe(r.current); });

    return () => observer.disconnect();
  }, []);

  const includedCategories = useMemo(() => {
    const seen = new Map<string, { id: string; title: string }>();
    for (const pkg of activePackages) {
      for (const spec of pkg.specs) {
        if (!seen.has(spec.category)) {
          seen.set(spec.category, {
            id: spec.category.toLowerCase().replace(/\s+/g, '_'),
            title: spec.category,
          });
        }
      }
    }
    return Array.from(seen.values());
  }, [activePackages]);

  return (
    <div className="pricing-policies-page">
      {/* ======================== HERO ======================== */}
      <section className="pricing-hero">
        <div className="section-container">
          <div className="pricing-hero-inner">
            <span className="pricing-eyebrow">Pricing Policies</span>
            <h1 className="pricing-hero-heading">
              Clear pricing.<br />
              Defined scope.<br />
              No surprises.
            </h1>
            <p className="pricing-hero-description">
              At Vijaya Siri, we believe construction pricing should be easy to
              understand. Package prices provide a starting point, while your final
              project cost is determined by the actual scope, specifications, site
              conditions and selections confirmed for your project.
            </p>
          </div>
        </div>
      </section>

      {/* ======================== SECTIONS ======================== */}
      <div className="pricing-sections">
        <div className="section-container">

          {/* 01 — Package Pricing */}
          <section className="pricing-section" ref={s1}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">01</span>
              <h2 className="pricing-section-title">Package Pricing</h2>
            </div>
            <div className="pricing-section-body">
              <p>Our published package rates are indicative per sq.ft. starting prices for the respective construction specifications.</p>
              <p>Current package rates may be displayed on the website for reference and can be revised from time to time.</p>
              <p>The applicable rate will be the rate confirmed in your project quotation.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 02 — Customised Quotations */}
          <section className="pricing-section" ref={s2}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">02</span>
              <h2 className="pricing-section-title">Customised Quotations</h2>
            </div>
            <div className="pricing-section-body">
              <p>Every home is different.</p>
              <p>Your final quotation may vary based on:</p>
              <ul className="pricing-list">
                {quotationItems.map((item) => (
                  <li key={item} className="pricing-list-item">{item}</li>
                ))}
              </ul>
              <p className="pricing-section-note">A package price is therefore not a guaranteed final project price until the scope has been reviewed and confirmed.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 03 — What's Included */}
          <section className="pricing-section" ref={s3}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">03</span>
              <h2 className="pricing-section-title">What's Included</h2>
            </div>
            <div className="pricing-section-body">
              <p>Each package has a defined scope of inclusions.</p>
              <p>The package comparison page provides the standard specifications for:</p>
              <div className="pricing-includes-grid">
                {includedCategories.map((cat) => (
                  <span key={cat.id} className="pricing-includes-item">{cat.title}</span>
                ))}
              </div>
              <p className="pricing-section-note">Any item not specifically mentioned in the confirmed quotation should be treated as excluded unless subsequently added in writing.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 04 — Scope Changes */}
          <section className="pricing-section" ref={s4}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">04</span>
              <h2 className="pricing-section-title">Scope Changes</h2>
            </div>
            <div className="pricing-section-body">
              <p>If you change the design, material, specification, quantity or scope after quotation approval, the project cost may change.</p>
              <p className="pricing-section-note">Any additional work will be:</p>
              <div className="pricing-scope-steps">
                {scopeChangeSteps.map((step, si) => (
                  <span key={step} className="pricing-scope-step">
                    <span className="pricing-scope-step-text">{step}</span>
                    {si < scopeChangeSteps.length - 1 && (
                      <svg className="pricing-scope-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    )}
                  </span>
                ))}
              </div>
              <p className="pricing-section-note">We aim to communicate the revised cost before proceeding with additional work.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 05 — Material & Brand Selection */}
          <section className="pricing-section" ref={s5}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">05</span>
              <h2 className="pricing-section-title">Material & Brand Selection</h2>
            </div>
            <div className="pricing-section-body">
              <p>Package specifications are based on the materials and brands stated in the quotation.</p>
              <p>Where a specific brand or product becomes unavailable, Vijaya Siri may propose an equivalent alternative of comparable specification, subject to customer approval.</p>
              <p>Any customer-requested upgrade or premium selection will be charged separately.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 06 — Site Conditions */}
          <section className="pricing-section" ref={s6}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">06</span>
              <h2 className="pricing-section-title">Site Conditions</h2>
            </div>
            <div className="pricing-section-body">
              <p>Pricing is based on the information available at the time of estimation.</p>
              <p>Unexpected site conditions such as:</p>
              <ul className="pricing-list">
                {siteConditionItems.map((item) => (
                  <li key={item} className="pricing-list-item">{item}</li>
                ))}
              </ul>
              <p className="pricing-section-note">may require additional work and cost. Such requirements will be communicated before execution wherever reasonably possible.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 07 — Taxes & Government Charges */}
          <section className="pricing-section" ref={s7}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">07</span>
              <h2 className="pricing-section-title">Taxes & Government Charges</h2>
            </div>
            <div className="pricing-section-body">
              <p>Applicable GST, government fees, statutory charges, approvals, permits or other third-party charges may be additional where applicable.</p>
              <p>The final quotation will clearly indicate applicable charges.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 08 — Quotation Validity */}
          <section className="pricing-section" ref={s8}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">08</span>
              <h2 className="pricing-section-title">Quotation Validity</h2>
            </div>
            <div className="pricing-section-body">
              <p>Material and labour costs may change over time.</p>
              <p>Each quotation will therefore have a specified validity period.</p>
              <p>After the validity period, Vijaya Siri may revise the quotation based on prevailing material, labour and service costs.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 09 — Payment */}
          <section className="pricing-section" ref={s9}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">09</span>
              <h2 className="pricing-section-title">Payment</h2>
            </div>
            <div className="pricing-section-body">
              <p>Project payments will follow the payment schedule specified in the approved quotation or agreement.</p>
              <p>Work stages may be linked to agreed payment milestones.</p>
              <p>Customers will receive the applicable payment details before each payment milestone.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 10 — Cancellation & Refunds */}
          <section className="pricing-section" ref={s10}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">10</span>
              <h2 className="pricing-section-title">Cancellation & Refunds</h2>
            </div>
            <div className="pricing-section-body">
              <p>Cancellation terms depend on the stage of the project.</p>
              <p>Amounts already committed towards:</p>
              <ul className="pricing-list">
                {cancellationItems.map((item) => (
                  <li key={item} className="pricing-list-item">{item}</li>
                ))}
              </ul>
              <p className="pricing-section-note">may be non-refundable where costs have already been incurred. Any eligible refund will be processed according to the applicable project agreement.</p>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 11 — Discounts & Offers */}
          <section className="pricing-section" ref={s11}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">11</span>
              <h2 className="pricing-section-title">Discounts & Offers</h2>
            </div>
            <div className="pricing-section-body">
              <p>Promotional offers, discounts and package benefits are subject to their respective terms.</p>
              <p>Unless specifically stated:</p>
              <ul className="pricing-list">
                {discountItems.map((item) => (
                  <li key={item} className="pricing-list-item">{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <div className="pricing-divider" />

          {/* 12 — Final Price */}
          <section className="pricing-section pricing-section--final" ref={s12}>
            <div className="pricing-section-header">
              <span className="pricing-section-number">12</span>
              <h2 className="pricing-section-title">Final Price</h2>
            </div>
            <div className="pricing-section-body">
              <p>The approved project quotation is the final reference for your project scope and pricing.</p>
              <p>Website package prices, examples and estimated rates are provided for guidance and should not be treated as a substitute for the confirmed project quotation.</p>
            </div>
          </section>

        </div>
      </div>

      {/* ======================== PACKAGE RATES ======================== */}
      <section className="pricing-rates">
        <div className="section-container">
          <div className="pricing-rates-inner">
            <span className="pricing-eyebrow">Current Indicative Rates</span>
            <div className="pricing-rates-grid">
              {activePackages.map((pkg) => (
                <div key={pkg._id} className="pricing-rate-card">
                  <span className="pricing-rate-name">{pkg.name}</span>
                  {pkg.pricePerSqFt > 0 && (
                    <span className="pricing-rate-value">
                      {'\u20B9'}{pkg.pricePerSqFt.toLocaleString('en-IN')}
                      <span className="pricing-rate-unit"> per sq.ft</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="pricing-rates-note">
              Rates shown are indicative starting prices. The applicable rate will be
              the rate confirmed in your project quotation.
            </p>
          </div>
        </div>
      </section>

      {/* ======================== PRICING PROMISE ======================== */}
      <section className="pricing-promise">
        <div className="section-container">
          <div className="pricing-promise-inner">
            <span className="pricing-eyebrow pricing-eyebrow--light">Our Pricing Promise</span>
            <p className="pricing-promise-statement">
              Transparent scope.<br />
              Clear specifications.<br />
              Defined pricing.<br />
              No unnecessary surprises.
            </p>
            <p className="pricing-promise-note">
              If something changes, we communicate it before proceeding.
            </p>
          </div>
        </div>
      </section>

      {/* ======================== FINAL NOTE ======================== */}
      <section className="pricing-final-note">
        <div className="section-container">
          <p className="pricing-final-note-text">
            Pricing and specifications may be updated from time to time based
            on material costs, availability, market conditions and service
            requirements. The latest approved quotation applicable to your
            project will prevail.
          </p>
        </div>
      </section>
    </div>
  );
}
