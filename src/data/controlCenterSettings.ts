export type SystemLanguage = 'english';
export type SystemTimeZone = 'Asia/Kolkata';
export type SystemDateFormat = 'DD/MM/YYYY';
export type SystemTimeFormat = '12-hour' | '24-hour';

export interface ControlCenterSettings {
  business: {
    companyName: string;
    businessType: string;
    registeredAddress: string;
  };
  contact: {
    supportEmail: string;
    supportPhone: string;
    publicAddress: string;
  };
  notifications: {
    emailNotifications: boolean;
    bookingAlerts: boolean;
    leadAlerts: boolean;
  };
  system: {
    language: SystemLanguage;
    timeZone: SystemTimeZone;
    dateFormat: SystemDateFormat;
    timeFormat: SystemTimeFormat;
  };
}

export const CONTROL_CENTER_SETTINGS_STORAGE_KEY = 'vs_control_center_settings';

export const controlCenterSettingsDefaults: ControlCenterSettings = {
  business: {
    companyName: '',
    businessType: '',
    registeredAddress: '',
  },
  contact: {
    supportEmail: '',
    supportPhone: '',
    publicAddress: '',
  },
  notifications: {
    emailNotifications: false,
    bookingAlerts: false,
    leadAlerts: false,
  },
  system: {
    language: 'english',
    timeZone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
  },
};

function cloneDefaults(): ControlCenterSettings {
  return {
    business: { ...controlCenterSettingsDefaults.business },
    contact: { ...controlCenterSettingsDefaults.contact },
    notifications: { ...controlCenterSettingsDefaults.notifications },
    system: { ...controlCenterSettingsDefaults.system },
  };
}

function toText(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function toEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function mergeIntoDefaults(value: unknown): ControlCenterSettings {
  const source =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const business =
    source.business && typeof source.business === 'object'
      ? (source.business as Record<string, unknown>)
      : {};
  const contact =
    source.contact && typeof source.contact === 'object'
      ? (source.contact as Record<string, unknown>)
      : {};
  const notifications =
    source.notifications && typeof source.notifications === 'object'
      ? (source.notifications as Record<string, unknown>)
      : {};
  const system =
    source.system && typeof source.system === 'object'
      ? (source.system as Record<string, unknown>)
      : {};

  const d = controlCenterSettingsDefaults;

  return {
    business: {
      companyName: toText(business.companyName, d.business.companyName),
      businessType: toText(business.businessType, d.business.businessType),
      registeredAddress: toText(
        business.registeredAddress,
        d.business.registeredAddress
      ),
    },
    contact: {
      supportEmail: toText(contact.supportEmail, d.contact.supportEmail),
      supportPhone: toText(contact.supportPhone, d.contact.supportPhone),
      publicAddress: toText(contact.publicAddress, d.contact.publicAddress),
    },
    notifications: {
      emailNotifications: toBoolean(
        notifications.emailNotifications,
        d.notifications.emailNotifications
      ),
      bookingAlerts: toBoolean(
        notifications.bookingAlerts,
        d.notifications.bookingAlerts
      ),
      leadAlerts: toBoolean(notifications.leadAlerts, d.notifications.leadAlerts),
    },
    system: {
      language: toEnum(system.language, ['english'] as const, d.system.language),
      timeZone: toEnum(
        system.timeZone,
        ['Asia/Kolkata'] as const,
        d.system.timeZone
      ),
      dateFormat: toEnum(
        system.dateFormat,
        ['DD/MM/YYYY'] as const,
        d.system.dateFormat
      ),
      timeFormat: toEnum(
        system.timeFormat,
        ['12-hour', '24-hour'] as const,
        d.system.timeFormat
      ),
    },
  };
}

export function getControlCenterSettings(): ControlCenterSettings {
  try {
    const raw = localStorage.getItem(CONTROL_CENTER_SETTINGS_STORAGE_KEY);
    if (!raw) return cloneDefaults();
    try {
      return mergeIntoDefaults(JSON.parse(raw));
    } catch {
      return cloneDefaults();
    }
  } catch {
    return cloneDefaults();
  }
}

export function saveControlCenterSettings(
  settings: ControlCenterSettings
): ControlCenterSettings {
  const next = mergeIntoDefaults(settings);
  try {
    localStorage.setItem(CONTROL_CENTER_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: keep in-memory value only.
  }
  return next;
}

export function resetControlCenterSettings(): ControlCenterSettings {
  try {
    localStorage.removeItem(CONTROL_CENTER_SETTINGS_STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to remove.
  }
  return cloneDefaults();
}