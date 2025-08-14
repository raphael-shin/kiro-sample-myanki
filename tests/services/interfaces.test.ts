/**
 * 서비스 인터페이스 타입 안전성 검증 테스트
 * 인터페이스 구조와 타입 호환성을 검증
 */

import {
  CRUDService,
  IDeckService,
  ICardService,
  IStudyService
} from '@/services/interfaces';
import {
  Deck,
  Card,
  StudySession,
  CreateDeckInput,
  UpdateDeckInput,
  CreateCardInput,
  UpdateCardInput,
  CreateStudySessionInput,
  UpdateStudySessionInput,
  DeckStats,
  StudyStats,
  DeckWithStats,
  StudyQuality
} from '@/types/flashcard';

describe('Service Interfaces', () => {
  describe('CRUDService interface', () => {
    it('should define correct method signatures', () => {
      // 타입 검증을 위한 더미 구현
      const mockCRUDService: CRUDService<Deck, CreateDeckInput, UpdateDeckInput> = {
        create: async (_item: CreateDeckInput): Promise<number> => 1,
        getById: async (_id: number): Promise<Deck | undefined> => undefined,
        getAll: async (): Promise<Deck[]> => [],
        update: async (_id: number, _updates: UpdateDeckInput): Promise<void> => {},
        delete: async (_id: number): Promise<void> => {}
      };

      expect(typeof mockCRUDService.create).toBe('function');
      expect(typeof mockCRUDService.getById).toBe('function');
      expect(typeof mockCRUDService.getAll).toBe('function');
      expect(typeof mockCRUDService.update).toBe('function');
      expect(typeof mockCRUDService.delete).toBe('function');
    });

    it('should work with different entity types', () => {
      // Card 타입으로 CRUD 서비스 타입 검증
      const mockCardCRUD: CRUDService<Card, CreateCardInput, UpdateCardInput> = {
        create: async (_item: CreateCardInput): Promise<number> => 1,
        getById: async (_id: number): Promise<Card | undefined> => undefined,
        getAll: async (): Promise<Card[]> => [],
        update: async (_id: number, _updates: UpdateCardInput): Promise<void> => {},
        delete: async (_id: number): Promise<void> => {}
      };

      expect(mockCardCRUD).toBeDefined();
    });
  });

  describe('IDeckService interface', () => {
    it('should extend CRUDService with deck-specific methods', () => {
      const mockDeckService: IDeckService = {
        // CRUD methods
        create: async (_item: CreateDeckInput): Promise<number> => 1,
        getById: async (_id: number): Promise<Deck | undefined> => undefined,
        getAll: async (): Promise<Deck[]> => [],
        update: async (_id: number, _updates: UpdateDeckInput): Promise<void> => {},
        delete: async (_id: number): Promise<void> => {},
        
        // Deck-specific methods
        getDeckWithStats: async (_id: number): Promise<DeckWithStats | undefined> => undefined,
        searchDecks: async (_query: string): Promise<Deck[]> => [],
        isDuplicateName: async (_name: string, _excludeId?: number): Promise<boolean> => false
      };

      expect(typeof mockDeckService.getDeckWithStats).toBe('function');
      expect(typeof mockDeckService.searchDecks).toBe('function');
      expect(typeof mockDeckService.isDuplicateName).toBe('function');
    });

    it('should accept correct parameter types', async () => {
      const mockDeckService: IDeckService = {
        create: async (item: CreateDeckInput): Promise<number> => {
          expect(typeof item.name).toBe('string');
          return 1;
        },
        getById: async (_id: number): Promise<Deck | undefined> => undefined,
        getAll: async (): Promise<Deck[]> => [],
        update: async (_id: number, updates: UpdateDeckInput): Promise<void> => {
          expect(updates.name === undefined || typeof updates.name === 'string').toBe(true);
        },
        delete: async (_id: number): Promise<void> => {},
        getDeckWithStats: async (_id: number): Promise<DeckWithStats | undefined> => undefined,
        searchDecks: async (_query: string): Promise<Deck[]> => [],
        isDuplicateName: async (_name: string, _excludeId?: number): Promise<boolean> => false
      };

      await mockDeckService.create({ name: 'Test Deck' });
      await mockDeckService.update(1, { name: 'Updated Deck' });
    });
  });

  describe('ICardService interface', () => {
    it('should extend CRUDService with card-specific methods', () => {
      const mockCardService: ICardService = {
        // CRUD methods
        create: async (_item: CreateCardInput): Promise<number> => 1,
        getById: async (_id: number): Promise<Card | undefined> => undefined,
        getAll: async (): Promise<Card[]> => [],
        update: async (_id: number, _updates: UpdateCardInput): Promise<void> => {},
        delete: async (_id: number): Promise<void> => {},
        
        // Card-specific methods
        getCardsByDeck: async (_deckId: number): Promise<Card[]> => [],
        getCardsForStudy: async (_deckId: number): Promise<Card[]> => [],
        searchCards: async (_deckId: number, _query: string): Promise<Card[]> => [],
        getCardCount: async (_deckId: number): Promise<number> => 0
      };

      expect(typeof mockCardService.getCardsByDeck).toBe('function');
      expect(typeof mockCardService.getCardsForStudy).toBe('function');
      expect(typeof mockCardService.searchCards).toBe('function');
      expect(typeof mockCardService.getCardCount).toBe('function');
    });

    it('should accept correct parameter types', async () => {
      const mockCardService: ICardService = {
        create: async (item: CreateCardInput): Promise<number> => {
          expect(typeof item.deckId).toBe('number');
          expect(typeof item.front).toBe('string');
          expect(typeof item.back).toBe('string');
          return 1;
        },
        getById: async (_id: number): Promise<Card | undefined> => undefined,
        getAll: async (): Promise<Card[]> => [],
        update: async (_id: number, updates: UpdateCardInput): Promise<void> => {
          expect(updates.front === undefined || typeof updates.front === 'string').toBe(true);
        },
        delete: async (_id: number): Promise<void> => {},
        getCardsByDeck: async (_deckId: number): Promise<Card[]> => [],
        getCardsForStudy: async (_deckId: number): Promise<Card[]> => [],
        searchCards: async (_deckId: number, _query: string): Promise<Card[]> => [],
        getCardCount: async (_deckId: number): Promise<number> => 0
      };

      await mockCardService.create({
        deckId: 1,
        front: 'Question',
        back: 'Answer'
      });
      await mockCardService.update(1, { front: 'Updated Question' });
    });
  });

  describe('IStudyService interface', () => {
    it('should extend CRUDService with study-specific methods', () => {
      const mockStudyService: IStudyService = {
        // CRUD methods
        create: async (_item: CreateStudySessionInput): Promise<number> => 1,
        getById: async (_id: number): Promise<StudySession | undefined> => undefined,
        getAll: async (): Promise<StudySession[]> => [],
        update: async (_id: number, _updates: UpdateStudySessionInput): Promise<void> => {},
        delete: async (_id: number): Promise<void> => {},
        
        // Study-specific methods
        getStudyHistory: async (_cardId: number): Promise<StudySession[]> => [],
        getStudyStats: async (_cardId: number): Promise<StudyStats> => ({
          totalSessions: 0,
          averageQuality: 0,
          averageResponseTime: 0,
          studyStreak: 0
        }),
        recordStudySession: async (_cardId: number, _quality: number, _responseTime: number): Promise<number> => 1,
        getDeckStats: async (_deckId: number): Promise<DeckStats> => ({
          totalCards: 0,
          studiedCards: 0,
          averageQuality: 0
        }),
        getStudyHistoryByDateRange: async (_startDate: Date, _endDate: Date): Promise<StudySession[]> => []
      };

      expect(typeof mockStudyService.getStudyHistory).toBe('function');
      expect(typeof mockStudyService.getStudyStats).toBe('function');
      expect(typeof mockStudyService.recordStudySession).toBe('function');
      expect(typeof mockStudyService.getDeckStats).toBe('function');
      expect(typeof mockStudyService.getStudyHistoryByDateRange).toBe('function');
    });

    it('should accept correct parameter types', async () => {
      const mockStudyService: IStudyService = {
        create: async (item: CreateStudySessionInput): Promise<number> => {
          expect(typeof item.cardId).toBe('number');
          expect(typeof item.quality).toBe('number');
          expect(typeof item.responseTime).toBe('number');
          expect(item.studiedAt instanceof Date).toBe(true);
          return 1;
        },
        getById: async (_id: number): Promise<StudySession | undefined> => undefined,
        getAll: async (): Promise<StudySession[]> => [],
        update: async (_id: number, _updates: UpdateStudySessionInput): Promise<void> => {},
        delete: async (_id: number): Promise<void> => {},
        getStudyHistory: async (_cardId: number): Promise<StudySession[]> => [],
        getStudyStats: async (_cardId: number): Promise<StudyStats> => ({
          totalSessions: 0,
          averageQuality: 0,
          averageResponseTime: 0,
          studyStreak: 0
        }),
        recordStudySession: async (cardId: number, quality: number, responseTime: number): Promise<number> => {
          expect(typeof cardId).toBe('number');
          expect(typeof quality).toBe('number');
          expect(typeof responseTime).toBe('number');
          return 1;
        },
        getDeckStats: async (_deckId: number): Promise<DeckStats> => ({
          totalCards: 0,
          studiedCards: 0,
          averageQuality: 0
        }),
        getStudyHistoryByDateRange: async (_startDate: Date, _endDate: Date): Promise<StudySession[]> => []
      };

      await mockStudyService.create({
        cardId: 1,
        studiedAt: new Date(),
        quality: StudyQuality.GOOD,
        responseTime: 3000
      });
      await mockStudyService.recordStudySession(1, StudyQuality.GOOD, 3000);
    });
  });

  describe('Type compatibility', () => {
    it('should ensure interface methods return correct types', () => {
      // 반환 타입 검증을 위한 타입 어설션 테스트
      const mockDeckService: IDeckService = {
        create: async (_item: CreateDeckInput): Promise<number> => 1,
        getById: async (_id: number): Promise<Deck | undefined> => undefined,
        getAll: async (): Promise<Deck[]> => [],
        update: async (_id: number, _updates: UpdateDeckInput): Promise<void> => {},
        delete: async (_id: number): Promise<void> => {},
        getDeckWithStats: async (_id: number): Promise<DeckWithStats | undefined> => undefined,
        searchDecks: async (_query: string): Promise<Deck[]> => [],
        isDuplicateName: async (_name: string, _excludeId?: number): Promise<boolean> => false
      };

      // TypeScript 컴파일러가 타입을 올바르게 추론하는지 확인
      const createResult: Promise<number> = mockDeckService.create({ name: 'Test' });
      const getByIdResult: Promise<Deck | undefined> = mockDeckService.getById(1);
      const getAllResult: Promise<Deck[]> = mockDeckService.getAll();
      const searchResult: Promise<Deck[]> = mockDeckService.searchDecks('query');
      const duplicateResult: Promise<boolean> = mockDeckService.isDuplicateName('name');

      expect(createResult).toBeInstanceOf(Promise);
      expect(getByIdResult).toBeInstanceOf(Promise);
      expect(getAllResult).toBeInstanceOf(Promise);
      expect(searchResult).toBeInstanceOf(Promise);
      expect(duplicateResult).toBeInstanceOf(Promise);
    });
  });
});