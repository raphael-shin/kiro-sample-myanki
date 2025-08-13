/**
 * TypeScript type definitions for Zustand store
 */

export type Theme = 'light' | 'dark';

export interface AppState {
  // UI State
  theme: Theme;
  isLoading: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
}