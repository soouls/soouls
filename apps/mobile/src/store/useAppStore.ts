import { create } from 'zustand';

interface AppState {
  isInitialized: boolean;
  theme: 'light' | 'dark' | 'system';
  setInitialized: (initialized: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  theme: 'system',
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setTheme: (theme) => set({ theme }),
}));
