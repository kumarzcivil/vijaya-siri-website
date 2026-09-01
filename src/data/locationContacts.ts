/* ========================
   LOCATION CONTACTS
   Per-location customer contact details shown in the website Footer.

   Records are keyed by the immutable Location.id values defined in
   data/locations.ts (siruguppa | adoni | sindhanur).

   Rules:
   - id is the join key and is never user-editable (Admin UI shows read-only).
   - active=false records are never surfaced to customers.
   - getLocationContact(id) falls back to the default (Siruguppa) record when
     the requested location has no active contact record, so the Footer never
     renders blank contact information.
   - No contact data is fabricated for locations that have not been supplied
     real details (Adoni and Sindhanur seed inactive with empty strings).
   ======================== */

export interface LocationContact {
  id: string;
  displayAddress: string;
  phone: string;
  phoneTel: string;
  whatsapp: string;
  email: string;
  mapUrl?: string;
  active: boolean;
}

export const DEFAULT_CONTACT_ID = 'siruguppa';

const LOCATION_CONTACTS_STORAGE_KEY = 'vs_location_contacts';

export const seedLocationContacts: LocationContact[] = [
  {
    id: 'siruguppa',
    displayAddress: 'Siruguppa, Karnataka, India',
    phone: '+91 90088 55088',
    phoneTel: 'tel:+919008855088',
    whatsapp: 'https://wa.me/919008855088',
    email: 'info@vijayasiri.com',
    active: true,
  },
  {
    id: 'adoni',
    displayAddress: '',
    phone: '',
    phoneTel: '',
    whatsapp: '',
    email: '',
    active: false,
  },
  {
    id: 'sindhanur',
    displayAddress: '',
    phone: '',
    phoneTel: '',
    whatsapp: '',
    email: '',
    active: false,
  },
];

function applyContactOverlay(seed: LocationContact[]): LocationContact[] {
  try {
    const raw = localStorage.getItem(LOCATION_CONTACTS_STORAGE_KEY);
    if (!raw) return seed.map((c) => ({ ...c }));
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) return seed.map((c) => ({ ...c }));
    const byId = new Map(seed.map((c) => [c.id, { ...c }]));
    stored.forEach((entry: Partial<LocationContact>) => {
      const id = entry.id;
      if (!id) return;
      const current = byId.get(id);
      if (!current) return;
      byId.set(id, {
        ...current,
        ...entry,
        id,
        mapUrl: entry.mapUrl ?? undefined,
      });
    });
    return Array.from(byId.values());
  } catch {
    // storage unavailable or malformed — keep seed data
    return seed.map((c) => ({ ...c }));
  }
}

export function getLocationContacts(): LocationContact[] {
  return applyContactOverlay(seedLocationContacts);
}

/**
 * Returns the default (Siruguppa) contact record. Used as the safety
 * fallback whenever a selected location has no active contact record.
 */
export function getDefaultLocationContact(): LocationContact {
  const contacts = getLocationContacts();
  const fallback =
    contacts.find((c) => c.id === DEFAULT_CONTACT_ID && c.active) ??
    contacts.find((c) => c.id === DEFAULT_CONTACT_ID) ??
    seedLocationContacts[0];
  return { ...fallback };
}

/**
 * Returns the contact record for a location id. If the record is missing or
 * inactive, falls back to the default (Siruguppa) record.
 */
export function getLocationContact(id: string): LocationContact {
  const contacts = getLocationContacts();
  const contact = contacts.find((c) => c.id === id);
  if (contact && contact.active) return { ...contact };
  return getDefaultLocationContact();
}

export function saveLocationContacts(items: LocationContact[]): void {
  try {
    localStorage.setItem(LOCATION_CONTACTS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable — keep in-memory value
  }
}

export function updateLocationContact(
  id: string,
  updates: Partial<LocationContact>
): LocationContact[] {
  const items = getLocationContacts();
  const updated = items.map((c) => (c.id === id ? { ...c, ...updates, id: c.id } : c));
  saveLocationContacts(updated);
  return updated;
}

export function resetLocationContacts(): LocationContact[] {
  try {
    localStorage.removeItem(LOCATION_CONTACTS_STORAGE_KEY);
  } catch {
    // ignore
  }
  return seedLocationContacts.map((c) => ({ ...c }));
}