import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { SiteFeature } from '../data/siteControl';
import { getSiteControl, siteControlDefaults } from '../data/siteControl';

const LEGAL_PATHS = ['/pricing-policies', '/privacy-policy', '/disclaimers', '/terms'];

export function featureForPath(pathname: string): SiteFeature | null {
  if (pathname === '/') return 'home';
  if (pathname === '/projects') return 'projects';
  if (pathname.startsWith('/projects/')) {
    if (pathname === '/projects/compare-packages') return 'packages';
    return 'projects';
  }
  if (pathname === '/about') return 'about';
  if (pathname === '/quote') return 'quote';
  if (pathname === '/account') return 'account';
  if (pathname === '/offers') return 'offers';
  if (pathname === '/pro-fix' || pathname.startsWith('/pro-fix/')) return 'proFix';
  if (pathname === '/quick-fix' || pathname.startsWith('/quick-fix/')) return 'quickFix';
  return null;
}

export function isLegalPath(pathname: string): boolean {
  return LEGAL_PATHS.includes(pathname);
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

/**
 * Returns whether the current customer route is available, plus the resolved
 * feature for the current path. Unknown paths (no matching feature) are treated
 * as always available so they render their normal (possibly empty) page.
 */
export function useSiteControl(): {
  available: boolean;
  feature: SiteFeature | null;
  gated: boolean;
} {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (isAdminPath(pathname) || isLegalPath(pathname)) {
      return { available: true, feature: null, gated: false };
    }
    const feature = featureForPath(pathname);
    if (feature === null) {
      return { available: true, feature: null, gated: false };
    }
    const control = getSiteControl();
    const online = control.global === 'online';
    const enabled = control.pages[feature] !== false;
    return { available: online && enabled, feature, gated: true };
  }, [pathname]);
}

export function useIsFeatureEnabled(feature: SiteFeature): boolean {
  return useMemo(() => {
    const control = getSiteControl();
    if (control.global !== 'online') return false;
    const fallback = siteControlDefaults.pages[feature] !== false;
    return control.pages[feature] !== undefined ? control.pages[feature] : fallback;
  }, [feature]);
}
