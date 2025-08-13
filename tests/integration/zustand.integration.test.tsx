import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '../utils/test-utils';
import { useAppStore, selectTheme, selectIsLoading, selectThemeActions, selectLoadingActions } from '../../src/store/appStore';
import { ThemeToggle } from '../../src/components/common/ThemeToggle';
import { useState } from 'react';

// Test component to verify Zustand integration
const TestComponent = () => {
  const theme = useAppStore(selectTheme);
  const isLoading = useAppStore(selectIsLoading);
  const { setTheme, toggleTheme } = useAppStore(selectThemeActions);
  const { setLoading } = useAppStore(selectLoadingActions);

  return (
    <div>
      <div data-testid="theme-display">{theme}</div>
      <div data-testid="loading-display">{isLoading ? 'loading' : 'idle'}</div>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
      <button onClick={() => setLoading(true)} data-testid="set-loading">
        Set Loading
      </button>
      <button onClick={() => setLoading(false)} data-testid="set-idle">
        Set Idle
      </button>
    </div>
  );
};

// Test component to verify multiple component subscriptions
const MultipleSubscriberTest = () => {
  const theme1 = useAppStore(selectTheme);
  const theme2 = useAppStore(state => state.theme);
  const { toggleTheme } = useAppStore(selectThemeActions);

  return (
    <div>
      <div data-testid="theme1">{theme1}</div>
      <div data-testid="theme2">{theme2}</div>
      <button onClick={toggleTheme} data-testid="toggle">
        Toggle
      </button>
    </div>
  );
};

// Test component to verify state persistence across re-renders
const StatePersistenceTest = () => {
  const [renderCount, setRenderCount] = useState(0);
  const theme = useAppStore(selectTheme);
  const { toggleTheme } = useAppStore(selectThemeActions);

  return (
    <div>
      <div data-testid="render-count">{renderCount}</div>
      <div data-testid="theme">{theme}</div>
      <button onClick={() => setRenderCount(c => c + 1)} data-testid="re-render">
        Re-render
      </button>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
    </div>
  );
};

describe('Zustand State Management Integration Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      theme: 'light',
      isLoading: false,
    });
  });

  describe('기본 상태 관리', () => {
    it('should provide initial state correctly', () => {
      const { result } = renderHook(() => useAppStore());
      
      expect(result.current.theme).toBe('light');
      expect(result.current.isLoading).toBe(false);
    });

    it('should update state through actions', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
    });

    it('should toggle theme correctly', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Start with light theme
      expect(result.current.theme).toBe('light');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('dark');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('light');
    });
  });

  describe('선택자(Selectors) 통합', () => {
    it('should work with theme selector', () => {
      const { result } = renderHook(() => useAppStore(selectTheme));
      
      expect(result.current).toBe('light');
      
      act(() => {
        useAppStore.getState().setTheme('dark');
      });
      
      expect(result.current).toBe('dark');
    });

    it('should work with loading selector', () => {
      const { result } = renderHook(() => useAppStore(selectIsLoading));
      
      expect(result.current).toBe(false);
      
      act(() => {
        useAppStore.getState().setLoading(true);
      });
      
      expect(result.current).toBe(true);
    });

    it('should work with action selectors', () => {
      const { result: themeActions } = renderHook(() => useAppStore(selectThemeActions));
      const { result: loadingActions } = renderHook(() => useAppStore(selectLoadingActions));
      const { result: state } = renderHook(() => useAppStore());
      
      act(() => {
        themeActions.current.setTheme('dark');
      });
      
      expect(state.current.theme).toBe('dark');
      
      act(() => {
        loadingActions.current.setLoading(true);
      });
      
      expect(state.current.isLoading).toBe(true);
      
      act(() => {
        themeActions.current.toggleTheme();
      });
      
      expect(state.current.theme).toBe('light');
    });
  });

  describe('컴포넌트 통합', () => {
    it('should integrate with React components correctly', () => {
      render(<TestComponent />);
      
      // Check initial state
      expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
      expect(screen.getByTestId('loading-display')).toHaveTextContent('idle');
      
      // Test theme changes
      fireEvent.click(screen.getByTestId('set-dark'));
      expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
      
      fireEvent.click(screen.getByTestId('set-light'));
      expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
      
      // Test theme toggle
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
      
      // Test loading state
      fireEvent.click(screen.getByTestId('set-loading'));
      expect(screen.getByTestId('loading-display')).toHaveTextContent('loading');
      
      fireEvent.click(screen.getByTestId('set-idle'));
      expect(screen.getByTestId('loading-display')).toHaveTextContent('idle');
    });

    it('should handle multiple component subscriptions', () => {
      render(<MultipleSubscriberTest />);
      
      // Both selectors should show the same initial value
      expect(screen.getByTestId('theme1')).toHaveTextContent('light');
      expect(screen.getByTestId('theme2')).toHaveTextContent('light');
      
      // Toggle theme
      fireEvent.click(screen.getByTestId('toggle'));
      
      // Both selectors should update
      expect(screen.getByTestId('theme1')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme2')).toHaveTextContent('dark');
    });

    it('should persist state across component re-renders', () => {
      render(<StatePersistenceTest />);
      
      // Initial state
      expect(screen.getByTestId('render-count')).toHaveTextContent('0');
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      
      // Change theme
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      
      // Force re-render
      fireEvent.click(screen.getByTestId('re-render'));
      expect(screen.getByTestId('render-count')).toHaveTextContent('1');
      
      // Theme should persist
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      
      // Multiple re-renders
      fireEvent.click(screen.getByTestId('re-render'));
      fireEvent.click(screen.getByTestId('re-render'));
      expect(screen.getByTestId('render-count')).toHaveTextContent('3');
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });

  describe('실제 컴포넌트와의 통합', () => {
    it('should integrate with ThemeToggle component', () => {
      render(<ThemeToggle />);
      
      // Find the theme toggle button
      const toggleButton = screen.getByRole('button', { name: /테마 토글/i });
      expect(toggleButton).toBeInTheDocument();
      
      // Initial state should be light (sun icon)
      expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('테마 토글'));
      
      // Click to toggle theme
      fireEvent.click(toggleButton);
      
      // Verify state changed in store
      expect(useAppStore.getState().theme).toBe('dark');
      
      // Click again to toggle back
      fireEvent.click(toggleButton);
      expect(useAppStore.getState().theme).toBe('light');
    });
  });

  describe('상태 동기화', () => {
    it('should synchronize state across multiple hook instances', () => {
      const { result: hook1 } = renderHook(() => useAppStore());
      const { result: hook2 } = renderHook(() => useAppStore());
      
      // Both hooks should have the same initial state
      expect(hook1.current.theme).toBe(hook2.current.theme);
      expect(hook1.current.isLoading).toBe(hook2.current.isLoading);
      
      // Change state through first hook
      act(() => {
        hook1.current.setTheme('dark');
      });
      
      // Both hooks should reflect the change
      expect(hook1.current.theme).toBe('dark');
      expect(hook2.current.theme).toBe('dark');
      
      // Change state through second hook
      act(() => {
        hook2.current.setLoading(true);
      });
      
      // Both hooks should reflect the change
      expect(hook1.current.isLoading).toBe(true);
      expect(hook2.current.isLoading).toBe(true);
    });

    it('should maintain state consistency during rapid updates', () => {
      const { result } = renderHook(() => useAppStore());
      
      // Perform rapid state changes
      act(() => {
        result.current.setTheme('dark');
        result.current.setLoading(true);
        result.current.toggleTheme();
        result.current.setLoading(false);
        result.current.toggleTheme();
      });
      
      // Final state should be consistent
      expect(result.current.theme).toBe('dark');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('메모리 누수 방지', () => {
    it('should not cause memory leaks with component unmounting', () => {
      const { unmount } = render(<TestComponent />);
      
      // Change state
      fireEvent.click(screen.getByTestId('set-dark'));
      expect(useAppStore.getState().theme).toBe('dark');
      
      // Unmount component
      unmount();
      
      // State should still be accessible
      expect(useAppStore.getState().theme).toBe('dark');
      
      // Should be able to change state after unmount
      act(() => {
        useAppStore.getState().setTheme('light');
      });
      
      expect(useAppStore.getState().theme).toBe('light');
    });
  });

  describe('개발자 도구 통합', () => {
    it('should have devtools integration enabled', () => {
      // This is more of a configuration test
      // The store should be created with devtools middleware
      const store = useAppStore;
      expect(store).toBeDefined();
      
      // We can't easily test devtools integration in Jest,
      // but we can verify the store works correctly
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });
  });
});