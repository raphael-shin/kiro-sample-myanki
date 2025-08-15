/**
 * CardService 테스트
 * TDD 접근 방식으로 CardService의 모든 기능을 테스트
 */

import { CreateCardInput, UpdateCardInput } from '@/types/flashcard';
import { MyAnkiError, ErrorCode } from '@/types/errors';

// Dexie 모킹
jest.mock('dexie');

// MyAnkiDB 모킹
jest.mock('@/db/MyAnkiDB', () => {
  const { MyAnkiDB } = require('../__mocks__/MyAnkiDB');
  return { MyAnkiDB };
});

// CardService를 import하려고 시도 - 아직 구현되지 않았으므로 실패할 것
let CardService: any;
let MyAnkiDB: any;

try {
  // 실제 CardService를 import하려고 시도
  const cardServiceModule = require('@/services/CardService');
  CardService = cardServiceModule.CardService;
  
  const dbModule = require('../__mocks__/MyAnkiDB');
  MyAnkiDB = dbModule.MyAnkiDB;
} catch (error) {
  // CardService가 아직 구현되지 않았으므로 에러가 발생
  console.log('CardService not implemented yet - this is expected for TDD Red phase');
}

describe('CardService', () => {
  let cardService: any;
  let mockDb: any;

  beforeEach(() => {
    // CardService가 구현되지 않았으므로 테스트는 실패할 것
    if (CardService && MyAnkiDB) {
      mockDb = new MyAnkiDB();
      cardService = new CardService(mockDb);
    } else {
      // CardService가 구현되지 않았으므로 undefined
      cardService = undefined;
      mockDb = undefined;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 deckId를 참조할 때 DECK_NOT_FOUND 에러를 발생시켜야 한다', async () => {
        // Given: 존재하지 않는 deckId를 가진 카드 데이터
        const nonExistentDeckId = 999;
        const invalidCardData: CreateCardInput = {
          deckId: nonExistentDeckId,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // Mock 데이터베이스에서 덱을 찾을 수 없도록 설정
        mockDb.decks.get = jest.fn().mockResolvedValue(undefined);

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NOT_FOUND,
            message: expect.stringContaining(nonExistentDeckId.toString())
          });

        expect(mockDb.decks.get).toHaveBeenCalledWith(nonExistentDeckId);
      });

      it('카드 앞면이 없을 때 CARD_FRONT_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 앞면이 없는 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_REQUIRED,
            message: 'Card front content is required'
          });
      });

      it('카드 앞면이 공백만 있을 때 CARD_FRONT_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 공백만 있는 앞면을 가진 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '   ',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_REQUIRED
          });
      });

      it('카드 뒷면이 없을 때 CARD_BACK_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 뒷면이 없는 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '앞면 내용',
          back: ''
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_REQUIRED,
            message: 'Card back content is required'
          });
      });

      it('카드 뒷면이 공백만 있을 때 CARD_BACK_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 공백만 있는 뒷면을 가진 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '앞면 내용',
          back: '   '
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_REQUIRED
          });
      });

      it('카드 앞면이 1000자를 초과할 때 CARD_FRONT_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 1000자를 초과하는 앞면을 가진 카드 데이터
        const longFront = 'a'.repeat(1001);
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: longFront,
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_TOO_LONG,
            message: expect.stringContaining('too long')
          });
      });

      it('카드 뒷면이 1000자를 초과할 때 CARD_BACK_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 1000자를 초과하는 뒷면을 가진 카드 데이터
        const longBack = 'a'.repeat(1001);
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '앞면 내용',
          back: longBack
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_TOO_LONG,
            message: expect.stringContaining('too long')
          });
      });

      it('잘못된 deckId 타입(문자열)일 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 문자열 deckId를 가진 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 'invalid-deck-id' as any,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 deckId일 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 deckId를 가진 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: -1,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('0 deckId일 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 0 deckId를 가진 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 0,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 카드 데이터
        const validCardData: CreateCardInput = {
          deckId: 1,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // Mock 데이터베이스에서 덱이 존재한다고 설정
        mockDb.decks.get = jest.fn().mockResolvedValue({
          id: 1,
          name: '테스트 덱',
          description: '테스트용 덱'
        });

        // Mock 데이터베이스에서 카드 생성 중 에러 발생하도록 설정
        mockDb.cards.add = jest.fn().mockRejectedValue(new Error('Database connection failed'));

        // When & Then: create 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.create(validCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(validCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Database connection failed')
          });
      });

      it('front 속성이 undefined일 때 CARD_FRONT_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: front가 undefined인 카드 데이터
        const invalidCardData = {
          deckId: 1,
          back: '뒷면 내용'
        } as CreateCardInput;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_REQUIRED
          });
      });

      it('back 속성이 undefined일 때 CARD_BACK_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: back이 undefined인 카드 데이터
        const invalidCardData = {
          deckId: 1,
          front: '앞면 내용'
        } as CreateCardInput;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_REQUIRED
          });
      });

      it('front 속성이 null일 때 CARD_FRONT_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: front가 null인 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: null as any,
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_REQUIRED
          });
      });

      it('back 속성이 null일 때 CARD_BACK_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: back이 null인 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '앞면 내용',
          back: null as any
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_REQUIRED
          });
      });

      it('deckId 속성이 undefined일 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: deckId가 undefined인 카드 데이터
        const invalidCardData = {
          front: '앞면 내용',
          back: '뒷면 내용'
        } as CreateCardInput;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('deckId 속성이 null일 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: deckId가 null인 카드 데이터
        const invalidCardData: CreateCardInput = {
          deckId: null as any,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.create).toBe('function');

        // When & Then: create 호출 시 에러 발생해야 함
        await expect(cardService.create(invalidCardData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.create(invalidCardData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });
    });
  });

  describe('getById()', () => {
    describe('성공 케이스 (TDD Green)', () => {
      it('유효한 ID로 카드를 조회할 수 있어야 한다', async () => {
        // Given: 유효한 카드 ID와 Mock 데이터
        const validId = 1;
        const mockCard = {
          id: validId,
          deckId: 1,
          front: '앞면 내용',
          back: '뒷면 내용',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(cardService).toBeDefined();
        expect(typeof cardService.getById).toBe('function');

        // Mock 데이터베이스에서 카드 반환하도록 설정
        mockDb.cards.get = jest.fn().mockResolvedValue(mockCard);

        // When: 유효한 ID로 조회
        const result = await cardService.getById(validId);

        // Then: 올바른 카드가 반환되어야 함
        expect(result).toEqual(mockCard);
        expect(mockDb.cards.get).toHaveBeenCalledWith(validId);
      });
    });

    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 ID로 조회할 때 undefined를 반환해야 한다', async () => {
        // Given: 존재하지 않는 카드 ID
        const nonExistentId = 999;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getById).toBe('function');

        // Mock 데이터베이스에서 undefined 반환하도록 설정
        mockDb.cards.get = jest.fn().mockResolvedValue(undefined);

        // When: 존재하지 않는 ID로 조회
        const result = await cardService.getById(nonExistentId);

        // Then: undefined 반환해야 함
        expect(result).toBeUndefined();
        expect(mockDb.cards.get).toHaveBeenCalledWith(nonExistentId);
      });

      it('잘못된 ID 타입(문자열)으로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 문자열 ID
        const invalidId = 'invalid-id' as any;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getById).toBe('function');

        // When & Then: getById 호출 시 에러 발생해야 함
        await expect(cardService.getById(invalidId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getById(invalidId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 ID로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 ID
        const negativeId = -1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getById).toBe('function');

        // When & Then: getById 호출 시 에러 발생해야 함
        await expect(cardService.getById(negativeId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getById(negativeId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('0 ID로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 0 ID
        const zeroId = 0;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getById).toBe('function');

        // When & Then: getById 호출 시 에러 발생해야 함
        await expect(cardService.getById(zeroId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getById(zeroId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 ID
        const validId = 1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getById).toBe('function');

        // Mock 데이터베이스에서 에러 발생하도록 설정
        mockDb.cards.get = jest.fn().mockRejectedValue(new Error('Database connection failed'));

        // When & Then: getById 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.getById(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getById(validId))
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
      it('모든 카드를 생성일시 순으로 조회할 수 있어야 한다', async () => {
        // Given: Mock 카드 데이터 (생성일시 순)
        const mockCards = [
          {
            id: 1,
            deckId: 1,
            front: '첫 번째 카드 앞면',
            back: '첫 번째 카드 뒷면',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
          },
          {
            id: 2,
            deckId: 1,
            front: '두 번째 카드 앞면',
            back: '두 번째 카드 뒷면',
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
          }
        ];

        expect(cardService).toBeDefined();
        expect(typeof cardService.getAll).toBe('function');

        // Mock 데이터베이스에서 정렬된 카드 목록 반환하도록 설정
        const mockOrderByResult = {
          toArray: jest.fn().mockResolvedValue(mockCards)
        };
        mockDb.cards.orderBy = jest.fn().mockReturnValue(mockOrderByResult);

        // When: 모든 카드 조회
        const result = await cardService.getAll();

        // Then: 생성일시 순으로 정렬된 카드 목록이 반환되어야 함
        expect(result).toEqual(mockCards);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(mockDb.cards.orderBy).toHaveBeenCalledWith('createdAt');
        expect(mockOrderByResult.toArray).toHaveBeenCalled();
      });
    });

    describe('실패 케이스 (TDD Red)', () => {
      it('카드가 없을 때 빈 배열을 반환해야 한다', async () => {
        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getAll).toBe('function');

        // Mock 데이터베이스에서 빈 배열 반환하도록 설정
        const mockOrderByResult = {
          toArray: jest.fn().mockResolvedValue([])
        };
        mockDb.cards.orderBy = jest.fn().mockReturnValue(mockOrderByResult);

        // When: 모든 카드 조회
        const result = await cardService.getAll();

        // Then: 빈 배열 반환해야 함
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
        expect(mockDb.cards.orderBy).toHaveBeenCalledWith('createdAt');
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getAll).toBe('function');

        // Mock 데이터베이스에서 에러 발생하도록 설정
        mockDb.cards.orderBy = jest.fn().mockImplementation(() => {
          throw new Error('Database connection failed');
        });

        // When & Then: getAll 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.getAll())
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getAll())
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Database connection failed')
          });
      });

      it('정렬 중 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getAll).toBe('function');

        // Mock 데이터베이스에서 정렬 중 에러 발생하도록 설정
        const mockOrderByResult = {
          toArray: jest.fn().mockRejectedValue(new Error('Sort operation failed'))
        };
        mockDb.cards.orderBy = jest.fn().mockReturnValue(mockOrderByResult);

        // When & Then: getAll 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.getAll())
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getAll())
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Sort operation failed')
          });
      });
    });
  });

  describe('getCardsByDeck()', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 deckId로 조회할 때 빈 배열을 반환해야 한다', async () => {
        // Given: 존재하지 않는 덱 ID
        const nonExistentDeckId = 999;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // Mock 데이터베이스에서 빈 배열 반환하도록 설정
        const mockWhereResult = {
          equals: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([])
          })
        };
        mockDb.cards.where = jest.fn().mockReturnValue(mockWhereResult);

        // When: 존재하지 않는 덱 ID로 카드 조회
        const result = await cardService.getCardsByDeck(nonExistentDeckId);

        // Then: 빈 배열이 반환되어야 함
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
        expect(mockDb.cards.where).toHaveBeenCalledWith('deckId');
        expect(mockWhereResult.equals).toHaveBeenCalledWith(nonExistentDeckId);
      });

      it('잘못된 deckId 타입(문자열)으로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 문자열 덱 ID
        const invalidDeckId = 'invalid-deck-id' as any;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // When & Then: getCardsByDeck 호출 시 에러 발생해야 함
        await expect(cardService.getCardsByDeck(invalidDeckId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getCardsByDeck(invalidDeckId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 deckId로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 덱 ID
        const negativeDeckId = -1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // When & Then: getCardsByDeck 호출 시 에러 발생해야 함
        await expect(cardService.getCardsByDeck(negativeDeckId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getCardsByDeck(negativeDeckId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('0 deckId로 조회할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 0 덱 ID
        const zeroDeckId = 0;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // When & Then: getCardsByDeck 호출 시 에러 발생해야 함
        await expect(cardService.getCardsByDeck(zeroDeckId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getCardsByDeck(zeroDeckId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID
        const validDeckId = 1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // Mock 데이터베이스에서 에러 발생하도록 설정
        mockDb.cards.where = jest.fn().mockImplementation(() => {
          throw new Error('Database connection failed');
        });

        // When & Then: getCardsByDeck 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.getCardsByDeck(validDeckId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getCardsByDeck(validDeckId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Database connection failed')
          });
      });

      it('쿼리 실행 중 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 덱 ID
        const validDeckId = 1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // Mock 데이터베이스에서 쿼리 실행 중 에러 발생하도록 설정
        const mockWhereResult = {
          equals: jest.fn().mockReturnValue({
            toArray: jest.fn().mockRejectedValue(new Error('Query execution failed'))
          })
        };
        mockDb.cards.where = jest.fn().mockReturnValue(mockWhereResult);

        // When & Then: getCardsByDeck 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.getCardsByDeck(validDeckId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getCardsByDeck(validDeckId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Query execution failed')
          });
      });

      it('deckId가 undefined일 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: undefined 덱 ID
        const undefinedDeckId = undefined as any;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // When & Then: getCardsByDeck 호출 시 에러 발생해야 함
        await expect(cardService.getCardsByDeck(undefinedDeckId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getCardsByDeck(undefinedDeckId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('deckId가 null일 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: null 덱 ID
        const nullDeckId = null as any;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.getCardsByDeck).toBe('function');

        // When & Then: getCardsByDeck 호출 시 에러 발생해야 함
        await expect(cardService.getCardsByDeck(nullDeckId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.getCardsByDeck(nullDeckId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });
    });
  });

  describe('update()', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 카드 ID로 수정할 때 CARD_NOT_FOUND 에러를 발생시켜야 한다', async () => {
        // Given: 존재하지 않는 카드 ID와 수정 데이터
        const nonExistentId = 999;
        const updateData: UpdateCardInput = {
          front: '수정된 앞면',
          back: '수정된 뒷면'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // Mock 데이터베이스에서 카드를 찾을 수 없도록 설정
        mockDb.cards.get = jest.fn().mockResolvedValue(undefined);

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(nonExistentId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(nonExistentId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_NOT_FOUND,
            message: expect.stringContaining(nonExistentId.toString())
          });
      });

      it('잘못된 ID 타입(문자열)으로 수정할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 문자열 ID와 수정 데이터
        const invalidId = 'invalid-id' as any;
        const updateData: UpdateCardInput = {
          front: '수정된 앞면'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(invalidId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(invalidId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 ID로 수정할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 ID와 수정 데이터
        const negativeId = -1;
        const updateData: UpdateCardInput = {
          back: '수정된 뒷면'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(negativeId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(negativeId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('빈 앞면으로 수정할 때 CARD_FRONT_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 ID와 빈 앞면 데이터
        const validId = 1;
        const invalidUpdateData: UpdateCardInput = {
          front: ''
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정 (카드 존재 확인이 먼저 실행됨)
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '기존 앞면',
          back: '기존 뒷면'
        });

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_REQUIRED,
            message: 'Card front content is required'
          });
      });

      it('공백만 있는 앞면으로 수정할 때 CARD_FRONT_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 ID와 공백만 있는 앞면 데이터
        const validId = 1;
        const invalidUpdateData: UpdateCardInput = {
          front: '   '
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '기존 앞면',
          back: '기존 뒷면'
        });

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_REQUIRED
          });
      });

      it('빈 뒷면으로 수정할 때 CARD_BACK_REQUIRED 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 ID와 빈 뒷면 데이터
        const validId = 1;
        const invalidUpdateData: UpdateCardInput = {
          back: ''
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '기존 앞면',
          back: '기존 뒷면'
        });

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_REQUIRED,
            message: 'Card back content is required'
          });
      });

      it('1000자를 초과하는 앞면으로 수정할 때 CARD_FRONT_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 ID와 1000자를 초과하는 앞면 데이터
        const validId = 1;
        const longFront = 'a'.repeat(1001);
        const invalidUpdateData: UpdateCardInput = {
          front: longFront
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '기존 앞면',
          back: '기존 뒷면'
        });

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_TOO_LONG,
            message: expect.stringContaining('too long')
          });
      });

      it('1000자를 초과하는 뒷면으로 수정할 때 CARD_BACK_TOO_LONG 에러를 발생시켜야 한다', async () => {
        // Given: 유효한 ID와 1000자를 초과하는 뒷면 데이터
        const validId = 1;
        const longBack = 'a'.repeat(1001);
        const invalidUpdateData: UpdateCardInput = {
          back: longBack
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '기존 앞면',
          back: '기존 뒷면'
        });

        // When & Then: update 호출 시 에러 발생해야 함
        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(validId, invalidUpdateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_TOO_LONG,
            message: expect.stringContaining('too long')
          });
      });

      it('데이터베이스 에러가 발생할 때 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 ID와 수정 데이터
        const validId = 1;
        const updateData: UpdateCardInput = {
          front: '수정된 앞면'
        };

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.update).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '기존 앞면',
          back: '기존 뒷면'
        });

        // Mock 데이터베이스에서 업데이트 중 에러 발생하도록 설정
        mockDb.cards.update = jest.fn().mockRejectedValue(new Error('Database connection failed'));

        // When & Then: update 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.update(validId, updateData))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.update(validId, updateData))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Database connection failed')
          });
      });
    });
  });

  describe('delete()', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('존재하지 않는 카드 ID로 삭제할 때 CARD_NOT_FOUND 에러를 발생시켜야 한다', async () => {
        // Given: 존재하지 않는 카드 ID
        const nonExistentId = 999;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.delete).toBe('function');

        // Mock 데이터베이스에서 카드를 찾을 수 없도록 설정
        mockDb.cards.get = jest.fn().mockResolvedValue(undefined);

        // When & Then: delete 호출 시 에러 발생해야 함
        await expect(cardService.delete(nonExistentId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.delete(nonExistentId))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_NOT_FOUND,
            message: expect.stringContaining(nonExistentId.toString())
          });
      });

      it('잘못된 ID 타입(문자열)으로 삭제할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 문자열 ID
        const invalidId = 'invalid-id' as any;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.delete).toBe('function');

        // When & Then: delete 호출 시 에러 발생해야 함
        await expect(cardService.delete(invalidId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.delete(invalidId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('Invalid ID')
          });
      });

      it('음수 ID로 삭제할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 음수 ID
        const negativeId = -1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.delete).toBe('function');

        // When & Then: delete 호출 시 에러 발생해야 함
        await expect(cardService.delete(negativeId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.delete(negativeId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('0 ID로 삭제할 때 INVALID_ID 에러를 발생시켜야 한다', async () => {
        // Given: 0 ID
        const zeroId = 0;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.delete).toBe('function');

        // When & Then: delete 호출 시 에러 발생해야 함
        await expect(cardService.delete(zeroId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.delete(zeroId))
          .rejects
          .toMatchObject({
            code: ErrorCode.INVALID_ID,
            message: expect.stringContaining('must be positive')
          });
      });

      it('연관 학습 기록 삭제 실패 시 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 카드 ID
        const validId = 1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.delete).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '앞면 내용',
          back: '뒷면 내용'
        });

        // Mock 트랜잭션에서 학습 기록 삭제 실패하도록 설정
        const mockTransaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
          const mockTx = {
            studySessions: {
              where: jest.fn().mockReturnValue({
                equals: jest.fn().mockReturnValue({
                  delete: jest.fn().mockRejectedValue(new Error('Failed to delete study sessions'))
                })
              })
            },
            cards: {
              delete: jest.fn().mockResolvedValue(undefined)
            }
          };
          await callback(mockTx);
        });
        mockDb.transaction = mockTransaction;

        // When & Then: delete 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Failed to delete study sessions')
          });
      });

      it('카드 삭제 실패 시 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 카드 ID
        const validId = 1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.delete).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '앞면 내용',
          back: '뒷면 내용'
        });

        // Mock 트랜잭션에서 카드 삭제 실패하도록 설정
        const mockTransaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
          const mockTx = {
            studySessions: {
              where: jest.fn().mockReturnValue({
                equals: jest.fn().mockReturnValue({
                  delete: jest.fn().mockResolvedValue(undefined)
                })
              })
            },
            cards: {
              delete: jest.fn().mockRejectedValue(new Error('Failed to delete card'))
            }
          };
          await callback(mockTx);
        });
        mockDb.transaction = mockTransaction;

        // When & Then: delete 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Failed to delete card')
          });
      });

      it('트랜잭션 시작 실패 시 DATABASE_ERROR를 발생시켜야 한다', async () => {
        // Given: 유효한 카드 ID
        const validId = 1;

        // CardService가 구현되지 않았으므로 테스트 실패
        expect(cardService).toBeDefined();
        expect(typeof cardService.delete).toBe('function');

        // Mock 데이터베이스에서 카드가 존재한다고 설정
        mockDb.cards.get = jest.fn().mockResolvedValue({
          id: validId,
          deckId: 1,
          front: '앞면 내용',
          back: '뒷면 내용'
        });

        // Mock 트랜잭션 시작 실패하도록 설정
        mockDb.transaction = jest.fn().mockRejectedValue(new Error('Transaction failed to start'));

        // When & Then: delete 호출 시 DATABASE_ERROR 발생해야 함
        await expect(cardService.delete(validId))
          .rejects
          .toThrow(MyAnkiError);

        await expect(cardService.delete(validId))
          .rejects
          .toMatchObject({
            code: ErrorCode.DATABASE_ERROR,
            message: expect.stringContaining('Transaction failed to start')
          });
      });
    });
  });
});