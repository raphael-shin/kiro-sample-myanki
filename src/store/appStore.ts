import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState, Theme } from '../types/store';

/**
 * Main application store using Zustand
 * Manages global app state including theme and loading states
 */
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      theme: 'light',
      isLoading: false,

      // Actions
      setTheme: (theme: Theme) => {
        set({ theme }, false, 'setTheme');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'setLoading');
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme }, false, 'toggleTheme');
      },
    }),
    {
      name: 'app-store', // Store name for devtools
    }
  )
);

// Selectors for optimized component subscriptions
export const selectTheme = (state: AppState) => state.theme;
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectThemeActions = (state: AppState) => ({
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
});
export const selectLoadingActions = (state: AppState) => ({
  setLoading: state.setLoading,
});