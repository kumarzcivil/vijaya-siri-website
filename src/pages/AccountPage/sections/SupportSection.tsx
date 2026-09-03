import { Link } from 'react-router-dom';
import AccountSectionHeader from '../AccountSectionHeader';

const SUPPORT_PHONE = '+91 9008855088';

export default function SupportSection() {
  return (
    <div>
      <AccountSectionHeader
        eyebrow="We're here to help"
        title="Support"
        description="Reach our team for questions, quotes, or help with your bookings."
      />

      <div className="acc-support">
        <article className="acc-support-card">
          <span className="acc-support-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </span>
          <h3 className="acc-support-title">Call or WhatsApp</h3>
          <p className="acc-support-desc">
            Our team is available to help with quotes, bookings, and service questions.
          </p>
          <a className="acc-support-phone" href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>
            {SUPPORT_PHONE}
          </a>
        </article>

        <article className="acc-support-card">
          <span className="acc-support-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <h3 className="acc-support-title">Get a Quote</h3>
          <p className="acc-support-desc">
            Request a free quote for your construction or renovation project.
          </p>
          <Link className="acc-support-link" to="/quote">Start a Quote Request</Link>
        </article>

        <article className="acc-support-card">
          <span className="acc-support-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <h3 className="acc-support-title">Our Services</h3>
          <p className="acc-support-desc">
            Explore Pro Fix and Quick Fix services available in your location.
          </p>
          <div className="acc-support-links">
            <Link className="acc-support-link" to="/pro-fix">Pro Fix</Link>
            <Link className="acc-support-link" to="/quick-fix">Quick Fix</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
