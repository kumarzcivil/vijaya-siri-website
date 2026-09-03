import type { ServiceType } from './payment';

/**
 * Coupon / promo engine for the shared payment page.
 *
 * NOTE: For V3.40 this is a local, static, frontend-only coupon catalogue. There
 * is intentionally no backend, database, or server-side usage verification.
 * The `usageLimit` and `locationId` fields are a foundation for a future
 * Control Center -> Marketing -> Coupons manager; they are not enforced now.
 */

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED';

export type CouponServiceScope = ServiceType | 'BOTH';

export interface Coupon {
  code: string;
  label: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumBookingAmount: number;
  /** Maximum discount (INR) applied to PERCENTAGE coupons. */
  maximumDiscount?: number;
  applicableService: CouponServiceScope;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
  /** Reserved for future usage-limit tracking (not enforced in V3.40). */
  usageLimit?: number;
  /** Reserved for future per-location coupon restrictions (not enforced in V3.40). */
  locationId?: string;
}

export type CouponErrorCode =
  | 'NOT_FOUND'
  | 'INACTIVE'
  | 'EXPIRED'
  | 'SERVICE'
  | 'MIN_AMOUNT'
  | 'LOCATION';

export interface CouponError {
  code: CouponErrorCode;
  message: string;
}

/** Result of a successfully applied coupon: discount to subtract from the total. */
export interface AppliedCoupon {
  code: string;
  discount: number;
}

export const COUPONS: readonly Coupon[] = [
  {
    code: 'WELCOME10',
    label: '10% promotional discount',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumBookingAmount: 500,
    maximumDiscount: 200,
    applicableService: 'QUICK_FIX',
    active: true,
  },
  {
    code: 'PRO500',
    label: '\u20B9500 off',
    discountType: 'FIXED',
    discountValue: 500,
    minimumBookingAmount: 1500,
    applicableService: 'PRO_FIX',
    active: true,
  },
  {
    code: 'FIRSTFIX',
    label: '15% promotional discount',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minimumBookingAmount: 1000,
    maximumDiscount: 300,
    applicableService: 'BOTH',
    active: true,
  },
];

export function getCoupon(code: string): Coupon | undefined {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code === normalized);
}

function isInDateRange(coupon: Coupon, now: Date): boolean {
  if (coupon.validFrom) {
    const from = new Date(coupon.validFrom);
    if (now < from) return false;
  }
  if (coupon.validUntil) {
    const until = new Date(coupon.validUntil);
    if (now > until) return false;
  }
  return true;
}

export interface CouponValidationInput {
  code: string;
  serviceType: ServiceType;
  bookingAmount: number;
  locationId?: string;
  now?: Date;
}

export type CouponValidationResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; error: CouponError };

export function validateCoupon(input: CouponValidationInput): CouponValidationResult {
  const coupon = getCoupon(input.code);
  if (!coupon) {
    return { ok: false, error: { code: 'NOT_FOUND', message: 'Invalid coupon code.' } };
  }
  if (!coupon.active) {
    return { ok: false, error: { code: 'INACTIVE', message: 'Sorry, this coupon is no longer valid.' } };
  }
  if (!isInDateRange(coupon, input.now ?? new Date())) {
    return { ok: false, error: { code: 'EXPIRED', message: 'This coupon has expired.' } };
  }
  if (coupon.applicableService !== 'BOTH' && coupon.applicableService !== input.serviceType) {
    return {
      ok: false,
      error: { code: 'SERVICE', message: "This coupon isn't valid for this service." },
    };
  }
  if (coupon.minimumBookingAmount > 0 && input.bookingAmount < coupon.minimumBookingAmount) {
    return {
      ok: false,
      error: { code: 'MIN_AMOUNT', message: 'Add more to your booking to use this coupon.' },
    };
  }
  if (coupon.locationId && input.locationId && coupon.locationId !== input.locationId) {
    return {
      ok: false,
      error: { code: 'LOCATION', message: "This coupon isn't valid for your location." },
    };
  }
  return { ok: true, coupon };
}

export interface CouponDiscountInput {
  coupon: Coupon;
  bookingAmount: number;
}

/** Discount amount (INR) for a coupon against a booking amount; never exceeds the booking. */
export function calculateCouponDiscount(input: CouponDiscountInput): number {
  const { coupon, bookingAmount } = input;
  let discount: number;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (bookingAmount * coupon.discountValue) / 100;
    if (coupon.maximumDiscount != null && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }
  return Math.max(0, Math.min(discount, bookingAmount));
}

export type CouponApplyResult =
  | { ok: true; applied: AppliedCoupon }
  | { ok: false; error: CouponError };

export function applyCoupon(input: CouponValidationInput): CouponApplyResult {
  const result = validateCoupon(input);
  if (!result.ok) return result;
  const discount = calculateCouponDiscount({
    coupon: result.coupon,
    bookingAmount: input.bookingAmount,
  });
  return { ok: true, applied: { code: result.coupon.code, discount } };
}
