import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useActiveRoute } from '../../hooks/useActiveRoute';
import type { SiteFeature } from '../../data/siteControl';
import { getAvailableFeatureSet } from '../../data/siteControl';
import './MobileNavigation.css';

const navItems: Array<{
  id: string;
  label: string;
  path: string;
  feature?: SiteFeature;
  icon: ReactNode;
}> = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    feature: 'home',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    feature: 'projects',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: 'pro-fix',
    label: 'Pro Fix',
    path: '/pro-fix',
    feature: 'proFix',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: 'quick-fix',
    label: 'Quick Fix',
    path: '/quick-fix',
    feature: 'quickFix',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Account',
    path: '/account',
    feature: 'account',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function NavItem({ item }: { item: typeof navItems[number] }) {
  const isActive = useActiveRoute(item.path);
  return (
    <Link
      to={item.path}
      className={`mobile-nav-item ${isActive ? 'mobile-nav-item--active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="mobile-nav-icon">{item.icon}</span>
      <span className="mobile-nav-label">{item.label}</span>
    </Link>
  );
}

export default function MobileNavigation() {
  const availableFeatures = getAvailableFeatureSet();
  const visibleNavItems = navItems.filter(
    (item) => !item.feature || availableFeatures.has(item.feature)
  );
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      {visibleNavItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </nav>
  );
}
