import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AnyUser } from "@/types";

interface AuthState {
  user: AnyUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AnyUser, token: string) => void;
  setUser: (user: AnyUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      setUser: (user) =>
        set({ user }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "hrm-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
