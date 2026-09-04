/* ========================
   BOOKINGS REGISTRY HELPERS
   A shared, frontend-only persisted registry of all confirmed bookings /
   site-visit orders (Quick Fix + Pro Fix). Both the customer "My Bookings"
   view and the Control Center "Bookings" section read from this single
   source, so data stays consistent with no backend / database.

   Storage is owned by src/store/bookingsRegistry.ts (in-memory + localStorage
   + pub/sub). This module provides the normalizing helpers that confirmation
   pages use to append records and that admins use to update status.
   ======================== */

import { getBookingsRegistry, setBookingsRegistry } from '../store/bookingsRegistry';
import type { QuickFixBooking } from './quickfixBooking';
import type { ProFixSiteVisitOrder } from './profix';

export type BookingRecordKind = 'quick-fix' | 'pro-fix';

export type BookingRegistryStatus = 'upcoming' | 'completed' | 'cancelled';

export interface BookingRegistryRecord {
  id: string;
  kind: BookingRecordKind;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  location: string;
  customerName: string;
  customerMobile: string;
  customerId?: string;
  bookingId?: string;
  slotDate?: string;
  slotTime?: string;
  amount: number;
  paymentRef?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  couponCode?: string;
  couponDiscount?: number;
  status: BookingRegistryStatus;
  createdAt: string;
}

function normalizeLocation(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(', ');
}

export function recordQuickFixBooking(booking: QuickFixBooking): BookingRegistryRecord {
  const records = getBookingsRegistry();
  const record: BookingRegistryRecord = {
    id: `qf_${booking.bookingId ?? `${booking.serviceId}_${Date.now()}`}`,
    kind: 'quick-fix',
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    categoryName: booking.categoryName,
    location: normalizeLocation([
      booking.customerDetails.siteAddress,
      booking.customerDetails.siteLocation,
    ]),
    customerName: booking.customerDetails.name,
    customerMobile: booking.customerDetails.mobile,
    customerId: booking.customerId,
    bookingId: booking.bookingId,
    slotDate: booking.slotDate,
    slotTime: booking.slotTime,
    amount: booking.paymentRequired ? booking.payableNow : booking.amount,
    paymentRef: booking.paymentRef,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    couponCode: booking.couponCode,
    couponDiscount: booking.couponDiscount,
    status: 'upcoming',
    createdAt: booking.createdAt || new Date().toISOString(),
  };
  const existing = records.some((r) => r.id === record.id);
  const next = existing
    ? records.map((r) => (r.id === record.id ? { ...r, ...record, id: r.id } : r))
    : [record, ...records];
  setBookingsRegistry(next);
  return record;
}

export function recordProFixBooking(order: ProFixSiteVisitOrder): BookingRegistryRecord {
  const records = getBookingsRegistry();
  const record: BookingRegistryRecord = {
    id: `pf_${order.bookingId ?? `${order.serviceId}_${Date.now()}`}`,
    kind: 'pro-fix',
    serviceId: order.serviceId,
    serviceName: order.serviceName,
    categoryName: order.categoryName,
    location: normalizeLocation([
      order.billingDetails.siteAddress,
      order.billingDetails.siteLocation,
    ]),
    customerName: order.billingDetails.name,
    customerMobile: order.billingDetails.mobile,
    customerId: order.customerId,
    bookingId: order.bookingId,
    slotDate: order.slotDate,
    slotTime: order.slotTime,
    amount: order.payableNow > 0 ? order.payableNow : order.siteVisitCharge,
    paymentRef: order.paymentRef,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    couponCode: order.couponCode,
    couponDiscount: order.couponDiscount,
    status: 'upcoming',
    createdAt: order.createdAt || new Date().toISOString(),
  };
  const existing = records.some((r) => r.id === record.id);
  const next = existing
    ? records.map((r) => (r.id === record.id ? { ...r, ...record, id: r.id } : r))
    : [record, ...records];
  setBookingsRegistry(next);
  return record;
}

export function updateBookingStatus(
  id: string,
  status: BookingRegistryStatus
): BookingRegistryRecord[] {
  const next = getBookingsRegistry().map((r) => (r.id === id ? { ...r, status } : r));
  setBookingsRegistry(next);
  return next;
}
