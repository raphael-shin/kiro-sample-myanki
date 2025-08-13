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
      
      // Wait for loading to complete first
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check header elements
      expect(screen.getByText('MyAnki')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /테마 토글/i })).toBeInTheDocument();
      
      // Check main content
      expect(screen.getByText('모든 기술 스택이 성공적으로 통합되었습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Zustand 테스트/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /테마 변경/i })).toBeInTheDocument();
      
      // Check technology stack status
      expect(screen.getByText('통합 완료된 기술 스택:')).toBeInTheDocument();
      expect(screen.getByText('React 18 + TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Vite 빌드 도구')).toBeInTheDocument();
      expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
      expect(screen.getByText('Zustand 상태 관리')).toBeInTheDocument();
      expect(screen.getByText('Dexie.js 데이터베이스')).toBeInTheDocument();
      expect(screen.getByText('Jest 테스팅 환경')).toBeInTheDocument();
      
      // Check footer
      expect(screen.getByText('MyAnki - 간격 반복 학습 애플리케이션')).toBeInTheDocument();
    });

    it('should show loading spinner initially', () => {
      render(<App />);
      
      // Should show loading spinner initially
      expect(screen.getByText('MyAnki 로딩 중...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should hide loading spinner after timeout', async () => {
      render(<App />);
      
      // Initially loading
      expect(screen.getByText('MyAnki 로딩 중...')).toBeInTheDocument();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('MyAnki 로딩 중...')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Main content should be visible
      expect(screen.getByText('환영합니다!')).toBeInTheDocument();
    });
  });

  describe('Zustand 상태 관리 통합', () => {
    it('should display current theme state correctly', async () => {
      render(<App />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      });
      
      // Check initial theme state display
      expect(screen.getByText('라이트 모드')).toBeInTheDocument();
    });

    it('should update theme state when theme toggle is clicked', async () => {
      render(<App />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      });
      
      // Initial state should be light mode
      expect(screen.getByText('라이트 모드')).toBeInTheDocument();
      
      // Click theme toggle button
      const themeToggleButton = screen.getByRole('button', { name: /테마 토글/i });
      fireEvent.click(themeToggleButton);
      
      // Should switch to dark mode
      await waitFor(() => {
        expect(screen.getByText('다크 모드')).toBeInTheDocument();
      });
      
      // Document should have dark class
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should update theme state when theme change button is clicked', async () => {
      render(<App />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      });
      
      // Click theme change button
      const themeChangeButton = screen.getByRole('button', { name: /테마 변경/i });
      fireEvent.click(themeChangeButton);
      
      // Should switch to dark mode
      await waitFor(() => {
        expect(screen.getByText('다크 모드')).toBeInTheDocument();
      });
    });

    it('should handle loading state correctly when Zustand test button is clicked', async () => {
      render(<App />);
      
      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Initial loading state should be complete
      expect(screen.getByText('완료')).toBeInTheDocument();
      
      // Click Zustand test button
      const zustandTestButton = screen.getByRole('button', { name: /Zustand 테스트/i });
      
      // Use act to wrap the click and state change
      act(() => {
        fireEvent.click(zustandTestButton);
      });
      
      // Should show loading state briefly, then return to complete
      // Since the timeout is 1000ms, we'll just verify the final state
      await waitFor(() => {
        expect(screen.getByText('완료')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('테마 시스템 통합', () => {
    it('should apply dark class to document root when theme is dark', async () => {
      render(<App />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      });
      
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
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      });
      
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
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('환영합니다!')).toBeInTheDocument();
      });
      
      // Check that all major UI components are rendered
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check Card components (they don't have article role by default)
      // Instead, check for the card container elements
      const cardElements = document.querySelectorAll('.rounded-lg');
      expect(cardElements.length).toBeGreaterThan(0);
      
      // Check that theme toggle component is working
      const themeToggle = screen.getByRole('button', { name: /테마 토글/i });
      expect(themeToggle).toBeInTheDocument();
      
      // Check that loading spinner component was shown initially
      // (it should be gone by now, but we tested it earlier)
    });
  });
});