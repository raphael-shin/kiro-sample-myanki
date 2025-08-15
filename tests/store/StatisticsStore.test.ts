import { useStatisticsStore, setStatisticsService } from '@/store/StatisticsStore';
import { IStatisticsService } from '@/services/StatisticsService';
import { DeckStatistics, GlobalStatistics, DailyGoals } from '@/types/flashcard';

describe('StatisticsStore', () => {
  let mockStatisticsService: jest.Mocked<IStatisticsService>;

  beforeEach(() => {
    useStatisticsStore.getState().reset?.();
    
    // Create mock StatisticsService
    mockStatisticsService = {
      getDeckStatistics: jest.fn().mockResolvedValue({
        deckId: 1,
        totalCards: 10,
        newCards: 5,
        learningCards: 3,
        reviewCards: 2,
        completedCards: 0,
        totalSessions: 15,
        totalStudyTime: 3600000,
        averageSessionTime: 240000,
        averageQuality: 3.2,
        createdAt: new Date(),
        retentionRate: 0.85,
        difficultyRating: 2.5,
        masteryLevel: 0.7
      } as DeckStatistics),
      getGlobalStatistics: jest.fn().mockResolvedValue({
        totalDecks: 3,
        totalCards: 50,
        totalSessions: 100,
        totalStudyTime: 18000000,
        overallAccuracy: 0.8,
        averageSessionLength: 180000,
        studyStreak: 5,
        longestStreak: 12,
        dailyAverage: 10,
        weeklyAverage: 70,
        monthlyAverage: 300,
        recentActivity: []
      } as GlobalStatistics),
      getDailyGoal: jest.fn().mockResolvedValue({
        cardsGoal: 20,
        timeGoal: 30,
        streakGoal: 7,
        cardsCompleted: 15,
        timeCompleted: 25,
        currentStreak: 3,
        totalAchievements: 5
      } as DailyGoals),
      setDailyGoal: jest.fn(),
      getDeckTrend: jest.fn(),
      getCardStatistics: jest.fn(),
      getCardLearningCurve: jest.fn(),
      getDailyProgress: jest.fn(),
      getWeeklyTrend: jest.fn(),
      getMonthlyReport: jest.fn(),
      checkGoalAchievement: jest.fn()
    } as any;
    
    setStatisticsService(mockStatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    setStatisticsService(null as any);
  });

  describe('Basic Structure', () => {
    it('should initialize with default state', () => {
      const state = useStatisticsStore.getState();
      
      expect(state.deckStats).toEqual(new Map());
      expect(state.globalStats).toBeNull();
      expect(state.dailyGoals).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should have all required actions', () => {
      const state = useStatisticsStore.getState();
      
      expect(typeof state.loadDeckStats).toBe('function');
      expect(typeof state.loadGlobalStats).toBe('function');
      expect(typeof state.updateDailyGoal).toBe('function');
      expect(typeof state.getDailyProgress).toBe('function');
      expect(typeof state.getWeeklyTrend).toBe('function');
    });
  });

  describe('loadDeckStats()', () => {
    it('should load deck statistics successfully', async () => {
      const { loadDeckStats } = useStatisticsStore.getState();
      
      await loadDeckStats(1);
      
      const state = useStatisticsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.deckStats.has(1)).toBe(true);
      expect(state.deckStats.get(1)?.totalCards).toBe(10);
      expect(mockStatisticsService.getDeckStatistics).toHaveBeenCalledWith(1);
    });

    it('should handle deck statistics loading error', async () => {
      const { loadDeckStats } = useStatisticsStore.getState();
      
      mockStatisticsService.getDeckStatistics.mockRejectedValue(new Error('Load failed'));
      
      await loadDeckStats(1);
      
      const state = useStatisticsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Load failed');
      expect(state.deckStats.has(1)).toBe(false);
    });

    it('should set loading state during deck stats loading', async () => {
      const { loadDeckStats } = useStatisticsStore.getState();
      
      // Mock a delayed response
      mockStatisticsService.getDeckStatistics.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({} as DeckStatistics), 100))
      );
      
      const loadPromise = loadDeckStats(1);
      
      // Check loading state immediately
      expect(useStatisticsStore.getState().loading).toBe(true);
      
      await loadPromise;
      
      expect(useStatisticsStore.getState().loading).toBe(false);
    });
  });

  describe('loadGlobalStats()', () => {
    it('should load global statistics successfully', async () => {
      const { loadGlobalStats } = useStatisticsStore.getState();
      
      await loadGlobalStats();
      
      const state = useStatisticsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.globalStats).toBeDefined();
      expect(state.globalStats?.totalDecks).toBe(3);
      expect(mockStatisticsService.getGlobalStatistics).toHaveBeenCalled();
    });

    it('should handle global statistics loading error', async () => {
      const { loadGlobalStats } = useStatisticsStore.getState();
      
      mockStatisticsService.getGlobalStatistics.mockRejectedValue(new Error('Global load failed'));
      
      await loadGlobalStats();
      
      const state = useStatisticsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Global load failed');
      expect(state.globalStats).toBeNull();
    });
  });

  describe('Deck Statistics Caching', () => {
    it('should cache deck statistics after loading', async () => {
      const { loadDeckStats } = useStatisticsStore.getState();
      
      await loadDeckStats(1);
      await loadDeckStats(2);
      
      const state = useStatisticsStore.getState();
      expect(state.deckStats.size).toBe(2);
      expect(state.deckStats.has(1)).toBe(true);
      expect(state.deckStats.has(2)).toBe(true);
    });

    it('should update existing deck statistics when reloaded', async () => {
      const { loadDeckStats } = useStatisticsStore.getState();
      
      // First load
      await loadDeckStats(1);
      expect(useStatisticsStore.getState().deckStats.get(1)?.totalCards).toBe(10);
      
      // Mock updated statistics
      mockStatisticsService.getDeckStatistics.mockResolvedValue({
        deckId: 1,
        totalCards: 15, // Updated value
        newCards: 5,
        learningCards: 5,
        reviewCards: 5,
        completedCards: 0,
        totalSessions: 20,
        totalStudyTime: 4800000,
        averageSessionTime: 240000,
        averageQuality: 3.5,
        createdAt: new Date(),
        retentionRate: 0.9,
        difficultyRating: 2.0,
        masteryLevel: 0.8
      } as DeckStatistics);
      
      // Second load
      await loadDeckStats(1);
      expect(useStatisticsStore.getState().deckStats.get(1)?.totalCards).toBe(15);
    });

    it('should clear deck statistics cache', () => {
      const { loadDeckStats, clearDeckStats } = useStatisticsStore.getState();
      
      // Load some stats first
      loadDeckStats(1);
      loadDeckStats(2);
      
      clearDeckStats();
      
      const state = useStatisticsStore.getState();
      expect(state.deckStats.size).toBe(0);
    });

    it('should remove specific deck from cache', async () => {
      const { loadDeckStats, removeDeckStats } = useStatisticsStore.getState();
      
      await loadDeckStats(1);
      await loadDeckStats(2);
      
      expect(useStatisticsStore.getState().deckStats.size).toBe(2);
      
      removeDeckStats(1);
      
      const state = useStatisticsStore.getState();
      expect(state.deckStats.size).toBe(1);
      expect(state.deckStats.has(1)).toBe(false);
      expect(state.deckStats.has(2)).toBe(true);
    });
  });

  describe('Global Statistics Management', () => {
    it('should refresh global statistics', async () => {
      const { loadGlobalStats, refreshGlobalStats } = useStatisticsStore.getState();
      
      // Initial load
      await loadGlobalStats();
      expect(useStatisticsStore.getState().globalStats?.totalDecks).toBe(3);
      
      // Mock updated statistics
      mockStatisticsService.getGlobalStatistics.mockResolvedValue({
        totalDecks: 5, // Updated value
        totalCards: 75,
        totalSessions: 150,
        totalStudyTime: 27000000,
        overallAccuracy: 0.85,
        averageSessionLength: 180000,
        studyStreak: 7,
        longestStreak: 15,
        dailyAverage: 12,
        weeklyAverage: 84,
        monthlyAverage: 360,
        recentActivity: []
      } as GlobalStatistics);
      
      // Refresh
      await refreshGlobalStats();
      expect(useStatisticsStore.getState().globalStats?.totalDecks).toBe(5);
    });

    it('should handle concurrent global stats loading', async () => {
      const { loadGlobalStats } = useStatisticsStore.getState();
      
      // Start multiple concurrent loads
      const promise1 = loadGlobalStats();
      const promise2 = loadGlobalStats();
      const promise3 = loadGlobalStats();
      
      await Promise.all([promise1, promise2, promise3]);
      
      const state = useStatisticsStore.getState();
      expect(state.globalStats).toBeDefined();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      
      // Service should be called multiple times but state should be consistent
      expect(mockStatisticsService.getGlobalStatistics).toHaveBeenCalledTimes(3);
    });

    it('should clear global statistics', () => {
      const { loadGlobalStats, clearGlobalStats } = useStatisticsStore.getState();
      
      // Load stats first
      loadGlobalStats();
      
      clearGlobalStats();
      
      const state = useStatisticsStore.getState();
      expect(state.globalStats).toBeNull();
      expect(state.dailyGoals).toBeNull();
    });
  });

  describe('Goal Management', () => {
    it('should update daily goal and reload goals', async () => {
      const { updateDailyGoal } = useStatisticsStore.getState();
      
      await updateDailyGoal('cards', 25);
      
      const state = useStatisticsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.dailyGoals).toBeDefined();
      expect(mockStatisticsService.setDailyGoal).toHaveBeenCalledWith('cards', 25);
      expect(mockStatisticsService.getDailyGoal).toHaveBeenCalledTimes(1); // Only in updateDailyGoal
    });

    it('should handle goal update error', async () => {
      const { updateDailyGoal } = useStatisticsStore.getState();
      
      mockStatisticsService.setDailyGoal.mockRejectedValue(new Error('Goal update failed'));
      
      await updateDailyGoal('time', 45);
      
      const state = useStatisticsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Goal update failed');
    });

    it('should check goal achievement', async () => {
      const { checkGoalAchievement } = useStatisticsStore.getState();
      
      mockStatisticsService.checkGoalAchievement.mockResolvedValue({
        date: new Date(),
        cardsGoalAchieved: true,
        timeGoalAchieved: false,
        streakGoalAchieved: true,
        overallProgress: 0.75,
        achievements: ['Daily cards goal achieved!'],
        nextMilestone: {
          type: 'time',
          target: 30,
          current: 25,
          remaining: 5
        }
      });
      
      const achievement = await checkGoalAchievement();
      
      expect(achievement).toBeDefined();
      expect(achievement.cardsGoalAchieved).toBe(true);
      expect(achievement.timeGoalAchieved).toBe(false);
      expect(achievement.overallProgress).toBe(0.75);
      expect(mockStatisticsService.checkGoalAchievement).toHaveBeenCalled();
    });

    it('should handle goal achievement check error', async () => {
      const { checkGoalAchievement } = useStatisticsStore.getState();
      
      mockStatisticsService.checkGoalAchievement.mockRejectedValue(new Error('Achievement check failed'));
      
      await expect(checkGoalAchievement()).rejects.toThrow('Achievement check failed');
      
      const state = useStatisticsStore.getState();
      expect(state.error).toBe('Achievement check failed');
    });
  });
});
