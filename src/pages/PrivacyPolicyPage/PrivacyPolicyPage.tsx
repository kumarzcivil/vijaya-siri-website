import { useEffect, useRef } from 'react';
import './PrivacyPolicyPage.css';

const LAST_UPDATED = 'August 2026';

const collectCategories = [
  {
    title: 'Contact Information',
    items: ['Name', 'Phone number', 'Email address', 'Communication preferences'],
  },
  {
    title: 'Project / Service Information',
    items: [
      'Property or project location',
      'Approximate project requirements',
      'Construction or renovation requirements',
      'Budget information voluntarily provided',
      'Preferred package/service',
      'Enquiry details',
    ],
  },
  {
    title: 'Account / Transaction Information',
    items: [
      'Account details',
      'Booking information',
      'Quotation information',
      'Transaction-related information',
    ],
  },
  {
    title: 'Technical Information',
    items: [
      'Device/browser information',
      'IP address',
      'Website interaction information',
      'Cookies',
      'Analytics information',
    ],
  },
];

const howWeCollect = [
  'Submit an enquiry',
  'Request a quotation',
  'Contact us',
  'Submit a form',
  'Create or use an account, where available',
  'Make a booking, where available',
  'Communicate with our team',
  'Interact with the website',
  'Use website features that require information',
  'Give information through authorised service interactions',
];

const howWeUse = [
  'Responding to enquiries',
  'Providing quotations',
  'Understanding project requirements',
  'Providing requested services',
  'Managing bookings or service requests',
  'Communicating project or service updates',
  'Improving customer experience',
  'Improving website functionality',
  'Processing transactions where applicable',
  'Maintaining business records',
  'Preventing fraud or misuse',
  'Meeting legal or regulatory requirements',
  'Responding to complaints or support requests',
];

const whoWeShareWith = [
  'Service providers supporting our operations',
  'Technology and hosting providers',
  'Communication providers',
  'Payment providers, where applicable',
  'Professional advisors where necessary',
  'Government or regulatory authorities where legally required',
  'Other parties where required to provide a requested service and permitted by law',
];

const userRights = [
  'Request information about how their data is being processed',
  'Request correction of inaccurate information',
  'Request deletion where applicable',
  'Withdraw consent where consent is the basis for processing',
  'Raise a privacy-related grievance',
  'Exercise other rights available under applicable law',
];

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('.privacy-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('privacy-section--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="privacy-policies-page">
      {/* ======================== HERO ======================== */}
      <section className="privacy-hero">
        <div className="section-container">
          <div className="privacy-hero-inner">
            <span className="privacy-eyebrow">Privacy Policy</span>
            <h1 className="privacy-hero-heading">Your privacy matters.</h1>
            <p className="privacy-hero-description">
              Vijaya Siri respects your privacy and is committed to handling your
              personal information responsibly, transparently and only for
              legitimate purposes connected with our services and your experience
              with us.
            </p>
            <span className="privacy-hero-date">Last updated: {LAST_UPDATED}</span>
          </div>
        </div>
      </section>

      {/* ======================== SECTIONS ======================== */}
      <div className="privacy-sections" ref={containerRef}>
        <div className="section-container">

          {/* 01 — Our Commitment */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">01</span>
              <h2 className="privacy-section-title">Our Commitment</h2>
            </div>
            <div className="privacy-section-body">
              <p>Vijaya Siri is committed to protecting the personal information shared with us through our website, forms, enquiries, applications and services.</p>
              <p>This Privacy Policy explains what information we may collect, why we collect it, how we use it, when it may be shared and the choices available to you.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 02 — Information We Collect */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">02</span>
              <h2 className="privacy-section-title">Information We Collect</h2>
            </div>
            <div className="privacy-section-body">
              <p>Depending on how you interact with Vijaya Siri, we may collect information such as:</p>
              {collectCategories.map((cat) => (
                <div key={cat.title} className="privacy-subcategory">
                  <h3 className="privacy-subcategory-title">{cat.title}</h3>
                  <ul className="privacy-list">
                    {cat.items.map((item) => (
                      <li key={item} className="privacy-list-item">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 03 — How We Collect Information */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">03</span>
              <h2 className="privacy-section-title">How We Collect Information</h2>
            </div>
            <div className="privacy-section-body">
              <p>Information may be collected when you:</p>
              <ul className="privacy-list">
                {howWeCollect.map((item) => (
                  <li key={item} className="privacy-list-item">{item}</li>
                ))}
              </ul>
              <p className="privacy-section-note">We may also receive information from authorised service partners where legally permitted and where appropriate consent or authority exists.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 04 — How We Use Your Information */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">04</span>
              <h2 className="privacy-section-title">How We Use Your Information</h2>
            </div>
            <div className="privacy-section-body">
              <p>Use cases may include:</p>
              <ul className="privacy-list">
                {howWeUse.map((item) => (
                  <li key={item} className="privacy-list-item">{item}</li>
                ))}
              </ul>
              <p className="privacy-section-note">Personal information should not be used for purposes incompatible with the purpose for which it was collected.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 05 — Your Consent */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">05</span>
              <h2 className="privacy-section-title">Your Consent</h2>
            </div>
            <div className="privacy-section-body">
              <p>Where consent is required, Vijaya Siri will seek it through a clear and understandable notice and affirmative action.</p>
              <p>You may withdraw consent where consent is the basis for processing, subject to applicable law and any consequences that may result from withdrawal.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 06 — Marketing Communications */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">06</span>
              <h2 className="privacy-section-title">Marketing Communications</h2>
            </div>
            <div className="privacy-section-body">
              <p>Where we send promotional communications, we will provide appropriate options to manage or opt out of such communications.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 07 — When Information May Be Shared */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">07</span>
              <h2 className="privacy-section-title">When Information May Be Shared</h2>
            </div>
            <div className="privacy-section-body">
              <p>Vijaya Siri may share information where necessary with:</p>
              <ul className="privacy-list">
                {whoWeShareWith.map((item) => (
                  <li key={item} className="privacy-list-item">{item}</li>
                ))}
              </ul>
              <p className="privacy-section-note">Any service provider receiving personal information should only receive information necessary for the relevant purpose.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 08 — How We Protect Your Information */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">08</span>
              <h2 className="privacy-section-title">How We Protect Your Information</h2>
            </div>
            <div className="privacy-section-body">
              <p>We take reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse, alteration or disclosure.</p>
              <p className="privacy-section-note">No method of transmitting or storing information can be guaranteed to be completely secure. We therefore cannot promise absolute security.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 09 — How Long We Keep Information */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">09</span>
              <h2 className="privacy-section-title">How Long We Keep Information</h2>
            </div>
            <div className="privacy-section-body">
              <p>We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, to provide services, maintain legitimate business records, comply with legal requirements, resolve disputes, prevent misuse or otherwise meet applicable obligations.</p>
              <p className="privacy-section-note">Retention periods may depend on purpose, business relationship, legal requirements, accounting or tax requirements, dispute resolution, and security or fraud prevention.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 10 — Your Choices & Rights */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">10</span>
              <h2 className="privacy-section-title">Your Choices & Rights</h2>
            </div>
            <div className="privacy-section-body">
              <p>Subject to applicable law, users may have rights relating to their personal information, including:</p>
              <ul className="privacy-list">
                {userRights.map((item) => (
                  <li key={item} className="privacy-list-item">{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 11 — Keeping Your Information Accurate */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">11</span>
              <h2 className="privacy-section-title">Keeping Your Information Accurate</h2>
            </div>
            <div className="privacy-section-body">
              <p>Please help us keep your information accurate and up to date. If your contact or other relevant information changes, you may contact us to request an update.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 12 — Cookies & Similar Technologies */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">12</span>
              <h2 className="privacy-section-title">Cookies & Similar Technologies</h2>
            </div>
            <div className="privacy-section-body">
              <p>We may use cookies and similar technologies to support essential website functionality, understand website usage, improve performance and, where applicable, measure the effectiveness of our services and communications.</p>
              <p>Where applicable, you can manage cookies through your browser or device settings.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 13 — Children's Privacy */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">13</span>
              <h2 className="privacy-section-title">Children's Privacy</h2>
            </div>
            <div className="privacy-section-body">
              <p>Our website and services are not intended to knowingly collect personal information from children in circumstances where applicable law requires parental or guardian involvement.</p>
              <p>If you believe information relating to a child has been provided to us improperly, please contact us so that we can review the matter.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 14 — Third-Party Websites & Services */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">14</span>
              <h2 className="privacy-section-title">Third-Party Websites & Services</h2>
            </div>
            <div className="privacy-section-body">
              <p>Our website may contain links or integrations to third-party websites or services.</p>
              <p>Their privacy practices are governed by their own policies. Vijaya Siri is not responsible for the privacy practices of third-party websites that we do not control.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 15 — Security Incidents */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">15</span>
              <h2 className="privacy-section-title">Security Incidents</h2>
            </div>
            <div className="privacy-section-body">
              <p>If we become aware of a personal-data security incident affecting information handled by us, we will take appropriate steps in accordance with applicable law and our incident-response procedures.</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 16 — Changes to This Privacy Policy */}
          <section className="privacy-section">
            <div className="privacy-section-header">
              <span className="privacy-section-number">16</span>
              <h2 className="privacy-section-title">Changes to This Privacy Policy</h2>
            </div>
            <div className="privacy-section-body">
              <p>We may update this Privacy Policy from time to time to reflect changes in our services, technology, business practices or applicable legal requirements.</p>
              <p>When appropriate, material changes will be communicated through the website or other suitable means.</p>
              <p>The latest version will be published on this page with its updated date.</p>
              <p className="privacy-section-note">Last updated: {LAST_UPDATED}</p>
            </div>
          </section>

          <div className="privacy-divider" />

          {/* 17 — Questions About Your Privacy? */}
          <section className="privacy-section privacy-section--final">
            <div className="privacy-section-header">
              <span className="privacy-section-number">17</span>
              <h2 className="privacy-section-title">Questions About Your Privacy?</h2>
            </div>
            <div className="privacy-section-body">
              <p>If you have questions or concerns about this Privacy Policy or how your personal information is handled, please contact Vijaya Siri through the official contact details provided on our website.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
