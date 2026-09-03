import { useSyncExternalStore } from 'react';
import {
  getBookingsRegistry,
  subscribeBookingsRegistry,
} from '../store/bookingsRegistry';

export function useBookingsRegistry() {
  return useSyncExternalStore(subscribeBookingsRegistry, getBookingsRegistry);
}
