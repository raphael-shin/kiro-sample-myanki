import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../../src/store/appStore';

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      theme: 'light',
      isLoading: false,
    });
  });

  describe('theme management', () => {
    it('should have light theme as default', () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.theme).toBe('light');
    });

    it('should set theme correctly', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should toggle theme correctly', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Start with light theme
      expect(result.current.theme).toBe('light');
      
      // Toggle to dark
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('dark');
      
      // Toggle back to light
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('light');
    });
  });

  describe('loading state management', () => {
    it('should have loading false as default', () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state correctly', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
      
      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('selectors', () => {
    it('should select theme correctly', () => {
      const { result } = renderHook(() => useAppStore((state) => state.theme));
      expect(result.current).toBe('light');
    });

    it('should select loading state correctly', () => {
      const { result } = renderHook(() => useAppStore((state) => state.isLoading));
      expect(result.current).toBe(false);
    });
  });
});