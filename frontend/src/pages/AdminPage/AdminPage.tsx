import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminShell.css';

type AdminGroupKey = 'pro-fix' | 'quick-fix' | 'marketing' | 'requests';

interface AdminNavItem {
  to: string;
  label: string;
}

interface AdminGroup {
  key: AdminGroupKey;
  label: string;
  base: string;
  items?: AdminNavItem[];
}

const ADMIN_GROUPS: AdminGroup[] = [
  {
    key: 'pro-fix',
    label: 'Pro Fix',
    base: '/admin/pro-fix',
    items: [
      { to: '/admin/pro-fix/services', label: 'Services' },
      { to: '/admin/pro-fix/categories', label: 'Categories' },
      { to: '/admin/pro-fix/banners', label: 'Banners' },
    ],
  },
  {
    key: 'quick-fix',
    label: 'Quick Fix',
    base: '/admin/quick-fix',
    items: [
      { to: '/admin/quick-fix/services', label: 'Services' },
      { to: '/admin/quick-fix/categories', label: 'Categories' },
      { to: '/admin/quick-fix/banners', label: 'Banners' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    base: '/admin/marketing',
    items: [
      { to: '/admin/marketing/statistics', label: 'Statistics' },
      { to: '/admin/marketing/discover-services', label: 'Discover Services' },
      { to: '/admin/marketing/offers', label: 'Offers' },
    ],
  },
  {
    key: 'requests',
    label: 'Requests',
    base: '/control-center/requests/quote',
  },
];

function isWithin(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`admin-nav-chevron${open ? ' admin-nav-chevron--open' : ''}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function AdminPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<AdminGroupKey, boolean>>(() => {
    const initial: Record<AdminGroupKey, boolean> = {
      'pro-fix': false,
      'quick-fix': false,
      marketing: false,
      requests: false,
    };
    ADMIN_GROUPS.forEach((group) => {
      if (isWithin(pathname, group.base)) initial[group.key] = true;
    });
    return initial;
  });

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next: Record<AdminGroupKey, boolean> = { ...prev };
      ADMIN_GROUPS.forEach((group) => {
        if (isWithin(pathname, group.base)) next[group.key] = true;
      });
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navOpen]);

  const toggleGroup = (key: AdminGroupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={`admin-shell section-container${navOpen ? ' admin-shell--nav-open' : ''}`}>
      <div className="admin-topbar">
        <button
          type="button"
          className="admin-topbar-menu-btn"
          onClick={() => setNavOpen(true)}
          aria-label="Open admin navigation"
          aria-expanded={navOpen}
        >
          <MenuIcon />
        </button>
        <span className="admin-topbar-title">Vijaya Siri Control Center</span>
      </div>

      <div className="admin-sidebar-backdrop" onClick={() => setNavOpen(false)} aria-hidden="true" />

      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <span className="admin-brand">
            <img src="/assests/brand/vijaya-siri-logo-header-transparent.svg" alt="Vijaya Siri" className="admin-logo" />
          </span>
          <span className="admin-brand-sub">Admin</span>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/site-control"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Site Control
          </NavLink>
          <NavLink
            to="/admin/projects"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Projects
          </NavLink>
          <NavLink
            to="/admin/packages"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Packages
          </NavLink>
          <NavLink
            to="/admin/estimator"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Estimator
          </NavLink>
          <NavLink
            to="/admin/locations"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Locations
          </NavLink>

          {ADMIN_GROUPS.map((group) => {
            if (!group.items || group.items.length === 0) {
              return (
                <NavLink
                  key={group.key}
                  to={group.base}
                  className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
                >
                  {group.label}
                </NavLink>
              );
            }
            const groupActive = isWithin(pathname, group.base);
            const open = expandedGroups[group.key];
            return (
              <div className="admin-nav-group" key={group.key}>
                <button
                  type="button"
                  className={`admin-nav-group-head${groupActive ? ' admin-nav-group-head--active' : ''}`}
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={open}
                >
                  <span>{group.label}</span>
                  <ChevronIcon open={open} />
                </button>
                {open && (
                  <div className="admin-nav-group-items">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `admin-nav-item admin-nav-item--child${isActive ? ' admin-nav-item--active' : ''}`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <NavLink
            to="/control-center/bookings"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Bookings
          </NavLink>
          <NavLink
            to="/control-center/customers"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Customers
          </NavLink>
          <NavLink
            to="/control-center/leads"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Leads
          </NavLink>
          <NavLink
            to="/control-center/notifications"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Notifications
          </NavLink>
          <NavLink
            to="/control-center/settings"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Settings
          </NavLink>
          <NavLink
            to="/control-center/profile"
            className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
          >
            Profile
          </NavLink>
        </nav>

        <div className="admin-sidebar-foot">
          <span className="admin-sidebar-version">Vijaya Siri &middot; V3.40 Control Center</span>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={() => { logout(); navigate('/admin/login'); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}