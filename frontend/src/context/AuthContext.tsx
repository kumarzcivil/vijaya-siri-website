import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { signupAPI, loginAPI, adminLoginAPI, getMeAPI, type AuthUser, type SignupData, type LoginData } from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  adminLogin: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'vs_auth_token';
const USER_KEY = 'vs_auth_user';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = getStoredUser();
    const token = getStoredToken();
    if (stored && token && !isTokenExpired(token)) return stored;
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const t = getStoredToken();
    if (t && !isTokenExpired(t)) return t;
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch {}
    }
  }, [token, user]);

  useEffect(() => {
    if (!token) return;
    if (isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginAPI(data);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await signupAPI(data);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
      } else {
        throw new Error(res.message || 'Signup failed');
      }
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adminLogin = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminLoginAPI(data);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
      } else {
        throw new Error(res.message || 'Admin login failed');
      }
    } catch (err: any) {
      const message = err?.message || err?.errors?.[0]?.message || 'Admin login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch {}
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMeAPI();
      if (res.success && res.data) {
        updateUser(res.data.user);
      }
    } catch {}
  }, [updateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        adminLogin,
        signup,
        logout,
        clearError,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
