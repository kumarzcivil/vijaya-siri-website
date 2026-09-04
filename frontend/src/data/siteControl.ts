export type SiteStatus = 'online' | 'maintenance';

export type SiteFeature =
  | 'home'
  | 'projects'
  | 'packages'
  | 'proFix'
  | 'quickFix'
  | 'about'
  | 'quote'
  | 'account'
  | 'offers';

export interface SiteControlPages {
  home: boolean;
  projects: boolean;
  packages: boolean;
  proFix: boolean;
  quickFix: boolean;
  about: boolean;
  quote: boolean;
  account: boolean;
  offers: boolean;
}

export interface SiteControl {
  global: SiteStatus;
  pages: SiteControlPages;
}

export const SITE_CONTROL_STORAGE_KEY = 'vs_site_control';

export const SITE_FEATURES: SiteFeature[] = [
  'home',
  'projects',
  'packages',
  'proFix',
  'quickFix',
  'about',
  'quote',
  'account',
  'offers',
];

export const siteControlDefaults: SiteControl = {
  global: 'online',
  pages: {
    home: true,
    projects: true,
    packages: true,
    proFix: true,
    quickFix: true,
    about: true,
    quote: true,
    account: true,
    offers: true,
  },
};

function isSiteControl(value: unknown): value is SiteControl {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.global !== 'online' && v.global !== 'maintenance') return false;
  if (!v.pages || typeof v.pages !== 'object') return false;
  return true;
}

function parseSiteControl(raw: string): SiteControl | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isSiteControl(parsed)) return null;
    const pages: SiteControlPages = { ...siteControlDefaults.pages };
    const storedPages = parsed.pages;
    for (const feature of SITE_FEATURES) {
      const value = storedPages[feature];
      if (typeof value === 'boolean') {
        pages[feature] = value;
      }
    }
    return { global: parsed.global, pages };
  } catch {
    return null;
  }
}

export function getSiteControl(): SiteControl {
  try {
    const raw = localStorage.getItem(SITE_CONTROL_STORAGE_KEY);
    if (!raw) return { ...siteControlDefaults, pages: { ...siteControlDefaults.pages } };
    const parsed = parseSiteControl(raw);
    if (!parsed) return { ...siteControlDefaults, pages: { ...siteControlDefaults.pages } };
    return parsed;
  } catch {
    return { ...siteControlDefaults, pages: { ...siteControlDefaults.pages } };
  }
}

export function saveSiteControl(control: SiteControl): SiteControl {
  try {
    localStorage.setItem(
      SITE_CONTROL_STORAGE_KEY,
      JSON.stringify({
        global: control.global,
        pages: { ...siteControlDefaults.pages, ...control.pages },
      })
    );
  } catch {
    // storage unavailable — keep in-memory value
  }
  return control;
}

export function resetSiteControl(): SiteControl {
  try {
    localStorage.removeItem(SITE_CONTROL_STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...siteControlDefaults, pages: { ...siteControlDefaults.pages } };
}

export function isFeatureEnabled(feature: SiteFeature): boolean {
  const control = getSiteControl();
  if (control.global === 'maintenance') return false;
  return control.pages[feature] !== false;
}

export function isSiteOnline(): boolean {
  return getSiteControl().global === 'online';
}

/**
 * Returns the set of customer features that are currently available to
 * customers (online global status AND page flag enabled). Used by
 * navigation components to hide disabled entry points.
 */
export function getAvailableFeatures(): SiteFeature[] {
  const control = getSiteControl();
  if (control.global !== 'online') return [];
  return SITE_FEATURES.filter((feature) => control.pages[feature] !== false);
}

export function getAvailableFeatureSet(): ReadonlySet<SiteFeature> {
  return new Set(getAvailableFeatures());
}

export function updateSiteControlPages(patch: Partial<SiteControlPages>): SiteControl {
  const control = getSiteControl();
  const next = {
    ...control,
    pages: { ...control.pages, ...patch },
  };
  return saveSiteControl(next);
}

export function updateSiteStatus(status: SiteStatus): SiteControl {
  const control = getSiteControl();
  const next = { ...control, global: status };
  return saveSiteControl(next);
}
