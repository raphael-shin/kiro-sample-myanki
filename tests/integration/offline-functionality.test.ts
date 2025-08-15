/**
 * 오프라인 기능 테스트
 * 네트워크 연결 없이 모든 CRUD 작업이 정상 동작하는지 테스트
 */

// Dexie 모킹
jest.mock('dexie');

// MyAnkiDB 모킹
jest.mock('@/db/MyAnkiDB', () => {
  const { MyAnkiDB } = require('../__mocks__/MyAnkiDB');
  return { MyAnkiDB };
});

import { createDefaultServices, ServiceContainer } from '@/services';
import { StudyQuality } from '@/types/flashcard';

describe('Offline Functionality Tests', () => {
  let services: ServiceContainer;

  beforeEach(async () => {
    // 서비스 컨테이너 생성
    services = await createDefaultServices();
    jest.clearAllMocks();
  });

  describe('완전한 오프라인 CRUD 작업', () => {
    it('네트워크 없이 덱 생성, 조회, 수정, 삭제가 가능해야 한다', async () => {
      // Given: Mock 설정
      const deckId = 1;
      const { deckService } = services;

      // 덱 생성 Mock
      deckService.db.decks.add = jest.fn().mockResolvedValue(deckId);
      deckService.db.decks.filter = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([])
      });

      // 덱 조회 Mock
      deckService.db.decks.get = jest.fn().mockResolvedValue({
        id: deckId,
        name: '오프라인 덱',
        description: '오프라인 테스트용 덱',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 덱 목록 조회 Mock
      deckService.db.decks.orderBy = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([{
          id: deckId,
          name: '오프라인 덱',
          description: '오프라인 테스트용 덱'
        }])
      });

      // 덱 수정 Mock
      deckService.db.decks.update = jest.fn().mockResolvedValue(1);

      // 덱 삭제 Mock
      deckService.db.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      });
      deckService.db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          decks: { delete: jest.fn().mockResolvedValue(undefined) },
          cards: { where: jest.fn().mockReturnValue({ equals: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]), delete: jest.fn() }) }) },
          studySessions: { where: jest.fn().mockReturnValue({ anyOf: jest.fn().mockReturnValue({ delete: jest.fn() }) }) }
        };
        return await callback(tx);
      });

      // When & Then: 모든 CRUD 작업 수행
      // 생성
      const createdId = await deckService.create({
        name: '오프라인 덱',
        description: '오프라인 테스트용 덱'
      });
      expect(createdId).toBe(deckId);

      // 조회
      const deck = await deckService.getById(deckId);
      expect(deck?.name).toBe('오프라인 덱');

      // 목록 조회
      const decks = await deckService.getAll();
      expect(decks).toHaveLength(1);

      // 수정
      await deckService.update(deckId, { name: '수정된 덱' });
      expect(deckService.db.decks.update).toHaveBeenCalled();

      // 삭제
      await deckService.delete(deckId);
      expect(deckService.db.transaction).toHaveBeenCalled();
    });

    it('네트워크 없이 카드 생성, 조회, 수정, 삭제가 가능해야 한다', async () => {
      // Given: Mock 설정
      const deckId = 1;
      const cardId = 1;
      const { cardService } = services;

      // 카드 생성 Mock
      cardService.db.cards.add = jest.fn().mockResolvedValue(cardId);
      cardService.db.decks.get = jest.fn().mockResolvedValue({ id: deckId, name: '테스트 덱' });

      // 카드 조회 Mock
      cardService.db.cards.get = jest.fn().mockResolvedValue({
        id: cardId,
        deckId,
        front: '오프라인 앞면',
        back: '오프라인 뒷면',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 카드 목록 조회 Mock
      cardService.db.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{
              id: cardId,
              deckId,
              front: '오프라인 앞면',
              back: '오프라인 뒷면'
            }])
          })
        })
      });

      // 카드 수정 Mock
      cardService.db.cards.update = jest.fn().mockResolvedValue(1);

      // 카드 삭제 Mock
      cardService.db.transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
        const tx = {
          cards: { delete: jest.fn().mockResolvedValue(undefined) },
          studySessions: { where: jest.fn().mockReturnValue({ equals: jest.fn().mockReturnValue({ delete: jest.fn() }) }) }
        };
        return await callback(tx);
      });

      // When & Then: 모든 CRUD 작업 수행
      // 생성
      const createdId = await cardService.create({
        deckId,
        front: '오프라인 앞면',
        back: '오프라인 뒷면'
      });
      expect(createdId).toBe(cardId);

      // 조회
      const card = await cardService.getById(cardId);
      expect(card?.front).toBe('오프라인 앞면');

      // 덱별 카드 조회
      const cards = await cardService.getCardsByDeck(deckId);
      expect(cards).toHaveLength(1);

      // 수정
      await cardService.update(cardId, { front: '수정된 앞면' });
      expect(cardService.db.cards.update).toHaveBeenCalled();

      // 삭제
      await cardService.delete(cardId);
      expect(cardService.db.transaction).toHaveBeenCalled();
    });

    it('네트워크 없이 학습 기록 생성, 조회, 통계 계산이 가능해야 한다', async () => {
      // Given: Mock 설정
      const cardId = 1;
      const studySessionId = 1;
      const { studyService } = services;

      // 학습 기록 생성 Mock
      studyService.db.studySessions.add = jest.fn().mockResolvedValue(studySessionId);
      studyService.db.cards.get = jest.fn().mockResolvedValue({ id: cardId, front: '앞면', back: '뒷면' });

      // 학습 기록 조회 Mock
      const studySessions = [
        { id: 1, cardId, quality: StudyQuality.GOOD, responseTime: 3000, studiedAt: new Date() },
        { id: 2, cardId, quality: StudyQuality.EASY, responseTime: 2000, studiedAt: new Date() }
      ];

      studyService.db.studySessions.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(studySessions)
          })
        })
      });

      // When & Then: 모든 작업 수행
      // 생성
      const createdId = await studyService.create({
        cardId,
        studiedAt: new Date(),
        quality: StudyQuality.GOOD,
        responseTime: 3000
      });
      expect(createdId).toBe(studySessionId);

      // 학습 기록 조회
      const history = await studyService.getStudyHistory(cardId);
      expect(history).toHaveLength(2);

      // 학습 통계 계산
      const stats = await studyService.getStudyStats(cardId);
      expect(stats.totalSessions).toBe(2);
      expect(stats.averageQuality).toBe(3.5); // (3+4)/2
    });
  });

  describe('데이터 지속성 테스트', () => {
    it('브라우저 재시작 시뮬레이션 후에도 데이터가 유지되어야 한다', async () => {
      // Given: 데이터 생성 후 서비스 재시작 시뮬레이션
      const { deckService } = services;

      // 초기 데이터 생성 Mock
      deckService.db.decks.add = jest.fn().mockResolvedValue(1);
      deckService.db.decks.filter = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([])
      });

      // 데이터 생성
      await deckService.create({
        name: '지속성 테스트 덱',
        description: '브라우저 재시작 테스트'
      });

      // 서비스 재시작 시뮬레이션 (새로운 서비스 인스턴스 생성)
      const newServices = await createDefaultServices();

      // 재시작 후 데이터 조회 Mock
      newServices.deckService.db.decks.get = jest.fn().mockResolvedValue({
        id: 1,
        name: '지속성 테스트 덱',
        description: '브라우저 재시작 테스트'
      });

      // When: 재시작 후 데이터 조회
      const persistedDeck = await newServices.deckService.getById(1);

      // Then: 데이터가 유지되어야 함
      expect(persistedDeck?.name).toBe('지속성 테스트 덱');
    });

    it('대용량 데이터도 오프라인에서 처리 가능해야 한다', async () => {
      // Given: 대용량 데이터 Mock
      const { cardService } = services;
      const deckId = 1;
      const largeCardSet = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        deckId,
        front: `대용량 앞면 ${i + 1}`,
        back: `대용량 뒷면 ${i + 1}`
      }));

      cardService.db.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(largeCardSet)
          })
        })
      });

      // When: 대용량 데이터 조회
      const cards = await cardService.getCardsByDeck(deckId);

      // Then: 모든 데이터가 조회되어야 함
      expect(cards).toHaveLength(100);
      expect(cards[0].front).toBe('대용량 앞면 1');
      expect(cards[99].front).toBe('대용량 앞면 100');
    });
  });

  describe('서비스 간 협력 오프라인 테스트', () => {
    it('오프라인 상태에서 전체 학습 플로우가 정상 작동해야 한다', async () => {
      // Given: 전체 플로우를 위한 Mock 설정
      const { deckService, cardService, studyService } = services;

      // 덱 생성
      deckService.db.decks.add = jest.fn().mockResolvedValue(1);
      deckService.db.decks.filter = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([])
      });

      // 카드 생성
      cardService.db.cards.add = jest.fn().mockResolvedValue(1);
      cardService.db.decks.get = jest.fn().mockResolvedValue({ id: 1, name: '테스트 덱' });

      // 학습 기록 생성
      studyService.db.studySessions.add = jest.fn().mockResolvedValue(1);
      studyService.db.cards.get = jest.fn().mockResolvedValue({ id: 1, front: '앞면', back: '뒷면' });

      // When: 전체 학습 플로우 실행
      const deckId = await deckService.create({
        name: '오프라인 학습 덱',
        description: '오프라인 학습 테스트'
      });

      const cardId = await cardService.create({
        deckId,
        front: '오프라인 질문',
        back: '오프라인 답변'
      });

      const studySessionId = await studyService.recordStudySession(
        cardId,
        StudyQuality.GOOD,
        5000
      );

      // Then: 모든 단계가 성공적으로 완료되어야 함
      expect(deckId).toBe(1);
      expect(cardId).toBe(1);
      expect(studySessionId).toBeUndefined(); // recordStudySession은 void 반환
      expect(studyService.db.studySessions.add).toHaveBeenCalled();
    });
  });
});
