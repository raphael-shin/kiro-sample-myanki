import { renderHook } from '@testing-library/react';
import { useAppStore } from '../../src/store/appStore';
import { 
  getStoreState, 
  resetStore,
  createMockDB,
  createMockLocalStorage,
  createMockSetting,
  TEST_APP_STATES 
} from './index';

describe('Test Utilities', () => {
  describe('Store utilities', () => {
    afterEach(() => {
      resetStore();
    });

    it('should render with custom store state', () => {
      useAppStore.setState(TEST_APP_STATES.DARK_THEME);
      const { result } = renderHook(() => useAppStore());

      expect(result.current.theme).toBe('dark');
      expect(result.current.isLoading).toBe(false);
    });

    it('should get current store state', () => {
      useAppStore.setState(TEST_APP_STATES.LOADING);
      const state = getStoreState();
      
      expect(state.theme).toBe('light');
      expect(state.isLoading).toBe(true);
    });

    it('should reset store to initial state', () => {
      useAppStore.setState({ theme: 'dark', isLoading: true });
      resetStore();
      
      const state = getStoreState();
      expect(state.theme).toBe('light');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Mock utilities', () => {
    it('should create mock database', () => {
      const mockDB = createMockDB();
      
      expect(mockDB.settings.add).toBeDefined();
      expect(mockDB.settings.get).toBeDefined();
      expect(mockDB.open).toBeDefined();
      expect(mockDB.close).toBeDefined();
    });

    it('should create mock localStorage', () => {
      const mockStorage = createMockLocalStorage();
      
      mockStorage.setItem('test', 'value');
      expect(mockStorage.getItem('test')).toBe('value');
      
      mockStorage.removeItem('test');
      expect(mockStorage.getItem('test')).toBeNull();
    });
  });

  describe('Test data factories', () => {
    it('should create mock setting with defaults', () => {
      const setting = createMockSetting();
      
      expect(setting.key).toBe('test-key');
      expect(setting.value).toBe('test-value');
      expect(setting.createdAt).toBeInstanceOf(Date);
      expect(setting.updatedAt).toBeInstanceOf(Date);
    });

    it('should create mock setting with overrides', () => {
      const setting = createMockSetting({
        key: 'custom-key',
        value: 'custom-value'
      });
      
      expect(setting.key).toBe('custom-key');
      expect(setting.value).toBe('custom-value');
    });
  });
});