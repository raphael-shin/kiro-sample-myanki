// Mock utilities for testing

// Mock Dexie database for testing
export const createMockDB = () => {
  const mockTable = {
    add: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue(undefined),
    put: jest.fn().mockResolvedValue(1),
    delete: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    toArray: jest.fn().mockResolvedValue([]),
    where: jest.fn().mockReturnThis(),
    equals: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(undefined),
  };

  return {
    settings: mockTable,
    open: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    isOpen: jest.fn().mockReturnValue(true),
  };
};

// Mock localStorage for testing
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: jest.fn(),
  };
};

// Mock console methods for testing
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

// Helper to wait for async operations in tests
export const waitForTimeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock timer utilities
export const mockTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
};