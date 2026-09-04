/**
 * Auth state helpers — delegates to the real backend-backed AuthContext.
 *
 * For new code, prefer importing useAuth() from context/AuthContext directly.
 * These free functions exist so legacy code that calls isCustomerSignedIn()
 * without a React component tree can keep working during the migration.
 */

import { getStoredUser, getStoredToken } from './authStorage';

export function isCustomerSignedIn(): boolean {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!token && !!user && !isExpired(token);
}

function isExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
