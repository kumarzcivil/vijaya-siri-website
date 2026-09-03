import type { ServiceType } from '../data/payment';
import { slotWindow, windowsOverlap } from '../data/bookingSchedule';
import { getQuickFixBooking } from './quickFixBooking';
import { getProFixBooking } from './proFixBooking';

export interface CandidateSchedule {
  serviceType: ServiceType;
  date: string;
  timeLabel: string;
  durationMin: number;
  /**
   * Booking reference (bookingId) of the candidate/current booking. When provided,
   * the existing booking with this same id is skipped so a booking never conflicts
   * with itself during payment confirmation.
   */
  excludeBookingId?: string;
}

/**
 * Checks whether the given candidate schedule overlaps any existing booking of
 * the OTHER service type for the same customer. Quick Fix and Pro Fix are
 * treated as mutually exclusive: they cannot overlap at the same time.
 *
 * Only a CROSS-service conflict is reported:
 *  - a QUICK_FIX candidate is compared against the existing Pro Fix booking
 *  - a PRO_FIX candidate is compared against the existing Quick Fix booking
 * Same-service schedules are intentionally NOT classified as this special
 * QF/PF conflict.
 *
 * NOTE: the existing architecture retains a single current booking per service.
 * The current booking is stored in its own service store, so comparing against
 * the OTHER service's store cannot match the booking currently being paid for.
 * The `excludeBookingId` guard additionally protects against self-conflict
 * should a multi-booking history be introduced later.
 *
 * Returns the conflicting booking's service type, or null when no conflict.
 */
export function findBookingConflict(
  candidate: CandidateSchedule
): ServiceType | null {
  const currentWindow = slotWindow(candidate.date, candidate.timeLabel, candidate.durationMin);

  if (candidate.serviceType === 'QUICK_FIX') {
    const proFix = getProFixBooking();
    if (
      proFix?.slotDate &&
      proFix.slotTime &&
      proFix.bookingId !== candidate.excludeBookingId
    ) {
      const existingWindow = slotWindow(proFix.slotDate, proFix.slotTime);
      if (windowsOverlap(currentWindow, existingWindow)) return 'PRO_FIX';
    }
    return null;
  }

  const quickFix = getQuickFixBooking();
  if (
    quickFix?.slotDate &&
    quickFix.slotTime &&
    quickFix.bookingId !== candidate.excludeBookingId
  ) {
    const existingWindow = slotWindow(quickFix.slotDate, quickFix.slotTime);
    if (windowsOverlap(currentWindow, existingWindow)) return 'QUICK_FIX';
  }

  return null;
}
