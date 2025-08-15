/**
 * 트랜잭션 롤백 테스트
 * 연관 데이터 삭제 시 원자성 보장 테스트
 */

// Dexie 모킹
jest.mock('dexie');

// MyAnkiDB 모킹
jest.mock('@/db/MyAnkiDB', () => {
  const { MyAnkiDB } = require('../__mocks__/MyAnkiDB');
  return { MyAnkiDB };
});

import { MyAnkiDB } from '@/db/MyAnkiDB';
import { DeckService } from '@/services/DeckService';
import { CardService } from '@/services/CardService';
import { StudyService } from '@/services/StudyService';
import { StudyQuality } from '@/types/flashcard';

describe('Transaction Rollback Tests', () => {
  let db: MyAnkiDB;
  let deckService: DeckService;
  let cardService: CardService;
  let studyService: StudyService;

  beforeEach(async () => {
    db = new MyAnkiDB();
    await db.open();
    
    deckService = new DeckService(db);
    cardService = new CardService(db);
    studyService = new StudyService(db);

    // Mock 초기화
    jest.clearAllMocks();
  });

  describe('트랜잭션 원자성 테스트', () => {
    it('덱 삭제 시 트랜잭션이 올바르게 실행되어야 한다', async () => {
      // Given: Mock 설정
      const deckId = 1;
      const cardId = 1;

      // 덱 존재 확인 Mock
      db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });
      
      // 카드 조회 Mock
      db.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([{ id: cardId }])
        })
      });

      // 학습 기록 삭제 Mock
      db.studySessions.where = jest.fn().mockReturnValue({
        anyOf: jest.fn().mockReturnValue({
          delete: jest.fn().mockResolvedValue(undefined)
        })
      });

      // 카드 삭제 Mock
      const mockCardsDelete = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          delete: jest.fn().mockResolvedValue(undefined)
        })
      });

      // 덱 삭제 Mock
      db.decks.delete = jest.fn().mockResolvedValue(undefined);

      // 트랜잭션 Mock 설정
      db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          decks: { delete: db.decks.delete },
          cards: { 
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([{ id: cardId }]),
                delete: jest.fn().mockResolvedValue(undefined)
              })
            })
          },
          studySessions: { 
            where: jest.fn().mockReturnValue({
              anyOf: jest.fn().mockReturnValue({
                delete: jest.fn().mockResolvedValue(undefined)
              })
            })
          }
        };
        return await callback(tx);
      });

      // When: 덱 삭제
      await deckService.delete(deckId);

      // Then: 트랜잭션이 호출되었는지 확인
      expect(db.transaction).toHaveBeenCalledWith(
        'rw',
        [db.decks, db.cards, db.studySessions],
        expect.any(Function)
      );
    });

    it('카드 삭제 시 트랜잭션이 올바르게 실행되어야 한다', async () => {
      // Given: Mock 설정
      const cardId = 1;

      // 카드 존재 확인 Mock
      db.cards.get = jest.fn().mockResolvedValue({ id: cardId, front: '앞면', back: '뒷면' });

      // 학습 기록 삭제 Mock
      db.studySessions.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          delete: jest.fn().mockResolvedValue(undefined)
        })
      });

      // 카드 삭제 Mock
      db.cards.delete = jest.fn().mockResolvedValue(undefined);

      // 트랜잭션 Mock 설정
      db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          cards: { delete: db.cards.delete },
          studySessions: { where: db.studySessions.where }
        };
        return await callback(tx);
      });

      // When: 카드 삭제
      await cardService.delete(cardId);

      // Then: 트랜잭션이 호출되었는지 확인
      expect(db.transaction).toHaveBeenCalledWith(
        'rw',
        [db.cards, db.studySessions],
        expect.any(Function)
      );
    });

    it('트랜잭션 실패 시 에러가 전파되어야 한다', async () => {
      // Given: Mock 설정
      const deckId = 1;

      // 덱 존재 확인 Mock
      db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });

      // 트랜잭션 실패 Mock
      db.transaction = jest.fn().mockRejectedValue(new Error('Transaction failed'));

      // When & Then: 덱 삭제 시 에러 발생
      await expect(deckService.delete(deckId))
        .rejects
        .toThrow('Transaction failed');
    });

    it('존재하지 않는 덱 삭제 시 적절한 에러가 발생해야 한다', async () => {
      // Given: 존재하지 않는 덱 Mock
      db.decks.get = jest.fn().mockResolvedValue(undefined);

      // When & Then: 덱 삭제 시 에러 발생
      await expect(deckService.delete(999))
        .rejects
        .toThrow('Deck with id 999 not found');
    });

    it('존재하지 않는 카드 삭제 시 적절한 에러가 발생해야 한다', async () => {
      // Given: 존재하지 않는 카드 Mock
      db.cards.get = jest.fn().mockResolvedValue(undefined);

      // When & Then: 카드 삭제 시 에러 발생
      await expect(cardService.delete(999))
        .rejects
        .toThrow('Card with id 999 not found');
    });

    it('트랜잭션 롤백 시나리오 테스트', async () => {
      // Given: Mock 설정
      const deckId = 1;

      // 덱 존재 확인 Mock
      db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });

      // 트랜잭션 내에서 부분적 실패 시뮬레이션
      db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          decks: { delete: jest.fn().mockRejectedValue(new Error('Deck deletion failed')) },
          cards: { 
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([]),
                delete: jest.fn().mockResolvedValue(undefined)
              })
            })
          },
          studySessions: { 
            where: jest.fn().mockReturnValue({
              anyOf: jest.fn().mockReturnValue({
                delete: jest.fn().mockResolvedValue(undefined)
              })
            })
          }
        };
        
        try {
          return await callback(tx);
        } catch (error) {
          // 트랜잭션 실패 시 롤백 시뮬레이션
          throw error;
        }
      });

      // When & Then: 트랜잭션 실패로 인한 에러 발생
      await expect(deckService.delete(deckId))
        .rejects
        .toThrow('Deck deletion failed');

      // 트랜잭션이 호출되었는지 확인
      expect(db.transaction).toHaveBeenCalled();
    });
  });
});
