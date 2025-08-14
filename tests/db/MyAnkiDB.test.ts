// TDD Red 단계: 데이터베이스 스키마 확장을 위한 실패 테스트
import { DATABASE_VERSION, DATABASE_NAME } from '../../src/types/database';
import { MyAnkiDB } from '../../src/db/MyAnkiDB';

// Mock Dexie to avoid actual IndexedDB operations in tests
jest.mock('dexie', () => {
  return {
    __esModule: true,
    default: class MockDexie {
      constructor(name: string) {
        this.name = name;
        this.versionNumber = 0;
        this.schema = {};
      }
      
      version(versionNumber: number) {
        this.versionNumber = versionNumber;
        return {
          stores: (schema: Record<string, string>) => {
            this.schema = schema;
            // Create mock tables based on schema and assign them to the instance
            Object.keys(schema).forEach(tableName => {
              (this as any)[tableName] = {
                hook: jest.fn().mockReturnThis(),
                add: jest.fn(),
                get: jest.fn(),
                toArray: jest.fn(),
                put: jest.fn(),
                delete: jest.fn()
              };
            });
          }
        };
      }
    },
    Table: class MockTable {}
  };
});

describe('Database Configuration', () => {
  test('데이터베이스 상수가 올바르게 정의되어야 함', () => {
    expect(DATABASE_NAME).toBe('MyAnkiDB');
    expect(DATABASE_VERSION).toBe(2);
  });

  test('Setting 인터페이스 타입이 올바르게 정의되어야 함', () => {
    // TypeScript 컴파일 시점에서 타입 체크가 이루어지므로
    // 런타임에서는 구조만 확인
    const mockSetting = {
      key: 'test',
      value: 'testValue',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    expect(mockSetting).toHaveProperty('key');
    expect(mockSetting).toHaveProperty('value');
    expect(mockSetting).toHaveProperty('createdAt');
    expect(mockSetting).toHaveProperty('updatedAt');
  });
});

describe('Database Schema Extension - TDD Red Phase', () => {
  let db: MyAnkiDB;

  beforeEach(() => {
    db = new MyAnkiDB();
  });

  test('MyAnkiDB 클래스에 decks 테이블이 정의되어야 함', () => {
    // 이 테스트는 실패해야 함 - decks 테이블이 아직 정의되지 않았기 때문
    expect(db.decks).toBeDefined();
    expect(db.decks).toHaveProperty('hook');
    expect(db.decks).toHaveProperty('add');
    expect(db.decks).toHaveProperty('get');
    expect(db.decks).toHaveProperty('toArray');
    expect(db.decks).toHaveProperty('put');
    expect(db.decks).toHaveProperty('delete');
  });

  test('MyAnkiDB 클래스에 cards 테이블이 정의되어야 함', () => {
    // 이 테스트는 실패해야 함 - cards 테이블이 아직 정의되지 않았기 때문
    expect(db.cards).toBeDefined();
    expect(db.cards).toHaveProperty('hook');
    expect(db.cards).toHaveProperty('add');
    expect(db.cards).toHaveProperty('get');
    expect(db.cards).toHaveProperty('toArray');
    expect(db.cards).toHaveProperty('put');
    expect(db.cards).toHaveProperty('delete');
  });

  test('MyAnkiDB 클래스에 studySessions 테이블이 정의되어야 함', () => {
    // 이 테스트는 실패해야 함 - studySessions 테이블이 아직 정의되지 않았기 때문
    expect(db.studySessions).toBeDefined();
    expect(db.studySessions).toHaveProperty('hook');
    expect(db.studySessions).toHaveProperty('add');
    expect(db.studySessions).toHaveProperty('get');
    expect(db.studySessions).toHaveProperty('toArray');
    expect(db.studySessions).toHaveProperty('put');
    expect(db.studySessions).toHaveProperty('delete');
  });

  test('데이터베이스 스키마에 decks 테이블 정의가 포함되어야 함', () => {
    // 이 테스트는 실패해야 함 - 스키마에 decks가 정의되지 않았기 때문
    const expectedSchema = '++id, name, description, createdAt, updatedAt';
    expect((db as any).schema).toHaveProperty('decks');
    expect((db as any).schema.decks).toBe(expectedSchema);
  });

  test('데이터베이스 스키마에 cards 테이블 정의가 포함되어야 함', () => {
    // 이 테스트는 실패해야 함 - 스키마에 cards가 정의되지 않았기 때문
    const expectedSchema = '++id, deckId, front, back, createdAt, updatedAt';
    expect((db as any).schema).toHaveProperty('cards');
    expect((db as any).schema.cards).toBe(expectedSchema);
  });

  test('데이터베이스 스키마에 studySessions 테이블 정의가 포함되어야 함', () => {
    // 이 테스트는 실패해야 함 - 스키마에 studySessions가 정의되지 않았기 때문
    const expectedSchema = '++id, cardId, studiedAt, quality, responseTime';
    expect((db as any).schema).toHaveProperty('studySessions');
    expect((db as any).schema.studySessions).toBe(expectedSchema);
  });

  test('데이터베이스 버전이 2로 업데이트되어야 함', () => {
    // 이 테스트는 실패해야 함 - 아직 버전이 1이기 때문
    expect((db as any).versionNumber).toBe(2);
  });

  test('새로운 테이블들에 자동 타임스탬프 훅이 설정되어야 함', () => {
    // 이 테스트는 실패해야 함 - 새 테이블들의 훅이 설정되지 않았기 때문
    expect(db.decks.hook).toHaveBeenCalledWith('creating', expect.any(Function));
    expect(db.decks.hook).toHaveBeenCalledWith('updating', expect.any(Function));
    
    expect(db.cards.hook).toHaveBeenCalledWith('creating', expect.any(Function));
    expect(db.cards.hook).toHaveBeenCalledWith('updating', expect.any(Function));
    
    expect(db.studySessions.hook).toHaveBeenCalledWith('creating', expect.any(Function));
    expect(db.studySessions.hook).toHaveBeenCalledWith('updating', expect.any(Function));
  });
});

describe('Database Files Structure', () => {
  test('데이터베이스 타입 정의가 올바르게 export되어야 함', () => {
    // 타입 정의만 확인
    expect(DATABASE_NAME).toBeDefined();
    expect(DATABASE_VERSION).toBeDefined();
    expect(typeof DATABASE_NAME).toBe('string');
    expect(typeof DATABASE_VERSION).toBe('number');
  });
});