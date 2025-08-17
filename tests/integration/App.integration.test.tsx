import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { act } from '@testing-library/react';
import App from '../../src/App';
import { useAppStore } from '../../src/store/appStore';

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      theme: 'light',
      isLoading: false,
    });
    
    // Clear any existing classes on document root
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    // Clean up after each test
    document.documentElement.classList.remove('dark');
  });

  describe('기본 렌더링', () => {
    it('should render main app components correctly', async () => {
      render(<App />);
      
      // Check header elements
      expect(screen.getByText('MyAnki')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /테마 토글/i })).toBeInTheDocument();
      
      // Check main app title
      expect(screen.getByRole('heading', { name: /MyAnki/i })).toBeInTheDocument();
      
      // Check main content - deck management page (use heading role to be specific)
      expect(screen.getByRole('heading', { name: '덱 관리' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /새 덱 만들기/i })).toBeInTheDocument();
      
      // Wait for deck loading to complete and check empty state
      await waitFor(() => {
        expect(screen.getByText('No decks found. Create your first deck to get started!')).toBeInTheDocument();
      });
    });

    it('should show main content by default', () => {
      render(<App />);
      
      // Should show main content immediately (no loading state by default)
      expect(screen.getByRole('heading', { name: '덱 관리' })).toBeInTheDocument();
      expect(screen.queryByText('MyAnki 로딩 중...')).not.toBeInTheDocument();
    });
  });

  describe('Zustand 상태 관리 통합', () => {
    it('should display current theme state correctly', async () => {
      render(<App />);
      
      // Check that theme toggle button is present
      expect(screen.getByRole('button', { name: /테마 토글/i })).toBeInTheDocument();
      
      // Check that the app is in light mode initially (no dark class)
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update theme state when theme toggle is clicked', async () => {
      render(<App />);
      
      // Initial state should be light mode
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      
      // Click theme toggle button
      const themeToggleButton = screen.getByRole('button', { name: /테마 토글/i });
      fireEvent.click(themeToggleButton);
      
      // Should switch to dark mode
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should handle navigation correctly', async () => {
      render(<App />);
      
      // Check initial state - deck management is the default view
      expect(screen.getByRole('heading', { name: /덱 관리/i })).toBeInTheDocument();
      
      // Navigation is now completely removed - all actions via deck cards
      expect(screen.getByRole('heading', { name: /MyAnki/i })).toBeInTheDocument();
    });
  });

  describe('테마 시스템 통합', () => {
    it('should apply dark class to document root when theme is dark', async () => {
      render(<App />);
      
      // Initially should not have dark class
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      
      // Change to dark theme
      act(() => {
        useAppStore.getState().setTheme('dark');
      });
      
      // Should apply dark class to document root
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should remove dark class from document root when theme is light', async () => {
      // Start with dark theme
      act(() => {
        useAppStore.getState().setTheme('dark');
      });
      
      render(<App />);
      
      // Should have dark class initially
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      // Change to light theme
      act(() => {
        useAppStore.getState().setTheme('light');
      });
      
      // Should remove dark class from document root
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('컴포넌트 통합', () => {
    it('should integrate all UI components correctly', async () => {
      render(<App />);
      
      // Check that all major UI components are rendered
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check main app components - navigation removed
      expect(screen.getByRole('heading', { name: /MyAnki/i })).toBeInTheDocument();
      
      // Check that theme toggle component is working
      const themeToggle = screen.getByRole('button', { name: /테마 토글/i });
      expect(themeToggle).toBeInTheDocument();
      
      // Check main content area (use heading role to be specific)
      expect(screen.getByRole('heading', { name: '덱 관리' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /새 덱 만들기/i })).toBeInTheDocument();
    });
  });
});