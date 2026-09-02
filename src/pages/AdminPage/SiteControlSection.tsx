import { useCallback, useEffect, useRef, useState } from 'react';
import type { SiteControl, SiteFeature } from '../../data/siteControl';
import {
  getSiteControl,
  updateSiteControlPages,
  updateSiteStatus,
  resetSiteControl,
} from '../../data/siteControl';
import type { SiteStatus } from '../../data/siteControl';
import type { CustomerService } from '../../data/locationServiceConfig';
import {
  getLocationServiceConfig,
  updateLocationAvailability,
  updateLoginRequired,
} from '../../data/locationServiceConfig';
import { locations } from '../../data/locations';
import AdminToggle from './AdminToggle';
import './AdminPage.css';
import './AdminShell.css';

const DEFAULT_TOAST_MS = 2600;

interface ToastState {
  message: string;
  isError: boolean;
}

interface PageRow {
  feature: SiteFeature;
  label: string;
  description: string;
}

interface PageGroup {
  id: string;
  title: string;
  rows: PageRow[];
}

const PAGE_GROUPS: PageGroup[] = [
  {
    id: 'main',
    title: 'Main',
    rows: [
      { feature: 'home', label: 'Home', description: 'The website home page.' },
      { feature: 'projects', label: 'Projects', description: 'Project listing and project detail pages.' },
      { feature: 'packages', label: 'Packages', description: 'The compare packages page.' },
    ],
  },
  {
    id: 'services',
    title: 'Services',
    rows: [
      { feature: 'proFix', label: 'Pro Fix', description: 'Pro Fix and all its child pages.' },
      { feature: 'quickFix', label: 'Quick Fix', description: 'Quick Fix and all its child pages.' },
    ],
  },
  {
    id: 'other',
    title: 'Other',
    rows: [
      { feature: 'about', label: 'About', description: 'The about page.' },
      { feature: 'quote', label: 'Quote / Contact', description: 'The quote form page.' },
      { feature: 'account', label: 'Account', description: 'The account page.' },
      { feature: 'offers', label: 'Offers', description: 'The offers page.' },
    ],
  },
];

const ALWAYS_ON = [
  { label: 'Legal Pages', note: 'Privacy, disclaimers, terms and pricing policies.' },
  { label: 'Admin', note: 'The admin control center can never be disabled.' },
];

const FEATURE_OFF_TEXTS: Record<SiteFeature, { title: string; body: string }> = {
  home: {
    title: 'Turn Off Home?',
    body: 'Customers will no longer be able to access the Home page.',
  },
  projects: {
    title: 'Turn Off Projects?',
    body: 'Customers will no longer be able to access Projects and project detail pages.',
  },
  packages: {
    title: 'Turn Off Packages?',
    body: 'Customers will no longer be able to access the Compare Packages page.',
  },
  proFix: {
    title: 'Turn Off Pro Fix?',
    body: 'Customers will no longer be able to access Pro Fix.',
  },
  quickFix: {
    title: 'Turn Off Quick Fix?',
    body: 'Customers will no longer be able to access Quick Fix.',
  },
  about: {
    title: 'Turn Off About?',
    body: 'Customers will no longer be able to access the About page.',
  },
  quote: {
    title: 'Turn Off Quote / Contact?',
    body: 'Customers will no longer be able to access the quote form.',
  },
  account: {
    title: 'Turn Off Account?',
    body: 'Customers will no longer be able to access the Account page.',
  },
  offers: {
    title: 'Turn Off Offers?',
    body: 'Customers will no longer be able to access the Offers page.',
  },
};

export default function SiteControlSection() {
  const [control, setControl] = useState<SiteControl>(() => getSiteControl());
  const [serviceConfig, setServiceConfig] = useState(() => getLocationServiceConfig());
  const [toggleOffFeature, setToggleOffFeature] = useState<SiteFeature | null>(null);
  const [maintenanceConfirm, setMaintenanceConfirm] = useState(false);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimer = useRef<number | null>(null);
  const resetTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, isError });
    toastTimer.current = window.setTimeout(() => setToast(null), DEFAULT_TOAST_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  useEffect(() => {
    if (toggleOffFeature === null && !maintenanceConfirm && !emergencyConfirm && !resetConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setToggleOffFeature(null);
      setMaintenanceConfirm(false);
      setEmergencyConfirm(false);
      setResetConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleOffFeature, maintenanceConfirm, emergencyConfirm, resetConfirm]);

  const handleToggleRequest = useCallback((feature: SiteFeature, current: boolean, global: SiteStatus) => {
    if (current) {
      setToggleOffFeature(feature);
      return;
    }
    if (global !== 'online') return;
    setControl(updateSiteControlPages({ [feature]: true }));
    showToast(`${FEATURE_OFF_TEXTS[feature].title.replace('Turn Off ', '').replace('?', '')} is now available`);
  }, [showToast]);

  const handleConfirmToggleOff = useCallback(() => {
    if (toggleOffFeature === null) return;
    setControl(updateSiteControlPages({ [toggleOffFeature]: false }));
    setToggleOffFeature(null);
    showToast('Page is now unavailable to customers');
  }, [toggleOffFeature, showToast]);

  const handleMaintenanceRequest = useCallback(() => {
    if (control.global === 'maintenance') {
      setMaintenanceConfirm(false);
      setControl(updateSiteStatus('online'));
      showToast('Website is back online');
      return;
    }
    setMaintenanceConfirm(true);
  }, [control.global, showToast]);

  const handleConfirmMaintenance = useCallback(() => {
    setMaintenanceConfirm(false);
    if (!emergencyConfirm) return;
    setEmergencyConfirm(false);
    setControl(updateSiteStatus('maintenance'));
    showToast('Website is now in maintenance mode');
  }, [emergencyConfirm, showToast]);

  const handleResetClick = useCallback(() => {
    if (!resetConfirm) {
      setResetConfirm(true);
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setResetConfirm(false), 4000);
      return;
    }
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    setResetConfirm(false);
    setControl(resetSiteControl());
    showToast('Site Control restored to defaults');
  }, [resetConfirm, showToast]);

  const handleLocationAvailability = useCallback((locationId: string, service: CustomerService, active: boolean) => {
    setServiceConfig(updateLocationAvailability(locationId, service, active));
    const serviceLabel = service === 'quickFix' ? 'Quick Fix' : 'Pro Fix';
    showToast(`${serviceLabel} is now ${active ? 'available' : 'unavailable'} for this location`);
  }, [showToast]);

  const handleLoginRequired = useCallback((service: CustomerService, active: boolean) => {
    setServiceConfig(updateLoginRequired(service, active));
    const serviceLabel = service === 'quickFix' ? 'Quick Fix' : 'Pro Fix';
    showToast(`Customer login is now ${active ? 'required' : 'not required'} for ${serviceLabel}`);
  }, [showToast]);

  const globalOnline = control.global === 'online';
  const anyOff = Object.values(control.pages).some((v) => v === false);

  return (
    <div className="admin-page admin-page--site-control">
      <div className="admin-header">
        <h1 className="admin-title">Site Control</h1>
        <p className="admin-subtitle">
          Control availability of customer-facing pages. Turning a page off does not delete or
          change any of its services, categories, banners or content — it only hides the customer
          experience.
        </p>
        <div className="admin-actions">
          <button
            className="admin-btn admin-btn--reset"
            onClick={handleResetClick}
            type="button"
          >
            {resetConfirm ? 'Confirm reset?' : 'Reset to Defaults'}
          </button>
        </div>
      </div>

      {/* GLOBAL SITE STATUS */}
      <div className="admin-section admin-section--primary">
        <div
          className={`sc-global-card${globalOnline ? ' sc-global-card--online' : ' sc-global-card--maintenance'}`}
        >
          <div className="sc-global-info">
            <h2 className="sc-global-title">Global Site Status</h2>
            <p className="sc-global-desc">
              {globalOnline
                ? 'The customer website is live and available.'
                : 'The customer website is in maintenance mode. Customers see the unavailable page.'}
            </p>
            {globalOnline && anyOff && (
              <p className="sc-global-note">
                Note: some pages are currently turned off below.
              </p>
            )}
          </div>
          <button
            className={`admin-btn sc-global-btn${globalOnline ? ' admin-btn--reset' : ' admin-btn--save'}`}
            onClick={handleMaintenanceRequest}
            type="button"
          >
            {globalOnline ? 'Enable Maintenance' : 'Back Online'}
          </button>
        </div>
      </div>

      {/* PAGE GROUPS */}
      {PAGE_GROUPS.map((group) => (
        <div className="admin-section" key={group.id}>
          <div className="sc-group">
            {group.rows.map((row) => {
              const enabled = control.pages[row.feature] !== false;
              return (
                <div key={row.feature} className="sc-row">
                  <div className="sc-row-info">
                    <span className="sc-row-label">{row.label}</span>
                    <span className="sc-row-desc">{row.description}</span>
                  </div>
                  <span className={`admin-featured-badge ${enabled ? 'admin-featured-badge--on' : ''}`}>
                    {enabled ? 'On' : 'Off'}
                  </span>
                  <AdminToggle
                    active={enabled}
                    onClick={() => handleToggleRequest(row.feature, enabled, control.global)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* LOCATION & SERVICE ACCESS */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Location &amp; Service Access</h2>
          <p className="admin-section-desc">
            Control which services customers can use in each location. A service that is
            unavailable for a location is hidden and protected from direct URL access for
            customers in that location.
          </p>
        </div>

        <div className="sc-group">
          {locations.map((loc) => {
            const availability = serviceConfig.locations[loc.id] ?? { quickFix: false, proFix: false };
            return (
              <div key={loc.id} className="sc-row sc-row--location">
                <div className="sc-row-info">
                  <span className="sc-row-label">{loc.label}</span>
                  <span className="sc-row-desc">
                    Quick Fix
                    <span className="admin-featured-badge admin-featured-badge--loc">
                      {availability.quickFix ? 'On' : 'Off'}
                    </span>
                    <span className="sc-row-desc-sep" aria-hidden="true">·</span>
                    Pro Fix
                    <span className={`admin-featured-badge admin-featured-badge--loc${availability.proFix ? ' admin-featured-badge--on' : ''}`}>
                      {availability.proFix ? 'On' : 'Off'}
                    </span>
                  </span>
                </div>
                <span className="sc-location-toggle-label">Quick Fix</span>
                <AdminToggle
                  active={availability.quickFix}
                  onClick={() =>
                    handleLocationAvailability(loc.id, 'quickFix', !availability.quickFix)
                  }
                />
                <span className="sc-location-toggle-label">Pro Fix</span>
                <AdminToggle
                  active={availability.proFix}
                  onClick={() => handleLocationAvailability(loc.id, 'proFix', !availability.proFix)}
                />
              </div>
            );
          })}
        </div>

        <div className="sc-group sc-group--access">
          <h3 className="sc-access-title">Customer Access</h3>
          <div className="sc-row">
            <div className="sc-row-info">
              <span className="sc-row-label">Quick Fix Login Required</span>
              <span className="sc-row-desc">
                When on, customers must sign in before using Quick Fix.
              </span>
            </div>
            <span className={`admin-featured-badge${serviceConfig.quickFixLoginRequired ? ' admin-featured-badge--on' : ''}`}>
              {serviceConfig.quickFixLoginRequired ? 'On' : 'Off'}
            </span>
            <AdminToggle
              active={serviceConfig.quickFixLoginRequired}
              onClick={() => handleLoginRequired('quickFix', !serviceConfig.quickFixLoginRequired)}
            />
          </div>
          <div className="sc-row">
            <div className="sc-row-info">
              <span className="sc-row-label">Pro Fix Login Required</span>
              <span className="sc-row-desc">
                When on, customers must sign in before using Pro Fix.
              </span>
            </div>
            <span className={`admin-featured-badge${serviceConfig.proFixLoginRequired ? ' admin-featured-badge--on' : ''}`}>
              {serviceConfig.proFixLoginRequired ? 'On' : 'Off'}
            </span>
            <AdminToggle
              active={serviceConfig.proFixLoginRequired}
              onClick={() => handleLoginRequired('proFix', !serviceConfig.proFixLoginRequired)}
            />
          </div>
        </div>

        <div className="sc-summary">
          <h3 className="sc-summary-title">Service Availability</h3>
          <div className="sc-summary-table">
            <div className="sc-summary-head">
              <span>Location</span>
              <span>Quick Fix</span>
              <span>Pro Fix</span>
              <span>Customer Login</span>
            </div>
            {locations.map((loc) => {
              const availability = serviceConfig.locations[loc.id] ?? { quickFix: false, proFix: false };
              const loginRequired =
                availability.quickFix || availability.proFix
                  ? (availability.quickFix && serviceConfig.quickFixLoginRequired) ||
                    (availability.proFix && serviceConfig.proFixLoginRequired)
                  : false;
              return (
                <div className="sc-summary-row" key={loc.id}>
                  <span className="sc-summary-location">{loc.label}</span>
                  <span className={availability.quickFix ? 'sc-summary-on' : 'sc-summary-off'}>
                    {availability.quickFix ? 'On' : 'Off'}
                  </span>
                  <span className={availability.proFix ? 'sc-summary-on' : 'sc-summary-off'}>
                    {availability.proFix ? 'On' : 'Off'}
                  </span>
                  <span className={loginRequired ? 'sc-summary-on' : 'sc-summary-off'}>
                    {loginRequired ? 'Required' : 'Not required'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ALWAYS ON */}
      <div className="admin-section">
        <div className="sc-group sc-group--locked">
          {ALWAYS_ON.map((item) => (
            <div key={item.label} className="sc-row sc-row--locked">
              <div className="sc-row-info">
                <span className="sc-row-label">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="sc-lock-icon"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {item.label}
                </span>
                <span className="sc-row-desc">{item.note}</span>
              </div>
              <span className="admin-featured-badge admin-featured-badge--on">Locked On</span>
            </div>
          ))}
        </div>
      </div>

      {/* TOGGLE OFF CONFIRMATION */}
      {toggleOffFeature && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setToggleOffFeature(null)}
          role="presentation"
        >
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label={FEATURE_OFF_TEXTS[toggleOffFeature].title}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">{FEATURE_OFF_TEXTS[toggleOffFeature].title}</h3>
            <p className="admin-modal-text">
              {FEATURE_OFF_TEXTS[toggleOffFeature].body}
              <span>
                Your services, categories and banners will not be deleted or changed.
              </span>
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn--cancel"
                onClick={() => setToggleOffFeature(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleConfirmToggleOff}
                type="button"
              >
                Turn Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MAINTENANCE CONFIRMATION */}
      {maintenanceConfirm && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setMaintenanceConfirm(false);
            setEmergencyConfirm(false);
          }}
          role="presentation"
        >
          <div
            className="admin-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Enable maintenance mode"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin-modal-title">Enable Maintenance Mode?</h3>
            <p className="admin-modal-text">
              This will make the customer website unavailable.
              <span>Admin and legal pages will remain accessible.</span>
            </p>
            <label className="sc-confirm-check">
              <input
                type="checkbox"
                checked={emergencyConfirm}
                onChange={(e) => setEmergencyConfirm(e.target.checked)}
              />
              <span>I understand and want to enable maintenance mode.</span>
            </label>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn--cancel"
                onClick={() => {
                  setMaintenanceConfirm(false);
                  setEmergencyConfirm(false);
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--danger"
                onClick={handleConfirmMaintenance}
                type="button"
                disabled={!emergencyConfirm}
              >
                Enable Maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-toast${toast.isError ? ' admin-toast--error' : ''}`} role="status">
          <span className="admin-toast-dot" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
