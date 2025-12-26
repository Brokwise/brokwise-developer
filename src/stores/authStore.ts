import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Developer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  status: "pending" | "approved" | "blacklisted";
}

interface AuthState {
  developer: Developer | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (developer: Developer, token: string) => void;
  logout: () => void;
  setDeveloper: (developer: Developer) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      developer: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      login: (developer, token) =>
        set({
          developer,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          developer: null,
          token: null,
          isAuthenticated: false,
        }),
      setDeveloper: (developer) => set({ developer }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
