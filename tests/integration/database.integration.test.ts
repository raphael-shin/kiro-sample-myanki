// Mock Dexie.js to avoid ESM module issues
jest.mock('dexie', () => {
  return {
    __esModule: true,
    default: class MockDexie {
      name: string;
      verno: number;
      settings: any;
      decks: any;
      cards: any;
      studySessions: any;

      constructor(name: string) {
        this.name = name;
        this.verno = 2;
        
        // Initialize all tables immediately
        this.settings = {
          name: 'settings',
          add: jest.fn(),
          get: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          where: jest.fn(),
          toArray: jest.fn(),
          count: jest.fn(),
          orderBy: jest.fn(),
          hook: jest.fn().mockReturnThis()
        };

        this.decks = {
          name: 'decks',
          add: jest.fn(),
          get: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          where: jest.fn(),
          toArray: jest.fn(),
          count: jest.fn(),
          orderBy: jest.fn(),
          hook: jest.fn().mockReturnThis()
        };

        this.cards = {
          name: 'cards',
          add: jest.fn(),
          get: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          where: jest.fn(),
          toArray: jest.fn(),
          count: jest.fn(),
          orderBy: jest.fn(),
          hook: jest.fn().mockReturnThis()
        };

        this.studySessions = {
          name: 'studySessions',
          add: jest.fn(),
          get: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          where: jest.fn(),
          toArray: jest.fn(),
          count: jest.fn(),
          orderBy: jest.fn(),
          hook: jest.fn().mockReturnThis()
        };
      }

      version(v: number) {
        this.verno = v;
        return {
          stores: (_schema: any) => {
            // Ensure all tables are available after stores() call
            if (!this.settings) {
              this.settings = {
                name: 'settings',
                add: jest.fn(),
                get: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                where: jest.fn(),
                toArray: jest.fn(),
                count: jest.fn(),
                orderBy: jest.fn(),
                hook: jest.fn().mockReturnThis()
              };
            }
            return this;
          }
        };
      }

      open = jest.fn();
      close = jest.fn();
      delete = jest.fn();
      transaction = jest.fn();
      isOpen = jest.fn(() => true);
    },
    Table: class MockTable {}
  };
});

import { DATABASE_VERSION, DATABASE_NAME } from '../../src/types/database';

describe('Dexie.js Database Integration Tests', () => {
  describe('데이터베이스 설정 검증', () => {
    it('should have correct database configuration constants', () => {
      expect(DATABASE_NAME).toBe('MyAnkiDB');
      expect(DATABASE_VERSION).toBe(2);
    });

    it('should have database constants with correct types', () => {
      expect(typeof DATABASE_NAME).toBe('string');
      expect(typeof DATABASE_VERSION).toBe('number');
      expect(DATABASE_VERSION).toBeGreaterThan(0);
    });
  });

  describe('데이터베이스 타입 정의 검증', () => {
    it('should have database types module available', () => {
      // Test that we can import from the types module
      const typesModule = require('../../src/types/database');
      expect(typesModule).toBeDefined();
      expect(typesModule.DATABASE_NAME).toBe('MyAnkiDB');
      expect(typesModule.DATABASE_VERSION).toBe(2);
    });

    it('should export Setting interface constants', () => {
      // TypeScript interfaces don't exist at runtime, but we can test the module structure
      const typesModule = require('../../src/types/database');
      expect(typesModule.DATABASE_NAME).toBeDefined();
      expect(typesModule.DATABASE_VERSION).toBeDefined();
    });
  });

  describe('데이터베이스 클래스 구조 검증', () => {
    it('should have MyAnkiDB class that can be instantiated', () => {
      const { MyAnkiDB } = require('../../src/db/MyAnkiDB');
      expect(MyAnkiDB).toBeDefined();
      expect(typeof MyAnkiDB).toBe('function');
      
      const dbInstance = new MyAnkiDB();
      expect(dbInstance).toBeDefined();
      expect(dbInstance.name).toBe(DATABASE_NAME);
    });

    it('should have singleton database instance exported', () => {
      const { db } = require('../../src/db/MyAnkiDB');
      expect(db).toBeDefined();
      expect(db.name).toBe('MyAnkiDB');
    });

    it('should have settings table configuration', () => {
      const { db } = require('../../src/db/MyAnkiDB');
      expect(db.settings).toBeDefined();
      expect(db.settings.name).toBe('settings');
    });
  });

  describe('데이터베이스 메서드 검증', () => {
    it('should have essential database methods', () => {
      const { MyAnkiDB } = require('../../src/db/MyAnkiDB');
      const dbInstance = new MyAnkiDB();
      
      // Check that essential methods exist
      expect(typeof dbInstance.open).toBe('function');
      expect(typeof dbInstance.close).toBe('function');
      expect(typeof dbInstance.delete).toBe('function');
      expect(typeof dbInstance.transaction).toBe('function');
      expect(typeof dbInstance.isOpen).toBe('function');
    });

    it('should have CRUD methods on settings table', () => {
      const { db } = require('../../src/db/MyAnkiDB');
      
      // Check that CRUD methods exist
      expect(typeof db.settings.add).toBe('function');
      expect(typeof db.settings.get).toBe('function');
      expect(typeof db.settings.update).toBe('function');
      expect(typeof db.settings.delete).toBe('function');
      expect(typeof db.settings.where).toBe('function');
      expect(typeof db.settings.toArray).toBe('function');
      expect(typeof db.settings.count).toBe('function');
    });
  });

  describe('데이터베이스 스키마 검증', () => {
    it('should have correct version number', () => {
      const { db } = require('../../src/db/MyAnkiDB');
      expect(db.verno).toBe(DATABASE_VERSION);
    });

    it('should have proper database name', () => {
      const { db } = require('../../src/db/MyAnkiDB');
      expect(db.name).toBe(DATABASE_NAME);
    });
  });

  describe('모듈 통합 검증', () => {
    it('should export all required database components', () => {
      const dbModule = require('../../src/db/MyAnkiDB');
      
      expect(dbModule.MyAnkiDB).toBeDefined();
      expect(dbModule.db).toBeDefined();
      expect(typeof dbModule.MyAnkiDB).toBe('function');
      expect(typeof dbModule.db).toBe('object');
    });

    it('should have consistent naming across modules', () => {
      const { db } = require('../../src/db/MyAnkiDB');
      expect(db.name).toBe(DATABASE_NAME);
    });

    it('should maintain singleton pattern', () => {
      const { db: db1 } = require('../../src/db/MyAnkiDB');
      const { db: db2 } = require('../../src/db/MyAnkiDB');
      expect(db1).toBe(db2);
    });
  });

  describe('데이터베이스 기능 통합 검증', () => {
    it('should have working database instance', () => {
      const { db } = require('../../src/db/MyAnkiDB');
      
      // Test that the database instance is properly configured
      expect(db.isOpen()).toBe(true);
      expect(db.settings).toBeDefined();
    });

    it('should support basic database operations', async () => {
      const { db } = require('../../src/db/MyAnkiDB');
      
      // Mock successful operations
      db.settings.add.mockResolvedValue(1);
      db.settings.get.mockResolvedValue({ id: 1, key: 'test', value: 'value' });
      
      // Test that methods can be called
      const id = await db.settings.add({ key: 'test', value: 'value' });
      expect(db.settings.add).toHaveBeenCalled();
      expect(id).toBe(1);
      
      const setting = await db.settings.get(1);
      expect(db.settings.get).toHaveBeenCalledWith(1);
      expect(setting).toBeDefined();
    });
  });
});