/* ========================
   QUICK FIX BOOKING CONTRACT
   Service-specific action flow:
   SERVICE → CONFIRM → TIME SLOT (if required)
   → CUSTOMER/SITE DETAILS → CONFIRM
   → PAYMENT (if required) → BOOKING CONFIRMED
   ======================== */

export interface QuickFixBookingDetails {
  name: string;
  mobile: string;
  siteAddress: string;
  siteLocation: string;
}

export type QuickFixPaymentStatus = 'paid' | 'pay_after_service';

export interface QuickFixBooking {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  slotDate: string;
  slotTime: string;
  amount: number;
  payableNow: number;
  paymentRequired: boolean;
  paymentStatus: QuickFixPaymentStatus;
  paymentRef: string;
  customerDetails: QuickFixBookingDetails;
  createdAt: string;
}

export const QUICK_FIX_TIME_SLOTS = [
  '09 AM – 11 AM',
  '11 AM – 01 PM',
  '01 PM – 03 PM',
  '03 PM – 05 PM',
  '05 PM – 07 PM',
] as const;

export interface QuickFixSlotDay {
  value: string;
  label: string;
}

export function getQuickFixSlotDays(): QuickFixSlotDay[] {
  const days: QuickFixSlotDay[] = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = d.toISOString().slice(0, 10);
    const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayMonth = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    days.push({
      value,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${weekday}, ${dayMonth}`,
    });
  }
  return days;
}
