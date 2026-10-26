'use client';

import { create } from 'zustand';
import {
  getClientCookie,
  setClientCookie,
  deleteClientCookie,
  USER_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  ONE_DAY_SECONDS,
} from '@/lib/cookies';

export interface AuthUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  addresses?: any[];
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    if (user) {
      setClientCookie(USER_COOKIE_NAME, JSON.stringify(user), ONE_DAY_SECONDS);
      try {
        localStorage.removeItem('customer_user');
      } catch {}
      set({ user, isAuthenticated: true, isLoading: false });
      if (typeof window !== 'undefined' && user?.id) {
        import('@/store/wishlistStore').then((m) => m.useWishlistStore.getState().syncWithServer());
      }
    } else {
      deleteClientCookie(USER_COOKIE_NAME);
      try {
        localStorage.removeItem('customer_user');
        localStorage.removeItem('customer_checkout_details');
      } catch {}
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    // 1. Read from 1-day cookie first for instant hydration
    try {
      const stored = getClientCookie(USER_COOKIE_NAME);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          set({ user: parsed, isAuthenticated: true, isLoading: false });
          if (typeof window !== 'undefined' && parsed.id) {
            import('@/store/wishlistStore').then((m) => m.useWishlistStore.getState().syncWithServer());
          }
        }
      }
    } catch {}

    // Clean up any legacy long-lived localStorage
    try {
      localStorage.removeItem('customer_user');
    } catch {}

    // 2. Authoritative check with server /api/auth/me (validates httpOnly 1-day auth_token)
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        // If server says 401 or token expired after 1 day, clear cookie and session
        deleteClientCookie(USER_COOKIE_NAME);
        try {
          localStorage.removeItem('customer_checkout_details');
        } catch {}
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        setClientCookie(USER_COOKIE_NAME, JSON.stringify(data.user), ONE_DAY_SECONDS);
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        if (typeof window !== 'undefined' && data.user.id) {
          import('@/store/wishlistStore').then((m) => m.useWishlistStore.getState().syncWithServer());
        }
      } else {
        deleteClientCookie(USER_COOKIE_NAME);
        try {
          localStorage.removeItem('customer_checkout_details');
        } catch {}
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set((state) => ({ ...state, isLoading: false }));
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      deleteClientCookie(USER_COOKIE_NAME);
      try {
        localStorage.removeItem('customer_user');
        localStorage.removeItem('customer_checkout_details');
      } catch {}
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));


/**
 * Synchronous check to verify if the user is authenticated either via
 * Zustand store state or persistent client authentication cookies.
 */
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const { isAuthenticated, user } = useAuthStore.getState();
  if (isAuthenticated && user) return true;
  if (user) return true;
  try {
    const userCookie = getClientCookie(USER_COOKIE_NAME);
    if (userCookie) {
      const parsed = JSON.parse(userCookie);
      if (parsed && (parsed.email || parsed.id)) return true;
    }
    const tokenCookie = getClientCookie(AUTH_COOKIE_NAME);
    if (tokenCookie) return true;
  } catch {}
  return false;
}

/**
 * Checks if the user is authenticated. If not, redirects them to /login with
 * the return path preserved in the query string (?redirect=...).
 * Returns true if authenticated, false if redirected.
 */
export function checkAuthOrRedirect(
  router?: { push: (url: string) => void },
  redirectTarget?: string
): boolean {
  if (isUserAuthenticated()) return true;
  if (typeof window !== 'undefined') {
    const target = redirectTarget || (window.location.pathname + window.location.search);
    const loginUrl = `/login?redirect=${encodeURIComponent(target)}`;
    if (router && typeof router.push === 'function') {
      router.push(loginUrl);
    } else {
      window.location.href = loginUrl;
    }
  }
  return false;
}
