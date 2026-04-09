import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthAPI, AppUser, setAuthToken } from '../api/api';

const ACCESS_KEY  = 'auth_access';
const REFRESH_KEY = 'auth_refresh';
const USER_KEY    = 'auth_user';

interface AuthContextType {
  user:         AppUser | null;
  loading:      boolean;
  isManager:    boolean;
  isTechnician: boolean;
  login:  (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user:         null,
  loading:      true,
  isManager:    false,
  isTechnician: false,
  login:  async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, userRaw] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (token && userRaw) {
          setAuthToken(token);
          setUser(JSON.parse(userRaw));
        }
      } catch (e) {
        console.warn('[AuthContext] rehydration failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (access: string, refresh: string, user: AppUser) => {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY,  access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
      SecureStore.setItemAsync(USER_KEY,    JSON.stringify(user)),
    ]);
    setAuthToken(access);
    setUser(user);
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { access, refresh, user } = await AuthAPI.login(email.trim(), password);
      await persist(access, refresh, user);
      return { success: true };
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? 'Login failed. Please try again.';
      return { success: false, error: msg };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { access, refresh, user } = await AuthAPI.signup(name, email, password);
      await persist(access, refresh, user);
      return { success: true };
    } catch (e: any) {
      console.log('SIGNUP ERROR:', JSON.stringify(e?.response?.data));
      const msg = e?.response?.data?.detail ?? e?.message ?? 'Sign up failed.';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthAPI.logout().catch(() => {});
    } finally {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_KEY),
        SecureStore.deleteItemAsync(REFRESH_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      isManager:    user?.role === 'manager',
      isTechnician: user?.role === 'technician',
      login, signup, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);