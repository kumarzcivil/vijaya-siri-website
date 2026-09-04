/* ========================
   CUSTOMER PROFILE REGISTRY
   Frontend-only persistent storage for customer profile, addresses and
   payment preferences (V3.40). No backend / database / server-side auth.
   The sign-in session (customerAuth) only stores a boolean '1' flag; this
   registry holds the customer's editable profile data keyed by customerId.

   Storage keys:
   - vs_customers            → CustomerProfile[]
   - vs_customer_addresses   → CustomerAddress[]
   - vs_payment_preferences  → PaymentPreference[]
   ======================== */

export type PaymentMethodPreference = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';

export interface CustomerProfile {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  createdAt: string;
  marketingOptIn: boolean;
  notificationPrefs: {
    bookings: boolean;
    offers: boolean;
    service: boolean;
  };
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface PaymentPreference {
  id: string;
  customerId: string;
  method: PaymentMethodPreference;
  label: string;
  upiId?: string;
  cardLast4?: string;
  bankName?: string;
  isDefault: boolean;
}

const CUSTOMER_KEY = 'vs_customers';
const ADDRESS_KEY = 'vs_customer_addresses';
const PAYMENT_KEY = 'vs_payment_preferences';

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — keep in-memory only
  }
}

/* ------------------ Profiles ------------------ */

export function getCustomers(): CustomerProfile[] {
  return read<CustomerProfile>(CUSTOMER_KEY);
}

export function getCustomer(id: string | undefined): CustomerProfile | undefined {
  if (!id) return undefined;
  return getCustomers().find((c) => c.id === id);
}

export function saveCustomers(customers: CustomerProfile[]): void {
  write(CUSTOMER_KEY, customers);
}

export function upsertCustomer(profile: CustomerProfile): CustomerProfile[] {
  const customers = getCustomers();
  const existing = customers.some((c) => c.id === profile.id);
  const next = existing
    ? customers.map((c) => (c.id === profile.id ? { ...c, ...profile, id: c.id } : c))
    : [...customers, profile];
  saveCustomers(next);
  return next;
}

export function deleteCustomer(id: string): CustomerProfile[] {
  const next = getCustomers().filter((c) => c.id !== id);
  saveCustomers(next);
  write(
    ADDRESS_KEY,
    read<CustomerAddress>(ADDRESS_KEY).filter((a) => a.customerId !== id)
  );
  write(
    PAYMENT_KEY,
    read<PaymentPreference>(PAYMENT_KEY).filter((p) => p.customerId !== id)
  );
  return next;
}

export function generateCustomerId(): string {
  return `cus_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------ Addresses ------------------ */

export function getCustomerAddresses(customerId?: string): CustomerAddress[] {
  const all = read<CustomerAddress>(ADDRESS_KEY);
  if (!customerId) return all;
  return all.filter((a) => a.customerId === customerId);
}

export function getCustomerAddress(id: string | undefined): CustomerAddress | undefined {
  if (!id) return undefined;
  return read<CustomerAddress>(ADDRESS_KEY).find((a) => a.id === id);
}

export function saveCustomerAddresses(addresses: CustomerAddress[]): void {
  write(ADDRESS_KEY, addresses);
}

export function upsertCustomerAddress(address: CustomerAddress): CustomerAddress[] {
  const addresses = read<CustomerAddress>(ADDRESS_KEY);
  const existing = addresses.some((a) => a.id === address.id);
  let next = existing
    ? addresses.map((a) => (a.id === address.id ? { ...a, ...address, id: a.id } : a))
    : [...addresses, address];

  if (address.isDefault) {
    next = next.map((a) =>
      a.customerId === address.customerId && a.id !== address.id && a.isDefault
        ? { ...a, isDefault: false }
        : a
    );
  }
  if (!next.some((a) => a.customerId === address.customerId && a.isDefault)) {
    const first = next.find((a) => a.customerId === address.customerId);
    if (first) {
      next = next.map((a) =>
        a.customerId === address.customerId && a.id === first.id ? { ...a, isDefault: true } : a
      );
    }
  }
  saveCustomerAddresses(next);
  return next;
}

export function deleteCustomerAddress(id: string): CustomerAddress[] {
  const next = read<CustomerAddress>(ADDRESS_KEY).filter((a) => a.id !== id);
  saveCustomerAddresses(next);
  return next;
}

export function generateAddressId(): string {
  return `addr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------ Payment preferences ------------------ */

export function getPaymentPreferences(customerId?: string): PaymentPreference[] {
  const all = read<PaymentPreference>(PAYMENT_KEY);
  if (!customerId) return all;
  return all.filter((p) => p.customerId === customerId);
}

export function savePaymentPreferences(prefs: PaymentPreference[]): void {
  write(PAYMENT_KEY, prefs);
}

export function upsertPaymentPreference(
  pref: PaymentPreference
): PaymentPreference[] {
  const prefs = read<PaymentPreference>(PAYMENT_KEY);
  const existing = prefs.some((p) => p.id === pref.id);
  let next = existing
    ? prefs.map((p) => (p.id === pref.id ? { ...p, ...pref, id: p.id } : p))
    : [...prefs, pref];

  if (pref.isDefault) {
    next = next.map((p) =>
      p.customerId === pref.customerId && p.id !== pref.id && p.isDefault
        ? { ...p, isDefault: false }
        : p
    );
  }
  if (!next.some((p) => p.customerId === pref.customerId && p.isDefault)) {
    const first = next.find((p) => p.customerId === pref.customerId);
    if (first) {
      next = next.map((p) =>
        p.customerId === pref.customerId && p.id === first.id ? { ...p, isDefault: true } : p
      );
    }
  }
  savePaymentPreferences(next);
  return next;
}

export function deletePaymentPreference(id: string): PaymentPreference[] {
  const next = read<PaymentPreference>(PAYMENT_KEY).filter((p) => p.id !== id);
  savePaymentPreferences(next);
  return next;
}

export function generatePaymentPreferenceId(): string {
  return `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
