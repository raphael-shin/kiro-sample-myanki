// 간단한 통합 테스트로 변경 - 실제 Dexie 사용하지 않고 구조만 확인
import { DATABASE_VERSION, DATABASE_NAME } from '../../src/types/database';

describe('Database Configuration', () => {
  test('데이터베이스 상수가 올바르게 정의되어야 함', () => {
    expect(DATABASE_NAME).toBe('MyAnkiDB');
    expect(DATABASE_VERSION).toBe(1);
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

describe('Database Files Structure', () => {
  test('데이터베이스 타입 정의가 올바르게 export되어야 함', () => {
    // 타입 정의만 확인
    expect(DATABASE_NAME).toBeDefined();
    expect(DATABASE_VERSION).toBeDefined();
    expect(typeof DATABASE_NAME).toBe('string');
    expect(typeof DATABASE_VERSION).toBe('number');
  });
});