import { useSyncExternalStore } from 'react';
import {
  getQuickFixSearch,
  setQuickFixSearch,
  subscribeQuickFixSearch,
} from '../store/quickfixSearch';

export function useQuickFixSearch() {
  const query = useSyncExternalStore(subscribeQuickFixSearch, getQuickFixSearch);
  return [query, setQuickFixSearch] as const;
}
