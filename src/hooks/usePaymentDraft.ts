import { useSyncExternalStore } from 'react';
import {
  getPaymentDraft,
  subscribePaymentDraft,
} from '../store/payment';

export function usePaymentDraft() {
  return useSyncExternalStore(subscribePaymentDraft, getPaymentDraft);
}
