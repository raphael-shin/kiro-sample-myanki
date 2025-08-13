// Test data factories for consistent test data generation

import type { Setting } from '../../src/types/database';

// Factory for creating mock settings
export const createMockSetting = (overrides?: Partial<Setting>): Setting => ({
  key: 'test-key',
  value: 'test-value',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Factory for creating multiple mock settings
export const createMockSettings = (count: number, overrides?: Partial<Setting>): Setting[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockSetting({
      key: `test-key-${index}`,
      value: `test-value-${index}`,
      ...overrides,
    })
  );
};

// Common test themes
export const TEST_THEMES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
};

// Common test states for app store
export const TEST_APP_STATES = {
  INITIAL: {
    theme: TEST_THEMES.LIGHT,
    isLoading: false,
  },
  LOADING: {
    theme: TEST_THEMES.LIGHT,
    isLoading: true,
  },
  DARK_THEME: {
    theme: TEST_THEMES.DARK,
    isLoading: false,
  },
} as const;

// Helper to create test IDs for components
export const createTestId = (component: string, element?: string) => {
  return element ? `${component}-${element}` : component;
};

// Common test selectors
export const TEST_SELECTORS = {
  THEME_TOGGLE: 'theme-toggle',
  LOADING_SPINNER: 'loading-spinner',
  APP_CONTAINER: 'app-container',
} as const;