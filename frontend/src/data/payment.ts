/* ========================
   PAYMENT DOMAIN (shared by Quick Fix & Pro Fix)
   ======================== */

import type { QuickFixBooking } from './quickfixBooking';
import type { ProFixSiteVisitOrder } from './profix';
import type { AppliedCoupon } from './coupons';

export type ServiceType = 'QUICK_FIX' | 'PRO_FIX';

export type PaymentMethod = 'ONLINE' | 'MANUAL_UPI' | 'MANUAL_BANK' | 'CASH';

export type PaymentStatus = 'INITIATED' | 'PAID' | 'FAILED' | 'CANCELLED' | 'SUBMITTED';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export const CURRENCY = 'INR';

export function formatINR(amount: number): string {
  return `\u20B9${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Canonical payment record. NOTE: this is frontend-only for now. Server-side
 * validation of amount / booking / status / gateway response must be added when
 * a real backend + payment gateway are connected. Until then we never mark a
 * payment PAID from a fabricated gateway response.
 */
export interface Payment {
  paymentId: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod | null;
  status: PaymentStatus;
  transactionReference: string;
  gatewayReference: string | null;
  createdAt: string;
}

export interface BookingCustomer {
  customerId: string;
  name: string;
  mobile: string;
  email?: string;
  siteAddress: string;
  siteLocation: string;
}

export interface PriceSummary {
  basePrice: number;
  addOnsAmount: number;
  discount: number;
  finalAmount: number;
}

/**
 * The pending payment/booking context created by a book page and consumed by
 * the shared /payment page. It carries the normalized display summary plus the
 * raw service booking record so the confirmed booking can be committed to the
 * existing service booking store on completion.
 */

export interface PaymentDraft {
  serviceType: ServiceType;
  bookingId: string;
  currency: string;
  payment: Payment;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  locationId: string;
  locationLabel: string;
  scheduledDate?: string;
  scheduledTime?: string;
  customer: BookingCustomer;
  price: PriceSummary;
  quickFixBooking?: QuickFixBooking;
  proFixOrder?: ProFixSiteVisitOrder;
  /** Coupon applied at checkout. The final payable = price.finalAmount - coupon.discount. */
  coupon?: AppliedCoupon;
}

const CUSTOMER_ID_STORAGE_KEY = 'vs-customer-id';

function randomSuffix(): string {
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function generateBookingId(serviceType: ServiceType): string {
  const prefix = serviceType === 'QUICK_FIX' ? 'QF' : 'PF';
  return `${prefix}-${randomSuffix()}`;
}

export function generatePaymentId(): string {
  return `PAY-${randomSuffix()}`;
}

/**
 * Returns a stable customer identifier for the current session. There is no
 * real customer identity system yet, so a per-session id is generated and
 * persisted in sessionStorage. Replace with the real customer id when
 * authentication/account is connected.
 */
export function getOrCreateCustomerId(): string {
  try {
    const existing = sessionStorage.getItem(CUSTOMER_ID_STORAGE_KEY);
    if (existing) return existing;
    const id = `CUS-${randomSuffix()}`;
    sessionStorage.setItem(CUSTOMER_ID_STORAGE_KEY, id);
    return id;
  } catch {
    return `CUS-${randomSuffix()}`;
  }
}
