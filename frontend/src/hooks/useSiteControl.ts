import { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { SiteFeature } from '../data/siteControl';
import { getSiteControl, siteControlDefaults, loadSiteControlFromAPI, SITE_FEATURES } from '../data/siteControl';

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
  isMaintenance: boolean;
} {
  const { pathname } = useLocation();
  const [, setTick] = useState(0);

  useEffect(() => {
    loadSiteControlFromAPI().then(() => setTick((t) => t + 1));
  }, []);

  return useMemo(() => {
    if (isAdminPath(pathname) || isLegalPath(pathname)) {
      return { available: true, feature: null, gated: false, isMaintenance: false };
    }
    const feature = featureForPath(pathname);
    if (feature === null) {
      return { available: true, feature: null, gated: false, isMaintenance: false };
    }
    const control = getSiteControl();
    const isMaintenance = control.global !== 'online';
    const enabled = control.pages[feature] !== false;
    return { available: !isMaintenance && enabled, feature, gated: true, isMaintenance };
  }, [pathname, setTick]);
}

export function useIsFeatureEnabled(feature: SiteFeature): boolean {
  const [, setTick] = useState(0);

  useEffect(() => {
    loadSiteControlFromAPI().then(() => setTick((t) => t + 1));
  }, []);

  return useMemo(() => {
    const control = getSiteControl();
    if (control.global !== 'online') return false;
    const fallback = siteControlDefaults.pages[feature] !== false;
    return control.pages[feature] !== undefined ? control.pages[feature] : fallback;
  }, [feature, setTick]);
}

/**
 * Returns the current set of available features, reactive to API updates.
 * Use this instead of getAvailableFeatureSet() in components that need
 * to re-render when site control changes.
 */
export function useAvailableFeatureSet(): ReadonlySet<SiteFeature> {
  const [, setTick] = useState(0);

  useEffect(() => {
    loadSiteControlFromAPI().then(() => setTick((t) => t + 1));
  }, []);

  return useMemo(() => {
    const control = getSiteControl();
    if (control.global !== 'online') return new Set<SiteFeature>();
    return new Set(
      SITE_FEATURES.filter((f) => control.pages[f] !== false)
    );
  }, [setTick]);
}
