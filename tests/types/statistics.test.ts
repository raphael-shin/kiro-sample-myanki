import { DeckStatistics, GlobalStatistics, DailyGoals } from '@/types/flashcard';

describe('Statistics Interfaces', () => {
  describe('DeckStatistics', () => {
    it('should validate DeckStatistics structure', () => {
      const deckStats: DeckStatistics = {
        deckId: 1,
        totalCards: 100,
        newCards: 20,
        learningCards: 30,
        reviewCards: 40,
        completedCards: 10,
        totalSessions: 15,
        totalStudyTime: 3600,
        averageSessionTime: 240,
        averageQuality: 3.2,
        createdAt: new Date(),
        retentionRate: 0.85,
        difficultyRating: 2.5,
        masteryLevel: 0.7
      };

      expect(deckStats.deckId).toBe(1);
      expect(deckStats.totalCards).toBe(100);
      expect(deckStats.newCards).toBe(20);
      expect(deckStats.retentionRate).toBe(0.85);
      expect(deckStats.masteryLevel).toBe(0.7);
    });

    it('should support optional lastStudiedAt field', () => {
      const deckStats: DeckStatistics = {
        deckId: 2,
        totalCards: 50,
        newCards: 10,
        learningCards: 15,
        reviewCards: 20,
        completedCards: 5,
        totalSessions: 8,
        totalStudyTime: 1800,
        averageSessionTime: 225,
        averageQuality: 2.8,
        lastStudiedAt: new Date(),
        createdAt: new Date(),
        retentionRate: 0.75,
        difficultyRating: 3.0,
        masteryLevel: 0.5
      };

      expect(deckStats.lastStudiedAt).toBeInstanceOf(Date);
    });
  });

  describe('GlobalStatistics', () => {
    it('should validate GlobalStatistics structure', () => {
      const globalStats: GlobalStatistics = {
        totalDecks: 5,
        totalCards: 500,
        totalSessions: 100,
        totalStudyTime: 18000,
        overallAccuracy: 0.82,
        averageSessionLength: 180,
        studyStreak: 7,
        longestStreak: 15,
        dailyAverage: 3.5,
        weeklyAverage: 24.5,
        monthlyAverage: 105,
        recentActivity: []
      };

      expect(globalStats.totalDecks).toBe(5);
      expect(globalStats.totalCards).toBe(500);
      expect(globalStats.overallAccuracy).toBe(0.82);
      expect(globalStats.studyStreak).toBe(7);
      expect(globalStats.longestStreak).toBe(15);
    });

    it('should support optional lastStudyDate field', () => {
      const globalStats: GlobalStatistics = {
        totalDecks: 3,
        totalCards: 300,
        totalSessions: 60,
        totalStudyTime: 10800,
        overallAccuracy: 0.78,
        averageSessionLength: 180,
        studyStreak: 3,
        longestStreak: 10,
        dailyAverage: 2.5,
        weeklyAverage: 17.5,
        monthlyAverage: 75,
        lastStudyDate: new Date(),
        recentActivity: []
      };

      expect(globalStats.lastStudyDate).toBeInstanceOf(Date);
    });
  });

  describe('DailyGoals', () => {
    it('should validate DailyGoals structure', () => {
      const dailyGoals: DailyGoals = {
        cardsGoal: 20,
        timeGoal: 60,
        streakGoal: 7,
        cardsCompleted: 15,
        timeCompleted: 45,
        currentStreak: 5,
        totalAchievements: 12
      };

      expect(dailyGoals.cardsGoal).toBe(20);
      expect(dailyGoals.timeGoal).toBe(60);
      expect(dailyGoals.streakGoal).toBe(7);
      expect(dailyGoals.cardsCompleted).toBe(15);
      expect(dailyGoals.currentStreak).toBe(5);
      expect(dailyGoals.totalAchievements).toBe(12);
    });

    it('should support optional lastAchievedDate field', () => {
      const dailyGoals: DailyGoals = {
        cardsGoal: 25,
        timeGoal: 90,
        streakGoal: 10,
        cardsCompleted: 25,
        timeCompleted: 90,
        currentStreak: 10,
        lastAchievedDate: new Date(),
        totalAchievements: 20
      };

      expect(dailyGoals.lastAchievedDate).toBeInstanceOf(Date);
    });
  });
});
