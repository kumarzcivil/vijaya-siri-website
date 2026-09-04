import { useSyncExternalStore } from 'react';
import {
  getProFixSearch,
  setProFixSearch,
  subscribeProFixSearch,
} from '../store/proFixSearch';

export function useProFixSearch() {
  const query = useSyncExternalStore(subscribeProFixSearch, getProFixSearch);
  return [query, setProFixSearch] as const;
}
