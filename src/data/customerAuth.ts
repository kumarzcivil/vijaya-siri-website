/**
 * Frontend customer session state.
 *
 * IMPORTANT LIMITATION: There is currently NO real authentication backend
 * connected to this app. The existing customer login page is UI-only (it only
 * validates the form fields). This module provides a lightweight in-browser
 * session flag so the "login required" gate for Quick Fix / Pro Fix has
 * something to check until true authentication is wired in.
 *
 * This is NOT secure authentication and must not be treated as one. It stores
 * NO passwords and NO customer data — only a boolean "signed in" marker that a
 * customer can clear by logging out. When a real auth system is connected,
 * this module should be swapped for the real session/identity provider.
 */

const CUSTOMER_SESSION_STORAGE_KEY = 'vs_customer_session';

export function isCustomerSignedIn(): boolean {
  try {
    return localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setCustomerSignedIn(): void {
  try {
    localStorage.setItem(CUSTOMER_SESSION_STORAGE_KEY, '1');
  } catch {
    // storage unavailable — sign-in persists only for the current session
  }
}

export function clearCustomerSignedIn(): void {
  try {
    localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
  } catch {
    // storage unavailable
  }
}
