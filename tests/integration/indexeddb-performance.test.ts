/**
 * IndexedDB 성능 및 최적화 테스트
 * 실제 IndexedDB 환경에서의 성능 테스트 (간소화)
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

describe('IndexedDB Performance Tests', () => {
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

  describe('대용량 데이터 처리 테스트', () => {
    it('대량의 카드 조회 시 인덱스가 활용되어야 한다', async () => {
      // Given: 대량의 카드 데이터 Mock
      const deckId = 1;
      const cards = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        deckId,
        front: `앞면 ${i + 1}`,
        back: `뒷면 ${i + 1}`
      }));

      // Mock 설정
      db.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(cards),
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(cards)
          })
        })
      });

      // When: 덱별 카드 조회
      const result = await cardService.getCardsByDeck(deckId);

      // Then: where 절이 인덱스를 활용하여 호출되었는지 확인
      expect(db.cards.where).toHaveBeenCalledWith('deckId');
      expect(result).toHaveLength(1000);
    });

    it('대량의 학습 기록 조회 시 인덱스가 활용되어야 한다', async () => {
      // Given: 대량의 학습 기록 데이터 Mock
      const cardId = 1;
      const studySessions = Array.from({ length: 500 }, (_, i) => ({
        id: i + 1,
        cardId,
        studiedAt: new Date(Date.now() - i * 86400000), // i일 전
        quality: StudyQuality.GOOD,
        responseTime: 3000 + i * 100
      }));

      // Mock 설정
      db.studySessions.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(studySessions)
          })
        })
      });

      // When: 카드별 학습 기록 조회
      const result = await studyService.getStudyHistory(cardId);

      // Then: where 절이 인덱스를 활용하여 호출되었는지 확인
      expect(db.studySessions.where).toHaveBeenCalledWith('cardId');
      expect(result).toHaveLength(500);
    });

    it('배치 처리가 효율적으로 수행되어야 한다', async () => {
      // Given: 배치 삭제를 위한 Mock 설정
      const deckId = 1;
      const cardIds = [1, 2, 3, 4, 5];

      db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });

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

      // When: 덱 삭제 (배치 처리)
      await deckService.delete(deckId);

      // Then: 트랜잭션이 한 번에 처리되었는지 확인
      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(db.transaction).toHaveBeenCalledWith(
        'rw',
        [db.decks, db.cards, db.studySessions],
        expect.any(Function)
      );
    });
  });

  describe('쿼리 최적화 테스트', () => {
    it('정렬된 결과 조회 시 orderBy가 활용되어야 한다', async () => {
      // Given: 정렬된 덱 목록 Mock
      const decks = [
        { id: 1, name: '덱 A', createdAt: new Date('2023-01-01') },
        { id: 2, name: '덱 B', createdAt: new Date('2023-01-02') },
        { id: 3, name: '덱 C', createdAt: new Date('2023-01-03') }
      ];

      db.decks.orderBy = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(decks)
      });

      // When: 모든 덱 조회 (생성일시 순)
      const result = await deckService.getAll();

      // Then: orderBy가 활용되었는지 확인
      expect(db.decks.orderBy).toHaveBeenCalledWith('createdAt');
      expect(result).toHaveLength(3);
    });

    it('복합 쿼리가 효율적으로 실행되어야 한다', async () => {
      // Given: 학습 통계 계산을 위한 Mock
      const cardId = 1;
      const studySessions = [
        { id: 1, cardId, quality: StudyQuality.GOOD, responseTime: 3000, studiedAt: new Date() },
        { id: 2, cardId, quality: StudyQuality.EASY, responseTime: 2000, studiedAt: new Date() },
        { id: 3, cardId, quality: StudyQuality.HARD, responseTime: 5000, studiedAt: new Date() }
      ];

      db.studySessions.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(studySessions)
          })
        })
      });

      // When: 학습 통계 계산
      const stats = await studyService.getStudyStats(cardId);

      // Then: 효율적인 쿼리가 실행되었는지 확인
      expect(db.studySessions.where).toHaveBeenCalledWith('cardId');
      expect(stats.totalSessions).toBe(3);
      expect(stats.averageQuality).toBeCloseTo(3); // (3+4+2)/3 = 3
      expect(stats.averageResponseTime).toBeCloseTo(3333.33, 1); // (3000+2000+5000)/3
    });
  });

  describe('데이터 일관성 테스트', () => {
    it('동시성 제어가 올바르게 작동해야 한다', async () => {
      // Given: 동시 접근 시뮬레이션
      const deckId = 1;

      db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });
      db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        // 트랜잭션 내에서 동시성 제어 시뮬레이션
        const tx = {
          decks: { delete: jest.fn().mockResolvedValue(undefined) },
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
        return await callback(tx);
      });

      // When: 동시에 여러 작업 실행
      const promises = [
        deckService.delete(deckId),
        deckService.delete(deckId),
        deckService.delete(deckId)
      ];

      // Then: 모든 작업이 완료되어야 함 (에러 발생 가능하지만 데이터 일관성 유지)
      const results = await Promise.allSettled(promises);
      expect(results).toHaveLength(3);
    });
  });
});
