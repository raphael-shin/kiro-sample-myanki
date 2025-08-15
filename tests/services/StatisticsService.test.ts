import { StatisticsService } from '@/services/StatisticsService';
import { DeckStatistics, GlobalStatistics, DailyGoals } from '@/types/flashcard';

// Mock IndexedDB
import 'fake-indexeddb/auto';

// Mock MyAnkiDB
jest.mock('@/db/MyAnkiDB', () => {
  const { MyAnkiDB } = require('../__mocks__/MyAnkiDB');
  return { MyAnkiDB };
});

describe('StatisticsService', () => {
  let statisticsService: StatisticsService;
  let mockDb: any;

  beforeEach(() => {
    const { MyAnkiDB } = require('../__mocks__/MyAnkiDB');
    mockDb = new MyAnkiDB();
    statisticsService = new StatisticsService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeckStatistics()', () => {
    it('should return deck statistics', async () => {
      const deckId = 1;
      
      // Mock deck data
      mockDb.decks.get = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test Deck',
        createdAt: new Date()
      });
      
      // Mock cards data
      mockDb.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { id: 1, deckId: 1, front: 'Card 1', back: 'Back 1' },
            { id: 2, deckId: 1, front: 'Card 2', back: 'Back 2' }
          ])
        })
      });
      
      // Mock study sessions data
      mockDb.studySessions.toArray = jest.fn().mockResolvedValue([]);
      
      const stats = await statisticsService.getDeckStatistics(deckId);
      
      expect(stats).toBeDefined();
      expect(stats.deckId).toBe(deckId);
      expect(stats.totalCards).toBe(2);
      expect(stats.newCards).toBeGreaterThanOrEqual(0);
      expect(stats.totalSessions).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for non-existent deck', async () => {
      const nonExistentDeckId = 999;
      
      mockDb.decks.get = jest.fn().mockResolvedValue(undefined);
      
      await expect(statisticsService.getDeckStatistics(nonExistentDeckId))
        .rejects
        .toThrow();
    });
  });

  describe('getGlobalStatistics()', () => {
    it('should return global statistics', async () => {
      // Mock decks data
      mockDb.decks.toArray = jest.fn().mockResolvedValue([
        { id: 1, name: 'Deck 1' },
        { id: 2, name: 'Deck 2' }
      ]);
      
      // Mock cards data
      mockDb.cards.toArray = jest.fn().mockResolvedValue([
        { id: 1, deckId: 1 },
        { id: 2, deckId: 1 },
        { id: 3, deckId: 2 }
      ]);
      
      // Mock study sessions data
      mockDb.studySessions.toArray = jest.fn().mockResolvedValue([]);
      
      const stats = await statisticsService.getGlobalStatistics();
      
      expect(stats).toBeDefined();
      expect(stats.totalDecks).toBe(2);
      expect(stats.totalCards).toBe(3);
      expect(stats.totalSessions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getDailyGoal()', () => {
    it('should return daily goals', async () => {
      const goals = await statisticsService.getDailyGoal();
      
      expect(goals).toBeDefined();
      expect(goals.cardsGoal).toBeGreaterThanOrEqual(0);
      expect(goals.timeGoal).toBeGreaterThanOrEqual(0);
      expect(goals.cardsCompleted).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getDeckTrend()', () => {
    it('should return deck trend data', async () => {
      const deckId = 1;
      const timeRange = 'week';
      
      // Mock deck existence
      mockDb.decks.get = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test Deck'
      });
      
      const trendData = await statisticsService.getDeckTrend(deckId, timeRange);
      
      expect(trendData).toBeDefined();
      expect(Array.isArray(trendData.dataPoints)).toBe(true);
      expect(trendData.period).toBe(timeRange);
    });
  });

  describe('calculateDetailedDeckStats()', () => {
    it('should calculate detailed deck statistics with card classification', async () => {
      const deckId = 1;
      
      // Mock deck data
      mockDb.decks.get = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test Deck',
        createdAt: new Date()
      });
      
      // Mock cards with different study states
      mockDb.cards.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { id: 1, deckId: 1, front: 'New Card', back: 'Back 1' },
            { id: 2, deckId: 1, front: 'Learning Card', back: 'Back 2' },
            { id: 3, deckId: 1, front: 'Review Card', back: 'Back 3' }
          ])
        })
      });
      
      // Mock study sessions with different patterns
      mockDb.studySessions.toArray = jest.fn().mockResolvedValue([
        { id: 1, cardId: 2, quality: 2, responseTime: 5000, studiedAt: new Date() },
        { id: 2, cardId: 3, quality: 4, responseTime: 3000, studiedAt: new Date() }
      ]);
      
      const stats = await statisticsService.getDeckStatistics(deckId);
      
      expect(stats.newCards).toBeGreaterThanOrEqual(0);
      expect(stats.learningCards).toBeGreaterThanOrEqual(0);
      expect(stats.reviewCards).toBeGreaterThanOrEqual(0);
      expect(stats.retentionRate).toBeGreaterThanOrEqual(0);
      expect(stats.difficultyRating).toBeGreaterThanOrEqual(0);
      expect(stats.masteryLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getCardStatistics()', () => {
    it('should return card statistics', async () => {
      const cardId = 1;
      
      // Mock card existence
      mockDb.cards.get = jest.fn().mockResolvedValue({
        id: 1,
        deckId: 1,
        front: 'Test Card',
        back: 'Test Back'
      });
      
      // Mock study sessions for the card
      mockDb.studySessions.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              { id: 1, cardId: 1, quality: 3, responseTime: 5000, studiedAt: new Date() },
              { id: 2, cardId: 1, quality: 4, responseTime: 3000, studiedAt: new Date() }
            ])
          })
        })
      });
      
      const cardStats = await statisticsService.getCardStatistics(cardId);
      
      expect(cardStats).toBeDefined();
      expect(cardStats.cardId).toBe(cardId);
      expect(cardStats.totalReviews).toBeGreaterThanOrEqual(0);
      expect(cardStats.averageQuality).toBeGreaterThanOrEqual(0);
      expect(cardStats.currentInterval).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for non-existent card', async () => {
      const nonExistentCardId = 999;
      
      mockDb.cards.get = jest.fn().mockResolvedValue(undefined);
      
      await expect(statisticsService.getCardStatistics(nonExistentCardId))
        .rejects
        .toThrow();
    });
  });

  describe('getCardLearningCurve()', () => {
    it('should return learning curve data', async () => {
      const cardId = 1;
      
      // Mock card existence
      mockDb.cards.get = jest.fn().mockResolvedValue({
        id: 1,
        deckId: 1,
        front: 'Test Card',
        back: 'Test Back'
      });
      
      // Mock study sessions with progression
      mockDb.studySessions.where = jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
              { id: 1, cardId: 1, quality: 2, responseTime: 8000, studiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              { id: 2, cardId: 1, quality: 3, responseTime: 5000, studiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
              { id: 3, cardId: 1, quality: 4, responseTime: 3000, studiedAt: new Date() }
            ])
          })
        })
      });
      
      const learningCurve = await statisticsService.getCardLearningCurve(cardId);
      
      expect(learningCurve).toBeDefined();
      expect(Array.isArray(learningCurve.qualityProgression)).toBe(true);
      expect(Array.isArray(learningCurve.responseTimeProgression)).toBe(true);
      expect(learningCurve.improvementTrend).toBeDefined();
    });
  });

  describe('getDailyProgress()', () => {
    it('should return daily progress data', async () => {
      // Mock today's study sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      mockDb.studySessions.where = jest.fn().mockReturnValue({
        above: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { id: 1, cardId: 1, quality: 3, responseTime: 5000, studiedAt: new Date() },
            { id: 2, cardId: 2, quality: 4, responseTime: 3000, studiedAt: new Date() }
          ])
        })
      });
      
      const dailyProgress = await statisticsService.getDailyProgress();
      
      expect(dailyProgress).toBeDefined();
      expect(dailyProgress.cardsStudied).toBeGreaterThanOrEqual(0);
      expect(dailyProgress.timeSpent).toBeGreaterThanOrEqual(0);
      expect(dailyProgress.averageQuality).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getWeeklyTrend()', () => {
    it('should return weekly trend data', async () => {
      // Mock study sessions for the past week
      mockDb.studySessions.where = jest.fn().mockReturnValue({
        above: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { id: 1, cardId: 1, quality: 3, responseTime: 5000, studiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { id: 2, cardId: 2, quality: 4, responseTime: 3000, studiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { id: 3, cardId: 3, quality: 2, responseTime: 7000, studiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
          ])
        })
      });
      
      const weeklyTrend = await statisticsService.getWeeklyTrend();
      
      expect(weeklyTrend).toBeDefined();
      expect(Array.isArray(weeklyTrend.dailyData)).toBe(true);
      expect(weeklyTrend.totalCards).toBeGreaterThanOrEqual(0);
      expect(weeklyTrend.averageDaily).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getMonthlyReport()', () => {
    it('should return monthly report data', async () => {
      // Mock comprehensive data for monthly report
      mockDb.decks.toArray = jest.fn().mockResolvedValue([
        { id: 1, name: 'Deck 1', createdAt: new Date() }
      ]);
      
      mockDb.cards.toArray = jest.fn().mockResolvedValue([
        { id: 1, deckId: 1, front: 'Card 1', back: 'Back 1' }
      ]);
      
      mockDb.studySessions.where = jest.fn().mockReturnValue({
        above: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { id: 1, cardId: 1, quality: 3, responseTime: 5000, studiedAt: new Date() }
          ])
        })
      });
      
      const monthlyReport = await statisticsService.getMonthlyReport();
      
      expect(monthlyReport).toBeDefined();
      expect(monthlyReport.period).toBe('month');
      expect(monthlyReport.totalStudySessions).toBeGreaterThanOrEqual(0);
      expect(monthlyReport.averageSessionsPerDay).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkGoalAchievement()', () => {
    it('should check goal achievement status', async () => {
      // Mock today's study sessions for goal checking
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      mockDb.studySessions.where = jest.fn().mockReturnValue({
        above: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { id: 1, cardId: 1, quality: 3, responseTime: 5000, studiedAt: new Date() },
            { id: 2, cardId: 2, quality: 4, responseTime: 3000, studiedAt: new Date() }
          ])
        })
      });
      
      const achievement = await statisticsService.checkGoalAchievement();
      
      expect(achievement).toBeDefined();
      expect(achievement.date).toBeInstanceOf(Date);
      expect(achievement.cardsGoalAchieved).toBeDefined();
      expect(achievement.timeGoalAchieved).toBeDefined();
      expect(achievement.overallProgress).toBeGreaterThanOrEqual(0);
    });
  });

  describe('setDailyGoal()', () => {
    it('should set cards goal successfully', async () => {
      const goalType = 'cards';
      const value = 25;
      
      await expect(statisticsService.setDailyGoal(goalType, value))
        .resolves
        .not.toThrow();
    });

    it('should set time goal successfully', async () => {
      const goalType = 'time';
      const value = 45;
      
      await expect(statisticsService.setDailyGoal(goalType, value))
        .resolves
        .not.toThrow();
    });

    it('should throw error for invalid goal value', async () => {
      const goalType = 'cards';
      const invalidValue = -5;
      
      await expect(statisticsService.setDailyGoal(goalType, invalidValue))
        .rejects
        .toThrow();
    });
  });
});
