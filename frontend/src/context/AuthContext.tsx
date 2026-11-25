'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/lib/api';
import { useRouteLoader } from '@/context/RouteLoaderContext';
import type { AuthResponse, User } from '@/types/api';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(raw: User): User {
  return {
    ...raw,
    _id: raw._id || raw.id || '',
    id: raw.id || raw._id || '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startNavigation } = useRouteLoader();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistAuth = useCallback((authData: AuthResponse) => {
    const normalized = normalizeUser(authData.user);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, authData.token);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    setToken(authData.token);
    setUser(normalized);
    return normalized;
  }, []);

  const clearAuth = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUserRaw = window.localStorage.getItem(USER_STORAGE_KEY);

        if (!storedToken) {
          if (active) {
            setIsLoading(false);
          }
          return;
        }

        if (storedUserRaw) {
          try {
            const parsedUser = normalizeUser(JSON.parse(storedUserRaw) as User);
            if (active) {
              setToken(storedToken);
              setUser(parsedUser);
            }
          } catch {
            // Ignore malformed cached user; /auth/me will refresh
          }
        }

        const res = await api.get<{ user: User }>('/auth/me');
        if (active && res.data?.user) {
          const freshUser = normalizeUser(res.data.user);
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
          setToken(storedToken);
          setUser(freshUser);
        }
      } catch {
        if (active) {
          clearAuth();
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [clearAuth]);

  const login = useCallback(
    async (input: LoginInput): Promise<User> => {
      const res = await api.post<AuthResponse>('/auth/login', input);
      const loggedInUser = persistAuth(res.data);
      const target = loggedInUser.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      startNavigation(target);
      router.replace(target);
      return loggedInUser;
    },
    [persistAuth, router, startNavigation]
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<User> => {
      const res = await api.post<AuthResponse>('/auth/register', input);
      const registeredUser = persistAuth(res.data);
      startNavigation('/dashboard');
      router.replace('/dashboard');
      return registeredUser;
    },
    [persistAuth, router, startNavigation]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clear local session even if token already expired
    } finally {
      clearAuth();
      startNavigation('/login');
      router.replace('/login');
    }
  }, [clearAuth, router, startNavigation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

