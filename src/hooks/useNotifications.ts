import { useSyncExternalStore } from 'react';
import { getNotifications, subscribeNotifications } from '../store/notifications';

export function useNotifications() {
  return useSyncExternalStore(subscribeNotifications, getNotifications);
}
