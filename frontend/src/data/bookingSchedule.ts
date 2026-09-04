import { QUICK_FIX_TIME_SLOTS } from './quickfixBooking';

export interface ScheduleWindow {
  date: string;
  startMin: number;
  endMin: number;
  durationMin: number;
}

/** Default service duration (minutes) for a time slot. Quick Fix slots are 2-hour windows. */
export const DEFAULT_SLOT_DURATION_MIN = 120;

/**
 * Parse a "HH AM"/"HH PM" time label into minutes since midnight. Handles the
 * leading portion of slot labels like "09 AM – 11 AM".
 */
export function parseTimeToMinutes(timeLabel: string): number {
  const cleaned = timeLabel.trim().split('–')[0].trim();
  const match = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const isPM = match[2].toUpperCase() === 'PM';
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  return hour * 60;
}

/** Build a schedule window from a date and a slot label, with a duration. */
export function slotWindow(
  date: string,
  timeLabel: string,
  durationMin = DEFAULT_SLOT_DURATION_MIN
): ScheduleWindow {
  return {
    date,
    startMin: parseTimeToMinutes(timeLabel),
    endMin: parseTimeToMinutes(timeLabel) + durationMin,
    durationMin,
  };
}

/**
 * Whether two schedule windows overlap. Windows on different dates never
 * overlap; on the same date they overlap when their time ranges intersect
 * (checked by actual duration, not only identical start times).
 */
export function windowsOverlap(a: ScheduleWindow, b: ScheduleWindow): boolean {
  if (!a.date || !b.date) return false;
  if (a.date !== b.date) return false;
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

/** Convenience: reusable time-slot labels for scheduling (shared by QF/PF). */
export const BOOKING_TIME_SLOTS = QUICK_FIX_TIME_SLOTS;
