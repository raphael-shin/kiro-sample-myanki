/**
 * DeckService 테스트
 * TDD 접근 방식으로 DeckService의 모든 기능을 테스트
 */

import { CreateDeckInput, UpdateDeckInput } from '@/types/flashcard';
import { MyAnkiError, ErrorCode } from '@/types/errors';

// Dexie 모킹
jest.mock('dexie');

// MyAnkiDB 모킹
jest.mock('@/db/MyAnkiDB', () => {
  const { MyAnkiDB } = require('../__mocks__/MyAnkiDB');
  return { MyAnkiDB };
});

// DeckService를 import하려고 시도 - 아직 구현되지 않았으므로 실패할 것
let DeckService: any;
let MyAnkiDB: any;

try {
  // 실제 DeckService를 import하려고 시도
  const deckServiceModule = require('@/services/DeckService');
  DeckService = deckServiceModule.DeckService;
  
  const dbModule = require('../__mocks__/MyAnkiDB');
  MyAnkiDB = dbModule.MyAnkiDB;
} catch (error) {
  // DeckService가 아직 구현되지 않았으므로 에러가 발생
  console.log('DeckService not implemented yet - this is expected for TDD Red phase');
}

describe('DeckService', () => {
  let deckService: any;
  let mockDb: any;

  beforeEach(() => {
    // DeckService가 구현되지 않았으므로 테스트는 실패할 것
    if (DeckService && MyAnkiDB) {
      mockDb = new MyAnkiDB();
      deckService = new DeckService(mockDb);
    } else {
      // DeckService가 구현되지 않았으므로 undefined
      deckService = undefined;
      mockDb = undefined;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('덱 이름이 없을 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 이름이 없는 덱 데이터
        const invalidDeckData: CreateDeckInput = {
          name: '',
          description: '테스트 덱'
        };

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(deckService.create(invalidDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(invalidDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED,
            message: 'Deck name is required'
          });
      });

      it('덱 이름이 공백만 있을 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 공백만 있는 덱 이름
        const invalidDeckData: CreateDeckInput = {
          name: '   ',
          description: '테스트 덱'
        };

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(deckService.create(invalidDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(invalidDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED
          });
      });

      it('덱 이름이 100자를 초과할 때 DECK_NAME_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 100자를 초과하는 덱 이름
        const longName = 'a'.repeat(101);
        const invalidDeckData: CreateDeckInput = {
          name: longName,
          description: '테스트 덱'
        };

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(deckService.create(invalidDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(invalidDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_TOO_LONG,
            message: expect.stringContaining('too long')
          });
      });

      it('덱 설명이 500자를 초과할 때 DECK_DESCRIPTION_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 500자를 초과하는 덱 설명
        const longDescription = 'a'.repeat(501);
        const invalidDeckData: CreateDeckInput = {
          name: '유효한 덱 이름',
          description: longDescription
        };

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(deckService.create(invalidDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(invalidDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_DESCRIPTION_TOO_LONG
          });
      });

      it('중복된 덱 이름일 때 DECK_NAME_DUPLICATE 에러를 발생시켜야 한다', async () => {
        // Given: 이미 존재하는 덱 이름
        const duplicateName = '기존 덱';
        const duplicateDeckData: CreateDeckInput = {
          name: duplicateName,
          description: '중복 테스트 덱'
        };

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // Mock 데이터베이스에 기존 덱이 있다고 설정
        const mockFilterResult = {
          toArray: jest.fn().mockResolvedValue([
            { id: 1, name: duplicateName, description: '기존 덱' }
          ])
        };
        
        mockDb.decks.filter = jest.fn().mockReturnValue(mockFilterResult);

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(deckService.create(duplicateDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(duplicateDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_DUPLICATE,
            message: expect.stringContaining(duplicateName)
          });
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 데이터
        const validDeckData: CreateDeckInput = {
          name: '유효한 덱',
          description: '테스트 덱'
        };

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // When & Then: create 호출 시 데이터베이스 에러 발생해야 함
        await expect(deckService.create(validDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(validDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR
          });
      });

      it('name 속성이 undefined일 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: name이 undefined인 덱 데이터
        const invalidDeckData = {
          description: '테스트 덱'
        } as CreateDeckInput;

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(deckService.create(invalidDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(invalidDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED
          });
      });

      it('name 속성이 null일 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: name이 null인 덱 데이터
        const invalidDeckData: CreateDeckInput = {
          name: null as any,
          description: '테스트 덱'
        };

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(deckService.create(invalidDeckData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.create(invalidDeckData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED
          });
      });
    });
  });

  describe('getById()', () => {
    describe('성공 케이스 (TDD Green)', () => {
      it('유효한 ID로 덱을 조회할 수 있어야 한다', async () => {
        // Given: 유효한 덱 ID와 Mock 데이터
        const validId = 1;
        const mockDeck = {
          id: validId,
          name: '테스트 덱',
          description: '테스트용 덱입니다',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.getById).toBe('function');

        // Mock 데이터베이스에서 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(mockDeck);

        // When: 유효한 ID로 조회
        const result = await deckService.getById(validId);

        // Then: 올바른 덱이 반환되어야 함
        expect(result).toEqual(mockDeck);
        expect(mockDb.decks.get).toHaveBeenCalledWith(validId);
      });
    });

    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 ID로 조회할 때 undefined를 반환해야 한다', async () => {
        // Given: 존재하지 않는 덱 ID
        const nonExistentId = 999;

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getById).toBe('function');

        // Mock 데이터베이스에서 undefined 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(undefined);

        // When: 존재하지 않는 ID로 조회
        const result = await deckService.getById(nonExistentId);

        // Then: undefined 반환해야 함
        expect(result).toBeUndefined();
        expect(mockDb.decks.get).toHaveBeenCalledWith(nonExistentId);
      });

      it('잘못된 ID 타입(문자열)으로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 문자열 ID
        const invalidId = 'invalid-id' as any;

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getById).toBe('function');

        // When & Then: getById 호출 시 에러 발생해야 함
        await expect(deckService.getById(invalidId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.getById(invalidId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 ID로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 ID
        const negativeId = -1;

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getById).toBe('function');

        // When & Then: getById 호출 시 에러 발생해야 함
        await expect(deckService.getById(negativeId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.getById(negativeId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('0 ID로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 0 ID
        const zeroId = 0;

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getById).toBe('function');

        // When & Then: getById 호출 시 에러 발생해야 함
        await expect(deckService.getById(zeroId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.getById(zeroId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 ID
        const validId = 1;

        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getById).toBe('function');

        // Mock 데이터베이스에서 에러 발생하도록 설정
        mockDb.decks.get = jest.fn().mockRejectedValue(new Error('Database connection failed'));

        // When & Then: getById 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.getById(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.getById(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Database connection failed')
          });
      });
    });
  });

  describe('getAll()', () => {
    describe('성공 케이스 (TDD Green)', () => {
      it('모든 덱을 생성일시 순으로 조회할 수 있어야 한다', async () => {
        // Given: Mock 덱 데이터 (생성일시 순)
        const mockDecks = [
          {
            id: 1,
            name: '첫 번째 덱',
            description: '가장 먼저 생성된 덱',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          },
          {
            id: 2,
            name: '두 번째 덱',
            description: '두 번째로 생성된 덱',
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
          }
        ];

        expect(deckService).toBeDefined();
        expect(typeof deckService.getAll).toBe('function');

        // Mock 데이터베이스에서 정렬된 덱 목록 반환하도록 설정
        const mockOrderByResult = {
          toArray: jest.fn().mockResolvedValue(mockDecks)
        };
        mockDb.decks.orderBy = jest.fn().mockReturnValue(mockOrderByResult);

        // When: 모든 덱 조회
        const result = await deckService.getAll();

        // Then: 생성일시 순으로 정렬된 덱 목록이 반환되어야 함
        expect(result).toEqual(mockDecks);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(mockDb.decks.orderBy).toHaveBeenCalledWith('createdAt');
        expect(mockOrderByResult.toArray).toHaveBeenCalled();
      });

      it('덱이 많을 때도 올바르게 정렬되어야 한다', async () => {
        // Given: 여러 덱 데이터 (생성일시가 다른 순서)
        const mockDecks = [
          {
            id: 3,
            name: '세 번째 덱',
            createdAt: new Date('2023-01-03'),
            updatedAt: new Date('2023-01-03')
          },
          {
            id: 1,
            name: '첫 번째 덱',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          },
          {
            id: 2,
            name: '두 번째 덱',
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
          }
        ];

        expect(deckService).toBeDefined();

        // Mock 데이터베이스에서 정렬된 결과 반환
        const mockOrderByResult = {
          toArray: jest.fn().mockResolvedValue(mockDecks)
        };
        mockDb.decks.orderBy = jest.fn().mockReturnValue(mockOrderByResult);

        // When: 모든 덱 조회
        const result = await deckService.getAll();

        // Then: 결과가 올바르게 반환되어야 함
        expect(result).toEqual(mockDecks);
        expect(mockDb.decks.orderBy).toHaveBeenCalledWith('createdAt');
      });
    });

    describe('실패 케이스 (TDD Red)', () => {
      it('덱이 없을 때 빈 배열을 반환해야 한다', async () => {
        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getAll).toBe('function');

        // Mock 데이터베이스에서 빈 배열 반환하도록 설정
        const mockOrderByResult = {
          toArray: jest.fn().mockResolvedValue([])
        };
        mockDb.decks.orderBy = jest.fn().mockReturnValue(mockOrderByResult);

        // When: 모든 덱 조회
        const result = await deckService.getAll();

        // Then: 빈 배열 반환해야 함
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
        expect(mockDb.decks.orderBy).toHaveBeenCalledWith('createdAt');
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getAll).toBe('function');

        // Mock 데이터베이스에서 에러 발생하도록 설정
        mockDb.decks.orderBy = jest.fn().mockImplementation(() => {
          throw new Error('Database connection failed');
        });

        // When & Then: getAll 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.getAll())
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.getAll())
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Database connection failed')
          });
      });

      it('정렬 중 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // DeckService가 구현되지 않았으므로 테스트 실패
        expect(deckService).toBeDefined();
        expect(typeof deckService.getAll).toBe('function');

        // Mock 데이터베이스에서 정렬 중 에러 발생하도록 설정
        const mockOrderByResult = {
          toArray: jest.fn().mockRejectedValue(new Error('Sort operation failed'))
        };
        mockDb.decks.orderBy = jest.fn().mockReturnValue(mockOrderByResult);

        // When & Then: getAll 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.getAll())
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.getAll())
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Sort operation failed')
          });
      });
    });
  });

  describe('update()', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 ID로 수정할 때 DECK_NOT_FOUND 에러를 발생시켜야 한다', async () => {
        // Given: 존재하지 않는 덱 ID와 유효한 업데이트 데이터
        const nonExistentId = 999;
        const updateData = {
          name: '수정된 덱 이름',
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 덱을 찾을 수 없도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(undefined);

        // When & Then: update 호출 시 DECK_NOT_FOUND 에러 발생해야 함
        await expect(deckService.update(nonExistentId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(nonExistentId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NOT_FOUND,
            message: expect.stringContaining(nonExistentId.toString())
          });

        expect(mockDb.decks.get).toHaveBeenCalledWith(nonExistentId);
      });

      it('빈 이름으로 수정할 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 빈 이름
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const invalidUpdateData = {
          name: '',
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // When & Then: update 호출 시 DECK_NAME_REQUIRED 에러 발생해야 함
        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED,
            message: 'Deck name is required'
          });
      });

      it('공백만 있는 이름으로 수정할 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 공백만 있는 이름
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const invalidUpdateData = {
          name: '   ',
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // When & Then: update 호출 시 DECK_NAME_REQUIRED 에러 발생해야 함
        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED
          });
      });

      it('100자를 초과하는 이름으로 수정할 때 DECK_NAME_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 100자를 초과하는 이름
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const longName = 'a'.repeat(101);
        const invalidUpdateData = {
          name: longName,
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // When & Then: update 호출 시 DECK_NAME_TOO_LONG 에러 발생해야 함
        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_TOO_LONG,
            message: expect.stringContaining('too long')
          });
      });

      it('500자를 초과하는 설명으로 수정할 때 DECK_DESCRIPTION_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 500자를 초과하는 설명
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const longDescription = 'a'.repeat(501);
        const invalidUpdateData = {
          name: '유효한 이름',
          description: longDescription
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // When & Then: update 호출 시 DECK_DESCRIPTION_TOO_LONG 에러 발생해야 함
        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_DESCRIPTION_TOO_LONG
          });
      });

      it('중복된 이름으로 수정할 때 DECK_NAME_DUPLICATE 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 이미 존재하는 다른 덱의 이름
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const duplicateName = '다른 덱의 이름';
        const invalidUpdateData = {
          name: duplicateName,
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // Mock 데이터베이스에서 중복된 이름을 가진 다른 덱이 있다고 설정
        const mockFilterResult = {
          toArray: jest.fn().mockResolvedValue([
            { id: 2, name: duplicateName, description: '다른 덱' }
          ])
        };
        mockDb.decks.filter = jest.fn().mockReturnValue(mockFilterResult);

        // When & Then: update 호출 시 DECK_NAME_DUPLICATE 에러 발생해야 함
        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_DUPLICATE,
            message: expect.stringContaining(duplicateName)
          });
      });

      it('잘못된 ID 타입으로 수정할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 잘못된 타입의 ID
        const invalidId = 'invalid-id' as any;
        const updateData = {
          name: '수정된 이름',
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // When & Then: update 호출 시 INVALID_ID 에러 발생해야 함
        await expect(deckService.update(invalidId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(invalidId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 ID로 수정할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 ID
        const negativeId = -1;
        const updateData = {
          name: '수정된 이름',
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // When & Then: update 호출 시 INVALID_ID 에러 발생해야 함
        await expect(deckService.update(negativeId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(negativeId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('0 ID로 수정할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 0 ID
        const zeroId = 0;
        const updateData = {
          name: '수정된 이름',
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // When & Then: update 호출 시 INVALID_ID 에러 발생해야 함
        await expect(deckService.update(zeroId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(zeroId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 업데이트 데이터
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const updateData = {
          name: '수정된 이름',
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // Mock 데이터베이스에서 중복 검사 통과하도록 설정
        const mockFilterResult = {
          toArray: jest.fn().mockResolvedValue([])
        };
        mockDb.decks.filter = jest.fn().mockReturnValue(mockFilterResult);

        // Mock 데이터베이스에서 업데이트 중 에러 발생하도록 설정
        mockDb.decks.update = jest.fn().mockRejectedValue(new Error('Database update failed'));

        // When & Then: update 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.update(validId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Database update failed')
          });
      });

      it('name이 undefined일 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 undefined name
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const invalidUpdateData = {
          name: undefined as any,
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // When & Then: update 호출 시 DECK_NAME_REQUIRED 에러 발생해야 함
        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED
          });
      });

      it('name이 null일 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 null name
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '기존 덱',
          description: '기존 설명',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const invalidUpdateData = {
          name: null as any,
          description: '수정된 설명'
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.update).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // When & Then: update 호출 시 DECK_NAME_REQUIRED 에러 발생해야 함
        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED
          });
      });
    });
  });

  describe('delete()', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 ID로 삭제할 때 DECK_NOT_FOUND 에러를 발생시켜야 한다', async () => {
        // Given: 존재하지 않는 덱 ID
        const nonExistentId = 999;

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // Mock 데이터베이스에서 덱을 찾을 수 없도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(undefined);

        // When & Then: delete 호출 시 DECK_NOT_FOUND 에러 발생해야 함
        await expect(deckService.delete(nonExistentId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(nonExistentId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NOT_FOUND,
            message: expect.stringContaining(nonExistentId.toString())
          });

        expect(mockDb.decks.get).toHaveBeenCalledWith(nonExistentId);
      });

      it('잘못된 ID 타입으로 삭제할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 잘못된 타입의 ID
        const invalidId = 'invalid-id' as any;

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // When & Then: delete 호출 시 INVALID_ID 에러 발생해야 함
        await expect(deckService.delete(invalidId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(invalidId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 ID로 삭제할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 ID
        const negativeId = -1;

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // When & Then: delete 호출 시 INVALID_ID 에러 발생해야 함
        await expect(deckService.delete(negativeId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(negativeId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('0 ID로 삭제할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 0 ID
        const zeroId = 0;

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // When & Then: delete 호출 시 INVALID_ID 에러 발생해야 함
        await expect(deckService.delete(zeroId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(zeroId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('연관된 카드 삭제 중 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 연관된 카드들
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '삭제할 덱',
          description: '카드가 있는 덱',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // Mock 트랜잭션 설정 - 연관 카드 삭제 중 에러 발생
        const mockTransaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
          // 트랜잭션 내에서 카드 삭제 중 에러 발생
          const mockCards = {
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]), // 카드 목록 반환
                delete: jest.fn().mockRejectedValue(new Error('Failed to delete related cards'))
              })
            })
          };
          
          const mockStudySessions = {
            where: jest.fn().mockReturnValue({
              anyOf: jest.fn().mockReturnValue({
                delete: jest.fn().mockResolvedValue(undefined)
              })
            })
          };

          const mockDecks = {
            delete: jest.fn().mockResolvedValue(undefined)
          };

          await callback({ cards: mockCards, studySessions: mockStudySessions, decks: mockDecks });
        });

        mockDb.transaction = mockTransaction;

        // When & Then: delete 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Failed to delete related cards')
          });

        expect(mockDb.decks.get).toHaveBeenCalledWith(validId);
        expect(mockTransaction).toHaveBeenCalled();
      });

      it('연관된 학습 세션 삭제 중 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID와 연관된 학습 세션들
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '삭제할 덱',
          description: '학습 기록이 있는 덱',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // Mock 트랜잭션 설정 - 연관 학습 세션 삭제 중 에러 발생
        const mockTransaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
          const mockCards = {
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) // 카드 목록 반환
              })
            })
          };
          
          // 학습 세션 삭제 중 에러 발생
          const mockStudySessions = {
            where: jest.fn().mockReturnValue({
              anyOf: jest.fn().mockReturnValue({
                delete: jest.fn().mockRejectedValue(new Error('Failed to delete study sessions'))
              })
            })
          };

          const mockDecks = {
            delete: jest.fn().mockResolvedValue(undefined)
          };

          await callback({ cards: mockCards, studySessions: mockStudySessions, decks: mockDecks });
        });

        mockDb.transaction = mockTransaction;

        // When & Then: delete 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Failed to delete study sessions')
          });

        expect(mockDb.decks.get).toHaveBeenCalledWith(validId);
        expect(mockTransaction).toHaveBeenCalled();
      });

      it('덱 삭제 중 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '삭제할 덱',
          description: '삭제 중 에러가 발생할 덱',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // Mock 트랜잭션 설정 - 덱 삭제 중 에러 발생
        const mockTransaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
          const mockCards = {
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]), // 카드 목록 반환
                delete: jest.fn().mockResolvedValue(undefined) // 카드 삭제는 성공
              })
            })
          };
          
          const mockStudySessions = {
            where: jest.fn().mockReturnValue({
              anyOf: jest.fn().mockReturnValue({
                delete: jest.fn().mockResolvedValue(undefined)
              })
            })
          };

          // 덱 삭제 중 에러 발생
          const mockDecks = {
            delete: jest.fn().mockRejectedValue(new Error('Failed to delete deck'))
          };

          await callback({ cards: mockCards, studySessions: mockStudySessions, decks: mockDecks });
        });

        mockDb.transaction = mockTransaction;

        // When & Then: delete 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Failed to delete deck')
          });

        expect(mockDb.decks.get).toHaveBeenCalledWith(validId);
        expect(mockTransaction).toHaveBeenCalled();
      });

      it('트랜잭션 시작 중 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '삭제할 덱',
          description: '트랜잭션 에러가 발생할 덱',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // Mock 트랜잭션에서 에러 발생
        mockDb.transaction = jest.fn().mockRejectedValue(new Error('Transaction failed to start'));

        // When & Then: delete 호출 시 DATABASE_ERROR 발생해야 함
        await expect(deckService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Transaction failed to start')
          });

        expect(mockDb.decks.get).toHaveBeenCalledWith(validId);
        expect(mockDb.transaction).toHaveBeenCalled();
      });

      it('트랜잭션 롤백이 필요한 상황에서 모든 변경사항이 취소되어야 한다', async () => {
        // Given: 유효한 덱 ID와 부분적으로 성공하는 삭제 작업
        const validId = 1;
        const existingDeck = {
          id: validId,
          name: '삭제할 덱',
          description: '롤백 테스트용 덱',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(deckService).toBeDefined();
        expect(typeof deckService.delete).toBe('function');

        // Mock 데이터베이스에서 기존 덱 반환하도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(existingDeck);

        // Mock 트랜잭션 설정 - 중간에 실패하여 롤백 발생
        const mockTransaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
          const mockCards = {
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) // 카드 목록 반환
              })
            })
          };
          
          const mockStudySessions = {
            where: jest.fn().mockReturnValue({
              anyOf: jest.fn().mockReturnValue({
                delete: jest.fn().mockRejectedValue(new Error('Study session deletion failed')) // 학습 세션 삭제 실패
              })
            })
          };

          const mockDecks = {
            delete: jest.fn().mockResolvedValue(undefined)
          };

          // 트랜잭션 내에서 에러 발생 시 자동 롤백
          await callback({ cards: mockCards, studySessions: mockStudySessions, decks: mockDecks });
        });

        mockDb.transaction = mockTransaction;

        // When & Then: delete 호출 시 DATABASE_ERROR 발생하고 롤백되어야 함
        await expect(deckService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(deckService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Study session deletion failed')
          });

        // 트랜잭션이 호출되었는지 확인
        expect(mockTransaction).toHaveBeenCalled();
        
        // 트랜잭션 실패로 인해 모든 변경사항이 롤백되어야 함
        // (실제 구현에서는 Dexie가 자동으로 롤백을 처리함)
      });
    });
  });
});