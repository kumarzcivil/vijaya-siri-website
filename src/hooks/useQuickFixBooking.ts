import { useSyncExternalStore } from 'react';
import {
  getQuickFixBooking,
  subscribeQuickFixBooking,
} from '../store/quickFixBooking';

export function useQuickFixBooking() {
  return useSyncExternalStore(subscribeQuickFixBooking, getQuickFixBooking);
}
