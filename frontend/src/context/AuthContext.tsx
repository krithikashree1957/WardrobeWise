import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistSession(user: User, accessToken: string, refreshToken: string) {
  localStorage.setItem('ww_access_token', accessToken);
  localStorage.setItem('ww_refresh_token', refreshToken);
  localStorage.setItem('ww_user', JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('ww_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('ww_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
      localStorage.setItem('ww_user', JSON.stringify(data.data.user));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user: u, accessToken, refreshToken } = data.data;
    persistSession(u, accessToken, refreshToken);
    setUser(u);
  };

  const loginWithGoogle = async (idToken: string) => {
    const { data } = await api.post('/auth/google', { idToken });
    const { user: u, accessToken, refreshToken } = data.data;
    persistSession(u, accessToken, refreshToken);
    setUser(u);
  };

  const register = async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/auth/register', payload);
    const { user: u, accessToken, refreshToken } = data.data;
    persistSession(u, accessToken, refreshToken);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('ww_access_token');
    localStorage.removeItem('ww_refresh_token');
    localStorage.removeItem('ww_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, loginWithGoogle, register, logout, refreshUser }}
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
