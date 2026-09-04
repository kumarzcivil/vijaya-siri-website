import { Link, useLocation } from 'react-router-dom';
import { useLocation as useLocationContext } from '../../context/LocationContext';
import { getAvailableFeatureSet } from '../../data/siteControl';
import { getLocationContact, getDefaultLocationContact } from '../../data/locationContacts';
import './Footer.css';

export default function Footer() {
  const location = useLocation();
  const available = getAvailableFeatureSet();
  const { selected } = useLocationContext();
  const contact = getLocationContact(selected.id);
  const defaultContact = getDefaultLocationContact();

  const address = contact.displayAddress || defaultContact.displayAddress;
  const phone = contact.phone || defaultContact.phone;
  const phoneTel = contact.phoneTel || defaultContact.phoneTel;
  const email = contact.email;
  const whatsapp = contact.whatsapp;
  const mapUrl = contact.mapUrl;

  const handleAboutClick = () => {
    if (location.pathname === '/about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePricingClick = () => {
    if (location.pathname === '/pricing-policies') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrivacyClick = () => {
    if (location.pathname === '/privacy-policy') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDisclaimersClick = () => {
    if (location.pathname === '/disclaimers') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTermsClick = () => {
    if (location.pathname === '/terms') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="section-container">
        <div className="footer-main">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo" aria-label="Vijaya Siri home">
                <img src="/assests/brand/vijaya-siri-logo-footer-dark-transparent.svg" alt="Vijaya Siri" className="footer-logo-img" />
              </Link>
              <p className="footer-tagline">
                Building dream homes with trust, quality craftsmanship
                and transparent service across Siruguppa, Adoni and Sindhanur.
              </p>
              <div className="footer-social">
                <span className="footer-social-link" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </span>
                <span className="footer-social-link" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </span>
                <span className="footer-social-link" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white" />
                  </svg>
                </span>
              </div>
            </div>

            {available.has('projects') && (
              <div className="footer-links-group">
                <h4 className="footer-group-title">Services</h4>
                <ul className="footer-links">
                  <li><Link to="/projects" className="footer-link">Residential Construction</Link></li>
                  <li><Link to="/projects" className="footer-link">Home Renovation</Link></li>
                  <li><Link to="/projects" className="footer-link">Interior Design</Link></li>
                  <li><Link to="/projects" className="footer-link">Commercial Building</Link></li>
                  <li><Link to="/projects" className="footer-link">Civil Works</Link></li>
                </ul>
              </div>
            )}

            <div className="footer-links-group">
              <h4 className="footer-group-title">Customer</h4>
              <ul className="footer-links">
                {available.has('projects') && (
                  <>
                    <li><Link to="/projects" className="footer-link">Browse Projects</Link></li>
                    {available.has('quote') && (
                      <li><Link to="/quote" className="footer-link">Get a Quote</Link></li>
                    )}
                    <li><Link to="/projects" className="footer-link">Track Project</Link></li>
                  </>
                )}
                <li><Link to="/bookings" className="footer-link">My Bookings</Link></li>
                {available.has('account') && (
                  <li><Link to="/account" className="footer-link">My Account</Link></li>
                )}
              </ul>
            </div>

            <div className="footer-links-group footer-mobile-hidden">
              <h4 className="footer-group-title">Vijaya Siri</h4>
              <ul className="footer-links">
                {available.has('about') && (
                  <li><Link to="/about" className="footer-link" onClick={handleAboutClick}>About</Link></li>
                )}
                <li><Link to="/pricing-policies" className="footer-link" onClick={handlePricingClick}>Pricing Policies</Link></li>
                <li><a href="#" className="footer-link">Careers</a></li>
              </ul>
            </div>

            <div className="footer-contact footer-mobile-hidden">
              <h4 className="footer-group-title">Contact Us</h4>
              <div className="footer-contact-items">
                {address && (
                  <div className="footer-contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {mapUrl ? (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
                        {address}
                      </a>
                    ) : (
                      <span>{address}</span>
                    )}
                  </div>
                )}
                {phone && phoneTel && (
                  <div className="footer-contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <a href={phoneTel} className="footer-link">{phone}</a>
                  </div>
                )}
                {email && (
                  <div className="footer-contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <a href={`mailto:${email}`} className="footer-link">{email}</a>
                  </div>
                )}
                {whatsapp && (
                  <div className="footer-contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="footer-link">
                      {phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Vijaya Siri Construction. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/about" className="footer-bottom-link footer-mobile-only" onClick={handleAboutClick}>About</Link>
            {phoneTel && (
              <a href={phoneTel} className="footer-bottom-link footer-mobile-only">Contact</a>
            )}
            <Link to="/privacy-policy" className="footer-bottom-link" onClick={handlePrivacyClick}>Privacy Policy</Link>
            <Link to="/disclaimers" className="footer-bottom-link" onClick={handleDisclaimersClick}>Disclaimers</Link>
            <Link to="/terms" className="footer-bottom-link" onClick={handleTermsClick}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
