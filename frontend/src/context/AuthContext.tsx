'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DemoUser } from '@/lib/types';
import { loginUser, registerUser, fetchCurrentUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickLogin: (demoUser: DemoUser) => Promise<void>;
  register: (userData: { email: string; password: string; name: string; role?: string; hospital?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'pt_jwt_token';
const USER_KEY = 'pt_user_profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Validate token with backend
          try {
            const meRes = await fetchCurrentUser(storedToken);
            if (meRes?.user) {
              setUser(meRes.user);
              localStorage.setItem(USER_KEY, JSON.stringify(meRes.user));
            }
          } catch {
            // If backend rejects token or offline, preserve stored user or fallback
          }
        } else {
          // Default initial session for hackathon demo convenience
          const defaultDemoUser: User = {
            id: "DOC-001",
            email: "rohit.sharma@metro.health",
            name: "Dr. Rohit Sharma, MD",
            role: "Lead Emergency Physician",
            hospital: "Metro Level I Trauma",
            avatar: "/doctors/dr_rohit_sharma.jpg",
            badge: "Senior Attending"
          };
          setUser(defaultDemoUser);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (demoUser: DemoUser) => {
    return login(demoUser.email, demoUser.password);
  };

  const register = async (userData: { email: string; password: string; name: string; role?: string; hospital?: string }) => {
    setIsLoading(true);
    try {
      const res = await registerUser(userData);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        quickLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
