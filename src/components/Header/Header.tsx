import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from '../../context/LocationContext';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import type { SiteFeature } from '../../data/siteControl';
import { getAvailableFeatureSet } from '../../data/siteControl';
import './Header.css';

const navItems: Array<{ id: string; label: string; path: string; feature?: SiteFeature }> = [
  { id: 'home', label: 'Home', path: '/', feature: 'home' },
  { id: 'quick-fix', label: 'Quick Fix', path: '/quick-fix', feature: 'quickFix' },
  { id: 'pro-fix', label: 'Pro Fix', path: '/pro-fix', feature: 'proFix' },
  { id: 'projects', label: 'Projects', path: '/projects', feature: 'projects' },
  { id: 'offers', label: 'Offers', path: '/offers', feature: 'offers' },
];

function NavLink({ item }: { item: typeof navItems[number] }) {
  const isActive = useActiveRoute(item.path);
  return (
    <Link
      to={item.path}
      className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );
}

export default function Header() {
  const [locationOpen, setLocationOpen] = useState(false);
  const { selected, options, select } = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!locationOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [locationOpen]);

  const handleLocationSelect = (id: string) => {
    select(id);
    setLocationOpen(false);
  };

  const availableFeatures = getAvailableFeatureSet();
  const visibleNavItems = navItems.filter(
    (item) => !item.feature || availableFeatures.has(item.feature)
  );

  return (
    <header className="header">
      <div className="header-inner section-container">
        <div className="header-left">
          <Link to="/" className="header-brand" aria-label="Vijaya Siri home">
            <img src="/assests/brand/vijaya-siri-logo-header-transparent.svg" alt="Vijaya Siri" className="header-logo" />
          </Link>

          <span className="header-divider" />

          <div className="location-selector-wrap" ref={dropdownRef}>
            <button
              className="location-selector"
              onClick={() => setLocationOpen(!locationOpen)}
              aria-label="Select location"
              aria-expanded={locationOpen}
            >
              <svg className="location-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="location-text">{selected.city}</span>
              <svg className={`location-chevron ${locationOpen ? 'location-chevron--open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {locationOpen && (
              <div className="location-dropdown">
                {options.map((loc) => (
                  <button
                    key={loc.id}
                    className={`location-option ${loc.id === selected.id ? 'location-option--active' : ''}`}
                    onClick={() => handleLocationSelect(loc.id)}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="header-nav" aria-label="Main navigation">
          {visibleNavItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>

        <div className="header-right">
          <button className="header-icon-btn" aria-label="Notifications">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <Link to="/bookings" className="header-icon-btn header-bookings-btn" aria-label="My Bookings">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="header-bookings-label">My Bookings</span>
          </Link>

          <span className="header-divider" />

          <button className="header-icon-btn header-account-btn" aria-label="Account">
            <div className="header-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
