import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLocation as useLocationContext } from '../../context/LocationContext';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import { useProFixSearch } from '../../hooks/useProFixSearch';
import { useQuickFixSearch } from '../../hooks/useQuickFixSearch';
import type { SiteFeature } from '../../data/siteControl';
import { getAvailableFeatureSet } from '../../data/siteControl';
import { useIsFeatureEnabled } from '../../hooks/useSiteControl';
import './MobileHeader.css';

const menuLinks: Array<{
  id: string;
  label: string;
  path: string;
  feature?: SiteFeature;
}> = [
  { id: 'home', label: 'Home', path: '/', feature: 'home' },
  { id: 'quick-fix', label: 'Quick Fix', path: '/quick-fix', feature: 'quickFix' },
  { id: 'pro-fix', label: 'Pro Fix', path: '/pro-fix', feature: 'proFix' },
  { id: 'projects', label: 'Projects', path: '/projects', feature: 'projects' },
  { id: 'offers', label: 'Offers', path: '/offers', feature: 'offers' },
  { id: 'bookings', label: 'My Bookings', path: '/bookings' },
];

function MenuLink({ link, onClick }: { link: typeof menuLinks[number]; onClick: () => void }) {
  const isActive = useActiveRoute(link.path);
  return (
    <Link
      to={link.path}
      className={`mobile-menu-link ${isActive ? 'mobile-menu-link--active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
    >
      {link.label}
    </Link>
  );
}

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const { selected, options, select } = useLocationContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isQuickFixContext = pathname === '/quick-fix' || pathname.startsWith('/quick-fix/');
  const [proFixQuery, setProFixQuery] = useProFixSearch();
  const [quickFixQuery, setQuickFixQuery] = useQuickFixSearch();
  const searchQuery = isQuickFixContext ? quickFixQuery : proFixQuery;
  const setSearchQuery = isQuickFixContext ? setQuickFixQuery : setProFixQuery;
  const searchPlaceholder = isQuickFixContext
    ? 'Search services, e.g. AC repair, RO service...'
    : 'Search Pro Fix services...';
  const searchAriaLabel = isQuickFixContext
    ? 'Search Quick Fix services'
    : 'Search Pro Fix services';
  const locRef = useRef<HTMLDivElement>(null);

  const availableFeatures = getAvailableFeatureSet();
  const quoteEnabled = useIsFeatureEnabled('quote');
  const visibleMenuLinks = menuLinks.filter(
    (link) => !link.feature || availableFeatures.has(link.feature)
  );

  useEffect(() => {
    if (!locOpen) return;
    const handle = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) {
        setLocOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [locOpen]);

  const handleLocSelect = (id: string) => {
    select(id);
    setLocOpen(false);
  };

  return (
    <header className="mobile-header">
      <div className="mobile-header-inner">
        {/* ROW 1 — Brand + utilities */}
        <div className="mobile-header-top">
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          <Link to="/" className="mobile-brand" aria-label="Vijaya Siri home">
            <img src="/assests/brand/vijaya-siri-logo-mobile-transparent.svg" alt="Vijaya Siri" className="mobile-logo" />
          </Link>

          <div className="mobile-header-actions">
            <button className="mobile-action-btn" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            {quoteEnabled && (
              <button className="mobile-action-btn" aria-label="Cart" onClick={() => navigate('/quote')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ROW 2 — Location + Search toolbar */}
        <div className="mobile-toolbar">
          <div className="mobile-loc-trigger" ref={locRef}>
            <button
              className="mobile-loc-btn"
              onClick={() => setLocOpen(!locOpen)}
              aria-label="Select location"
              aria-expanded={locOpen}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="mobile-loc-label">{selected.city}</span>
              <svg className="mobile-loc-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {locOpen && (
              <div className="mobile-loc-dropdown">
                <span className="mobile-loc-dropdown-title">Location</span>
                {options.map((loc) => (
                  <button
                    key={loc.id}
                    className={`mobile-loc-option ${loc.id === selected.id ? 'mobile-loc-option--active' : ''}`}
                    onClick={() => handleLocSelect(loc.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {loc.city}
                    {loc.id === selected.id && (
                      <svg className="mobile-loc-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-search-field">
            <svg className="mobile-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="mobile-search-input"
              type="text"
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {visibleMenuLinks.map((link) => (
            <MenuLink key={link.id} link={link} onClick={() => setMenuOpen(false)} />
          ))}
        </nav>
      )}
    </header>
  );
}
