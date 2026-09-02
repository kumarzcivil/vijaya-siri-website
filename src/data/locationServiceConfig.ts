export type CustomerService = 'quickFix' | 'proFix';

export interface LocationServiceAvailability {
  quickFix: boolean;
  proFix: boolean;
}

/**
 * Manages location-based availability for the Quick Fix and Pro Fix customer
 * services, plus whether each service requires the customer to log in before
 * it can be used.
 *
 * Login requirement is a per-service (global) setting applied across every
 * location; availability is per-location per-service. Only Siruguppa and Adoni
 * are provisioned initially. Any location without an explicit entry (for
 * example Sindhanur) is treated as unavailable for all services.
 */
export interface LocationServiceConfig {
  quickFixLoginRequired: boolean;
  proFixLoginRequired: boolean;
  locations: Record<string, LocationServiceAvailability>;
}

export const LOCATION_SERVICE_CONFIG_STORAGE_KEY = 'vs_location_service_config';

export const LOCATION_SERVICE_DEFAULTS: LocationServiceConfig = {
  quickFixLoginRequired: true,
  proFixLoginRequired: true,
  locations: {
    siruguppa: { quickFix: true, proFix: true },
    adoni: { quickFix: false, proFix: false },
  },
};

export const LOCATION_SERVICE_IDS: string[] = ['siruguppa', 'adoni'];

const UNAVAILABLE: Readonly<LocationServiceAvailability> = {
  quickFix: false,
  proFix: false,
};

function isAvailability(value: unknown): value is LocationServiceAvailability {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.quickFix === 'boolean' && typeof v.proFix === 'boolean';
}

function isLocationServiceConfig(value: unknown): value is LocationServiceConfig {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.quickFixLoginRequired !== 'boolean') return false;
  if (typeof v.proFixLoginRequired !== 'boolean') return false;
  if (!v.locations || typeof v.locations !== 'object') return false;
  return true;
}

function parseLocationServiceConfig(raw: string): LocationServiceConfig | null {
  try {
    const parsed = JSON.parse(raw);
    if (!isLocationServiceConfig(parsed)) return null;
    const locations: Record<string, LocationServiceAvailability> = {};
    for (const id of LOCATION_SERVICE_IDS) {
      const stored = parsed.locations[id];
      const fallback = LOCATION_SERVICE_DEFAULTS.locations[id] ?? UNAVAILABLE;
      locations[id] = isAvailability(stored) ? stored : { ...fallback };
    }
    return {
      quickFixLoginRequired: parsed.quickFixLoginRequired,
      proFixLoginRequired: parsed.proFixLoginRequired,
      locations,
    };
  } catch {
    return null;
  }
}

function cloneDefaults(): LocationServiceConfig {
  const locations: Record<string, LocationServiceAvailability> = {};
  for (const id of LOCATION_SERVICE_IDS) {
    locations[id] = { ...(LOCATION_SERVICE_DEFAULTS.locations[id] ?? UNAVAILABLE) };
  }
  return {
    quickFixLoginRequired: LOCATION_SERVICE_DEFAULTS.quickFixLoginRequired,
    proFixLoginRequired: LOCATION_SERVICE_DEFAULTS.proFixLoginRequired,
    locations,
  };
}

export function getLocationServiceConfig(): LocationServiceConfig {
  try {
    const raw = localStorage.getItem(LOCATION_SERVICE_CONFIG_STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = parseLocationServiceConfig(raw);
    return parsed ?? cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function saveLocationServiceConfig(config: LocationServiceConfig): LocationServiceConfig {
  try {
    const locations: Record<string, LocationServiceAvailability> = {};
    for (const id of LOCATION_SERVICE_IDS) {
      locations[id] = { ...(config.locations[id] ?? UNAVAILABLE) };
    }
    localStorage.setItem(
      LOCATION_SERVICE_CONFIG_STORAGE_KEY,
      JSON.stringify({
        quickFixLoginRequired: config.quickFixLoginRequired,
        proFixLoginRequired: config.proFixLoginRequired,
        locations,
      })
    );
  } catch {
    // storage unavailable — keep in-memory value
  }
  return config;
}

export function resetLocationServiceConfig(): LocationServiceConfig {
  try {
    localStorage.removeItem(LOCATION_SERVICE_CONFIG_STORAGE_KEY);
  } catch {
    // ignore
  }
  return cloneDefaults();
}

/** Availability for a single location, falling back to unavailable when unprovisioned. */
export function getLocationAvailability(
  config: LocationServiceConfig,
  locationId: string
): Readonly<LocationServiceAvailability> {
  return config.locations[locationId] ?? UNAVAILABLE;
}

export function isServiceAvailable(
  config: LocationServiceConfig,
  locationId: string,
  service: CustomerService
): boolean {
  return getLocationAvailability(config, locationId)[service] === true;
}

export function isLoginRequired(
  config: LocationServiceConfig,
  service: CustomerService
): boolean {
  return service === 'quickFix' ? config.quickFixLoginRequired : config.proFixLoginRequired;
}

export function updateLocationAvailability(
  locationId: string,
  service: CustomerService,
  value: boolean
): LocationServiceConfig {
  const config = getLocationServiceConfig();
  const current = { ...getLocationAvailability(config, locationId) };
  current[service] = value;
  const next = {
    ...config,
    locations: { ...config.locations, [locationId]: current },
  };
  return saveLocationServiceConfig(next);
}

export function updateLoginRequired(service: CustomerService, value: boolean): LocationServiceConfig {
  const config = getLocationServiceConfig();
  const next: LocationServiceConfig = {
    ...config,
    quickFixLoginRequired:
      service === 'quickFix' ? value : config.quickFixLoginRequired,
    proFixLoginRequired: service === 'proFix' ? value : config.proFixLoginRequired,
  };
  return saveLocationServiceConfig(next);
}
