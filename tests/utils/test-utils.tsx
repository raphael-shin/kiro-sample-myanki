import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { useAppStore } from '../../src/store/appStore';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test utilities for Zustand store
export const renderWithStore = (
  ui: ReactElement,
  initialState?: Partial<ReturnType<typeof useAppStore.getState>>,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Reset store before each test
  useAppStore.setState({
    theme: 'light',
    isLoading: false,
    ...initialState,
  });

  return customRender(ui, options);
};

// Helper to get current store state in tests
export const getStoreState = () => useAppStore.getState();

// Helper to reset store to initial state
export const resetStore = () => {
  useAppStore.setState({
    theme: 'light',
    isLoading: false,
  });
};