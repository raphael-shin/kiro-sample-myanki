import { OfflineStatisticsService } from '@/services/OfflineStatisticsService';
import { db } from '@/db/MyAnkiDB';

// Mock the database
jest.mock('@/db/MyAnkiDB', () => ({
  db: {
    studySessions: {
      toArray: jest.fn(),
      where: jest.fn(),
    },
    cards: {
      toArray: jest.fn(),
      where: jest.fn(),
    },
    decks: {
      toArray: jest.fn(),
    },
  },
}));

describe('OfflineStatisticsService', () => {
  let service: OfflineStatisticsService;
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    service = new OfflineStatisticsService();
    jest.clearAllMocks();
  });

  describe('calculateOfflineStats', () => {
    it('should calculate basic statistics from local data', async () => {
      const mockSessions = [
        { id: 1, cardId: 1, studiedAt: new Date(), quality: 3, responseTime: 1000 },
        { id: 2, cardId: 2, studiedAt: new Date(), quality: 4, responseTime: 1500 },
        { id: 3, cardId: 1, studiedAt: new Date(), quality: 2, responseTime: 2000 },
      ];

      const mockSpacedRepData = [
        { cardId: 1, easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewDate: new Date(), lastReviewDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { cardId: 2, easeFactor: 2.6, interval: 2, repetitions: 2, nextReviewDate: new Date(), lastReviewDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
      ];

      mockDb.studySessions.toArray.mockResolvedValue(mockSessions);
      mockDb.cards.toArray.mockResolvedValue([]);
      mockDb.spacedRepetitionData = {
        toArray: jest.fn().mockResolvedValue(mockSpacedRepData),
      } as any;

      const result = await service.calculateOfflineStats();

      expect(result).toEqual({
        totalSessions: 3,
        totalCardsStudied: 3,
        averageEaseFactor: 2.55,
        lastUpdated: expect.any(Date),
      });
    });

    it('should handle empty data', async () => {
      mockDb.studySessions.toArray.mockResolvedValue([]);
      mockDb.cards.toArray.mockResolvedValue([]);
      mockDb.spacedRepetitionData = {
        toArray: jest.fn().mockResolvedValue([]),
      } as any;

      const result = await service.calculateOfflineStats();

      expect(result).toEqual({
        totalSessions: 0,
        totalCardsStudied: 0,
        averageEaseFactor: 0,
        lastUpdated: expect.any(Date),
      });
    });
  });

  describe('getDeckOfflineStats', () => {
    it('should calculate deck-specific statistics', async () => {
      const deckId = 1;
      const mockSessions = [
        { id: 1, cardId: 1, studiedAt: new Date(), quality: 3, responseTime: 1000 },
        { id: 2, cardId: 2, studiedAt: new Date(), quality: 4, responseTime: 1500 },
        { id: 3, cardId: 3, studiedAt: new Date(), quality: 2, responseTime: 2000 }, // Different deck
      ];

      const mockCards = [
        { id: 1, deckId, front: 'Test', back: 'Answer', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, deckId, front: 'Test2', back: 'Answer2', createdAt: new Date(), updatedAt: new Date() },
      ];

      const mockSpacedRepData = [
        { cardId: 1, easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewDate: new Date(), lastReviewDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { cardId: 2, easeFactor: 2.7, interval: 3, repetitions: 2, nextReviewDate: new Date(), lastReviewDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
      ];

      mockDb.cards.where.mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockCards),
        }),
      });

      mockDb.studySessions.toArray.mockResolvedValue(mockSessions);

      mockDb.spacedRepetitionData = {
        where: jest.fn().mockReturnValue({
          anyOf: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockSpacedRepData),
          }),
        }),
      } as any;

      const result = await service.getDeckOfflineStats(deckId);

      expect(result).toEqual({
        deckId,
        totalCards: 2,
        totalSessions: 2, // Only sessions for cards 1 and 2
        averageEaseFactor: 2.6,
        lastUpdated: expect.any(Date),
      });
    });
  });
});
