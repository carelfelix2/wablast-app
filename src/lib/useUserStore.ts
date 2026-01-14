import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  apiKey?: string;
}

export interface UserStore {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  updateApiKey: (apiKey: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
      updateApiKey: (apiKey: string) => {
        const state = get();
        if (state.user) {
          set({ user: { ...state.user, apiKey } });
        }
      },
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
