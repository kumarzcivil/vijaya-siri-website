import { useSyncExternalStore } from 'react';
import {
  getProFixBooking,
  subscribeProFixBooking,
} from '../store/proFixBooking';

export function useProFixBooking() {
  return useSyncExternalStore(subscribeProFixBooking, getProFixBooking);
}
