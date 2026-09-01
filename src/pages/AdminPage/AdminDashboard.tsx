import { NavLink } from 'react-router-dom';
import './AdminShell.css';

const REQUEST_CARDS = [
  { label: 'Quote Requests', desc: 'Coming with hosting' },
  { label: 'Pro Fix Requests', desc: 'Coming with hosting' },
  { label: 'Quick Fix Requests', desc: 'Coming with hosting' },
];

const SHORTCUTS = [
  { to: '/admin/site-control', title: 'Site Control', desc: 'Control availability of customer pages and global maintenance mode.' },
  { to: '/admin/projects', title: 'Projects', desc: 'Manage featured projects and their display order.' },
  { to: '/admin/packages', title: 'Packages', desc: 'Manage construction packages, pricing and active state.' },
  { to: '/admin/pro-fix/services', title: 'Pro Fix', desc: 'Services, categories and banner promotions for the Pro Fix experience.' },
  { to: '/admin/quick-fix/services', title: 'Quick Fix', desc: 'Services, categories and banner promotions for the Quick Fix experience.' },
  { to: '/admin/marketing/statistics', title: 'Marketing', desc: 'Statistics and the Discover Services feed on the home page.' },
];

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function AdminDashboard() {
  return (
    <div className="admin-dash">
      <div className="admin-dash-header">
        <span className="admin-dash-eyebrow">Control Center</span>
        <h1 className="admin-dash-title">Vijaya Siri Admin</h1>
        <p className="admin-dash-subtitle">Manage your customer-facing content.</p>
      </div>

      <div className="admin-dash-grid">
        {SHORTCUTS.map((shortcut) => (
          <NavLink key={shortcut.to} to={shortcut.to} className="admin-dash-card">
            <span className="admin-dash-card-title">
              {shortcut.title}
              <span className="admin-dash-card-arrow">
                <ArrowIcon />
              </span>
            </span>
            <span className="admin-dash-card-desc">{shortcut.desc}</span>
          </NavLink>
        ))}
      </div>

      <div className="admin-dash-section">
        <h2 className="admin-dash-section-title">Requests</h2>
        <div className="admin-dash-grid">
          {REQUEST_CARDS.map((card) => (
            <div key={card.label} className="admin-dash-card admin-dash-card--request">
              <span className="admin-dash-card-title">
                {card.label}
              </span>
              <span className="admin-dash-card-count" aria-label="Request count">&mdash;</span>
              <span className="admin-dash-card-desc">{card.desc}</span>
              <span className="admin-dash-card-cta">View Requests &rarr;</span>
            </div>
          ))}
        </div>
      </div>

      <p className="admin-dash-note">
        Sections still under construction show a placeholder until they are enabled.
      </p>
    </div>
  );
}