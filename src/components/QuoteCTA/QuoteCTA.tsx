import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon/Icon';
import './QuoteCTA.css';

const PHONE_TEL = 'tel:+919008855088';
const WHATSAPP = 'https://wa.me/919008855088';

export default function QuoteCTA() {
  const navigate = useNavigate();

  const handleGetQuote = useCallback(() => {
    navigate('/quote');
  }, [navigate]);

  return (
    <section className="quote-cta" id="quote-cta">
      <div className="section-container">
        <div className="quote-cta-inner">
          <div className="quote-cta-content">
            <div className="quote-cta-badge">
              <Icon name="phone" size={13} />
              Free Consultation
            </div>
            <h2 className="quote-cta-title">
              Ready to Build Your Dream Home?
            </h2>
            <p className="quote-cta-description">
              Get a free, no-obligation quote from our expert construction team.
              We'll help you plan, design and build your perfect home with transparent
              pricing and guaranteed timelines.
            </p>
            <div className="quote-cta-actions">
              <button className="quote-cta-btn quote-cta-btn--primary" onClick={handleGetQuote}>
                Get Free Quote
                <Icon name="arrow-right" size={18} />
              </button>
              <a href={PHONE_TEL} className="quote-cta-btn quote-cta-btn--secondary">
                <Icon name="phone" size={16} />
                <span className="phone-text">
                  <span className="phone-label">Call</span>
                  +91 90088 55088
                </span>
              </a>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="quote-cta-btn quote-cta-btn--whatsapp"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="phone-text">
                  <span className="phone-label">Chat on</span>
                  WhatsApp
                </span>
              </a>
            </div>
            <div className="quote-cta-trust">
              <div className="quote-trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                100% Free
              </div>
              <div className="quote-trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                No Obligation
              </div>
              <div className="quote-trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Quick Response
              </div>
            </div>
          </div>
          <div className="quote-cta-visual">
            <div className="quote-cta-image-placeholder">
              <div className="quote-visual-content">
                <div className="quote-visual-stat">
                  <span className="quote-visual-number">500+</span>
                  <span className="quote-visual-text">Happy Families</span>
                </div>
                <div className="quote-visual-divider" />
                <div className="quote-visual-stat">
                  <span className="quote-visual-number">4.8★</span>
                  <span className="quote-visual-text">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
