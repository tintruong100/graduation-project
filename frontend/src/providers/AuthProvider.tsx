"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { fetchClient } from "@/lib/fetch/client";
import type { AuthUser, AnyUser } from "@/types";

interface AuthContextValue {
  user: AnyUser | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, token, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();
  const hasFetched = useRef(false);

  // Sync server user state on mount (verify token is still valid)
  useEffect(() => {
    if (!isAuthenticated || hasFetched.current) return;
    hasFetched.current = true;

    fetchClient
      .get<AuthUser>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token invalid → clear local state; layout/middleware will redirect
        storeLogout();
        document.cookie = "hrm-token=; path=/; max-age=0";
      });
  }, [isAuthenticated, setUser, storeLogout]);

  const logout = () => {
    storeLogout();
    // Remove the auth cookie used by proxy middleware
    document.cookie = "hrm-token=; path=/; max-age=0";
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
