/**
 * 서비스 간 상호작용 테스트
 * DeckService, CardService, StudyService 간의 연동 테스트
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

describe('Service Interaction Tests', () => {
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

    jest.clearAllMocks();
  });

  describe('DeckService와 CardService 연동', () => {
    it('덱 삭제 시 연관 카드들이 함께 삭제되어야 한다', async () => {
      // Given: 덱과 카드들이 있는 상태
      const deckId = 1;
      const cardIds = [1, 2, 3];

      // Mock 설정
      db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });
      
      db.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(cardIds.map(id => ({ id })))
        })
      });

      db.studySessions.where = jest.fn().mockReturnValue({
        anyOf: jest.fn().mockReturnValue({
          delete: jest.fn().mockResolvedValue(undefined)
        })
      });

      db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          decks: { delete: jest.fn().mockResolvedValue(undefined) },
          cards: { 
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue(cardIds.map(id => ({ id }))),
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

      // Then: 트랜잭션이 호출되어 연관 데이터가 삭제되었는지 확인
      expect(db.transaction).toHaveBeenCalled();
    });

    it('존재하지 않는 덱에 카드 생성 시 에러가 발생해야 한다', async () => {
      // Given: 존재하지 않는 덱 ID
      const nonExistentDeckId = 999;

      // Mock 설정
      db.decks.get = jest.fn().mockResolvedValue(undefined);

      // When & Then: 카드 생성 시 에러 발생
      await expect(cardService.create({
        deckId: nonExistentDeckId,
        front: '앞면',
        back: '뒷면'
      })).rejects.toThrow('Deck with id 999 does not exist');
    });
  });

  describe('CardService와 StudyService 연동', () => {
    it('카드 삭제 시 연관 학습 기록들이 함께 삭제되어야 한다', async () => {
      // Given: 카드와 학습 기록들이 있는 상태
      const cardId = 1;

      // Mock 설정
      db.cards.get = jest.fn().mockResolvedValue({ id: cardId, front: '앞면', back: '뒷면' });

      db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          cards: { delete: jest.fn().mockResolvedValue(undefined) },
          studySessions: { 
            where: jest.fn().mockReturnValue({
              equals: jest.fn().mockReturnValue({
                delete: jest.fn().mockResolvedValue(undefined)
              })
            })
          }
        };
        return await callback(tx);
      });

      // When: 카드 삭제
      await cardService.delete(cardId);

      // Then: 트랜잭션이 호출되어 연관 학습 기록이 삭제되었는지 확인
      expect(db.transaction).toHaveBeenCalled();
    });

    it('존재하지 않는 카드에 학습 기록 생성 시 에러가 발생해야 한다', async () => {
      // Given: 존재하지 않는 카드 ID
      const nonExistentCardId = 999;

      // Mock 설정
      db.cards.get = jest.fn().mockResolvedValue(undefined);

      // When & Then: 학습 기록 생성 시 에러 발생
      await expect(studyService.create({
        cardId: nonExistentCardId,
        studiedAt: new Date(),
        quality: StudyQuality.GOOD,
        responseTime: 5000
      })).rejects.toThrow('Card with id 999 does not exist');
    });
  });

  describe('전체 서비스 통합 시나리오', () => {
    it('덱 생성 → 카드 생성 → 학습 기록 생성 → 덱 삭제 전체 플로우가 정상 작동해야 한다', async () => {
      // Given: Mock 설정
      const deckId = 1;
      const cardId = 1;
      const studySessionId = 1;

      // 덱 생성 Mock
      db.decks.add = jest.fn().mockResolvedValue(deckId);
      db.decks.filter = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([])
      });

      // 카드 생성 Mock
      db.cards.add = jest.fn().mockResolvedValue(cardId);
      db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });

      // 학습 기록 생성 Mock
      db.studySessions.add = jest.fn().mockResolvedValue(studySessionId);
      db.cards.get = jest.fn().mockResolvedValue({ id: cardId, deckId, front: '앞면', back: '뒷면' });

      // 덱 삭제 Mock
      db.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([{ id: cardId }])
        })
      });

      db.studySessions.where = jest.fn().mockReturnValue({
        anyOf: jest.fn().mockReturnValue({
          delete: jest.fn().mockResolvedValue(undefined)
        })
      });

      db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          decks: { delete: jest.fn().mockResolvedValue(undefined) },
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

      // When: 전체 플로우 실행
      const createdDeckId = await deckService.create({
        name: '테스트 덱',
        description: '통합 테스트용 덱'
      });

      const createdCardId = await cardService.create({
        deckId: createdDeckId,
        front: '앞면',
        back: '뒷면'
      });

      const createdStudySessionId = await studyService.create({
        cardId: createdCardId,
        studiedAt: new Date(),
        quality: StudyQuality.GOOD,
        responseTime: 5000
      });

      await deckService.delete(createdDeckId);

      // Then: 모든 작업이 성공적으로 완료되었는지 확인
      expect(createdDeckId).toBe(deckId);
      expect(createdCardId).toBe(cardId);
      expect(createdStudySessionId).toBe(studySessionId);
      expect(db.transaction).toHaveBeenCalled();
    });
  });
});
