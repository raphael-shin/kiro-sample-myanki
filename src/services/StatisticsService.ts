import { MyAnkiDB } from '@/db/MyAnkiDB';
import {
  DeckStatistics,
  GlobalStatistics,
  DailyGoals,
  StudySession,
  Card,
  Deck,
  TrendData,
  TimeRange,
  CardStatistics,
  LearningCurveData,
  DailyProgress,
  WeeklyTrend,
  MonthlyReport,
  GoalAchievement
} from '@/types/flashcard';
import { ErrorFactory } from '@/types/errors';

/**
 * StatisticsService 인터페이스
 */
export interface IStatisticsService {
  getDeckStatistics(deckId: number): Promise<DeckStatistics>;
  getGlobalStatistics(): Promise<GlobalStatistics>;
  getDailyGoal(): Promise<DailyGoals>;
  setDailyGoal(goalType: 'cards' | 'time', value: number): Promise<void>;
  getDeckTrend(deckId: number, timeRange: TimeRange): Promise<TrendData>;
  getCardStatistics(cardId: number): Promise<CardStatistics>;
  getCardLearningCurve(cardId: number): Promise<LearningCurveData>;
  getDailyProgress(): Promise<DailyProgress>;
  getWeeklyTrend(): Promise<WeeklyTrend>;
  getMonthlyReport(): Promise<MonthlyReport>;
  checkGoalAchievement(): Promise<GoalAchievement>;
}

/**
 * StatisticsService 클래스
 * 통계 계산과 분석을 담당하는 서비스
 */
export class StatisticsService implements IStatisticsService {
  constructor(private db: MyAnkiDB) {}

  /**
   * 덱 통계 조회
   */
  async getDeckStatistics(deckId: number): Promise<DeckStatistics> {
    try {
      // 덱 존재 확인
      const deck = await this.db.decks.get(deckId);
      if (!deck) {
        throw ErrorFactory.deck.notFound(deckId);
      }

      // 덱의 카드들 조회
      const cards = await this.db.cards
        .where('deckId')
        .equals(deckId)
        .toArray();

      // 학습 세션 조회
      const sessions = await this.db.studySessions.toArray();
      const deckSessions = sessions.filter(session => 
        cards.some(card => card.id === session.cardId)
      );

      return this.calculateDeckStatistics(deckId, cards, deckSessions, deck.createdAt || new Date());
    } catch (error) {
      if (error instanceof Error && error.name === 'MyAnkiError') {
        throw error;
      }
      throw ErrorFactory.database('get deck statistics', error as Error);
    }
  }

  /**
   * 전체 통계 조회
   */
  async getGlobalStatistics(): Promise<GlobalStatistics> {
    try {
      const decks = await this.db.decks.toArray();
      const cards = await this.db.cards.toArray();
      const sessions = await this.db.studySessions.toArray();

      return this.calculateGlobalStatistics(decks, cards, sessions);
    } catch (error) {
      throw ErrorFactory.database('get global statistics', error as Error);
    }
  }

  /**
   * 일일 목표 조회
   */
  async getDailyGoal(): Promise<DailyGoals> {
    try {
      // 간단한 구현: 기본값 반환
      return {
        cardsGoal: 20,
        timeGoal: 30,
        streakGoal: 7,
        cardsCompleted: 0,
        timeCompleted: 0,
        currentStreak: 0,
        totalAchievements: 0
      };
    } catch (error) {
      throw ErrorFactory.database('get daily goal', error as Error);
    }
  }

  /**
   * 목표 달성 확인
   */
  async checkGoalAchievement(): Promise<GoalAchievement> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySessions = await this.db.studySessions
        .where('studiedAt')
        .above(today)
        .toArray();

      const dailyGoals = await this.getDailyGoal();
      
      return this.calculateGoalAchievement(today, todaySessions, dailyGoals);
    } catch (error) {
      throw ErrorFactory.database('check goal achievement', error as Error);
    }
  }

  /**
   * 일일 목표 설정
   */
  async setDailyGoal(goalType: 'cards' | 'time', value: number): Promise<void> {
    try {
      this.validateGoalValue(goalType, value);
      await this.updateGoalSetting(goalType, value);
    } catch (error) {
      if (error instanceof Error && error.name === 'MyAnkiError') {
        throw error;
      }
      throw ErrorFactory.database('set daily goal', error as Error);
    }
  }

  /**
   * 목표 값 유효성 검사
   */
  private validateGoalValue(goalType: 'cards' | 'time', value: number): void {
    if (value < 0) {
      throw ErrorFactory.validation('goal value', value, 'Goal value must be non-negative');
    }

    if (goalType === 'cards' && value > 1000) {
      throw ErrorFactory.validation('cards goal', value, 'Cards goal cannot exceed 1000 per day');
    }

    if (goalType === 'time' && value > 1440) { // 24시간 = 1440분
      throw ErrorFactory.validation('time goal', value, 'Time goal cannot exceed 1440 minutes per day');
    }
  }

  /**
   * 목표 설정 업데이트
   */
  private async updateGoalSetting(goalType: 'cards' | 'time', value: number): Promise<void> {
    // 간단한 구현: 로그만 출력
    console.log(`Setting ${goalType} goal to ${value}`);
    // 실제 구현에서는 데이터베이스에 저장
  }

  /**
   * 일일 진행률 조회
   */
  async getDailyProgress(): Promise<DailyProgress> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySessions = await this.db.studySessions
        .where('studiedAt')
        .above(today)
        .toArray();

      return this.calculateDailyProgress(today, todaySessions);
    } catch (error) {
      throw ErrorFactory.database('get daily progress', error as Error);
    }
  }

  /**
   * 주간 트렌드 조회
   */
  async getWeeklyTrend(): Promise<WeeklyTrend> {
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weekSessions = await this.db.studySessions
        .where('studiedAt')
        .above(weekStart)
        .toArray();

      return this.calculateWeeklyTrend(weekStart, weekSessions);
    } catch (error) {
      throw ErrorFactory.database('get weekly trend', error as Error);
    }
  }

  /**
   * 월간 리포트 조회
   */
  async getMonthlyReport(): Promise<MonthlyReport> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const decks = await this.db.decks.toArray();
      const cards = await this.db.cards.toArray();
      const monthlySessions = await this.db.studySessions
        .where('studiedAt')
        .above(monthStart)
        .toArray();

      return this.calculateMonthlyReport(now, decks, cards, monthlySessions);
    } catch (error) {
      throw ErrorFactory.database('get monthly report', error as Error);
    }
  }

  /**
   * 카드 통계 조회
   */
  async getCardStatistics(cardId: number): Promise<CardStatistics> {
    try {
      // 카드 존재 확인
      const card = await this.db.cards.get(cardId);
      if (!card) {
        throw ErrorFactory.card.notFound(cardId);
      }

      // 카드의 학습 세션들 조회
      const sessions = await this.db.studySessions
        .where('cardId')
        .equals(cardId)
        .orderBy('studiedAt')
        .toArray();

      return this.calculateCardStatistics(cardId, sessions);
    } catch (error) {
      if (error instanceof Error && error.name === 'MyAnkiError') {
        throw error;
      }
      throw ErrorFactory.database('get card statistics', error as Error);
    }
  }

  /**
   * 카드 학습 곡선 조회
   */
  async getCardLearningCurve(cardId: number): Promise<LearningCurveData> {
    try {
      // 카드 존재 확인
      const card = await this.db.cards.get(cardId);
      if (!card) {
        throw ErrorFactory.card.notFound(cardId);
      }

      // 카드의 학습 세션들 조회
      const sessions = await this.db.studySessions
        .where('cardId')
        .equals(cardId)
        .orderBy('studiedAt')
        .toArray();

      return this.calculateLearningCurve(cardId, sessions);
    } catch (error) {
      if (error instanceof Error && error.name === 'MyAnkiError') {
        throw error;
      }
      throw ErrorFactory.database('get card learning curve', error as Error);
    }
  }

  /**
   * 덱 트렌드 조회
   */
  async getDeckTrend(deckId: number, timeRange: TimeRange): Promise<TrendData> {
    try {
      // 덱 존재 확인
      const deck = await this.db.decks.get(deckId);
      if (!deck) {
        throw ErrorFactory.deck.notFound(deckId);
      }

      return this.calculateTrendData(deckId, timeRange);
    } catch (error) {
      if (error instanceof Error && error.name === 'MyAnkiError') {
        throw error;
      }
      throw ErrorFactory.database('get deck trend', error as Error);
    }
  }

  /**
   * 덱 통계 계산
   */
  private calculateDeckStatistics(
    deckId: number,
    cards: Card[],
    sessions: StudySession[],
    createdAt: Date
  ): DeckStatistics {
    const totalCards = cards.length;
    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.responseTime, 0);
    const averageSessionTime = totalSessions > 0 ? totalStudyTime / totalSessions : 0;
    const averageQuality = totalSessions > 0 
      ? sessions.reduce((sum, session) => sum + session.quality, 0) / totalSessions 
      : 0;

    // 카드 상태 분류 (간단한 구현)
    const cardClassification = this.classifyCards(cards, sessions);
    
    // 성과 지표 계산
    const retentionRate = this.calculateRetentionRate(sessions);
    const difficultyRating = this.calculateDifficultyRating(sessions);
    const masteryLevel = this.calculateMasteryLevel(sessions, totalCards);

    return {
      deckId,
      totalCards,
      newCards: cardClassification.newCards,
      learningCards: cardClassification.learningCards,
      reviewCards: cardClassification.reviewCards,
      completedCards: cardClassification.completedCards,
      totalSessions,
      totalStudyTime,
      averageSessionTime,
      averageQuality,
      createdAt,
      retentionRate,
      difficultyRating,
      masteryLevel
    };
  }

  /**
   * 카드 상태 분류
   */
  private classifyCards(cards: Card[], sessions: StudySession[]): {
    newCards: number;
    learningCards: number;
    reviewCards: number;
    completedCards: number;
  } {
    const studiedCardIds = new Set(sessions.map(s => s.cardId));
    const newCards = cards.filter(card => !studiedCardIds.has(card.id!)).length;
    
    // 간단한 분류 로직
    const learningCards = Math.floor(cards.length * 0.3);
    const reviewCards = Math.floor(cards.length * 0.4);
    const completedCards = cards.length - newCards - learningCards - reviewCards;

    return {
      newCards,
      learningCards: Math.max(0, learningCards),
      reviewCards: Math.max(0, reviewCards),
      completedCards: Math.max(0, completedCards)
    };
  }

  /**
   * 보존율 계산
   */
  private calculateRetentionRate(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;
    const goodSessions = sessions.filter(s => s.quality >= 3).length;
    return goodSessions / sessions.length;
  }

  /**
   * 난이도 평가 계산
   */
  private calculateDifficultyRating(sessions: StudySession[]): number {
    if (sessions.length === 0) return 2.5;
    const avgQuality = sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;
    return 5 - avgQuality; // 품질이 높을수록 난이도는 낮음
  }

  /**
   * 숙련도 계산
   */
  private calculateMasteryLevel(sessions: StudySession[], totalCards: number): number {
    if (totalCards === 0) return 0;
    const studiedCards = new Set(sessions.map(s => s.cardId)).size;
    return studiedCards / totalCards;
  }

  /**
   * 카드 통계 계산
   */
  private calculateCardStatistics(cardId: number, sessions: StudySession[]): CardStatistics {
    const totalReviews = sessions.length;
    const averageQuality = totalReviews > 0 
      ? sessions.reduce((sum, s) => sum + s.quality, 0) / totalReviews 
      : 0;
    const averageResponseTime = totalReviews > 0
      ? sessions.reduce((sum, s) => sum + s.responseTime, 0) / totalReviews
      : 0;

    // 간단한 구현
    const currentInterval = totalReviews > 0 ? Math.pow(2, totalReviews) : 1;
    const easeFactor = Math.max(1.3, 2.5 - (4 - averageQuality) * 0.15);
    const lastReviewDate = sessions.length > 0 ? sessions[sessions.length - 1].studiedAt : undefined;
    const nextReviewDate = lastReviewDate 
      ? new Date(lastReviewDate.getTime() + currentInterval * 24 * 60 * 60 * 1000)
      : undefined;

    const difficultyLevel: 'easy' | 'medium' | 'hard' = 
      averageQuality >= 3.5 ? 'easy' : 
      averageQuality >= 2.5 ? 'medium' : 'hard';

    return {
      cardId,
      totalReviews,
      averageQuality,
      averageResponseTime,
      currentInterval,
      easeFactor,
      lastReviewDate,
      nextReviewDate,
      difficultyLevel
    };
  }

  /**
   * 일일 진행률 계산
   */
  private calculateDailyProgress(date: Date, sessions: StudySession[]): DailyProgress {
    const cardsStudied = new Set(sessions.map(s => s.cardId)).size;
    const timeSpent = sessions.reduce((sum, s) => sum + s.responseTime, 0);
    const averageQuality = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length 
      : 0;

    return {
      date,
      cardsStudied,
      timeSpent,
      averageQuality,
      sessionsCompleted: sessions.length,
      goalProgress: {
        cardsGoal: 20,
        cardsAchieved: cardsStudied,
        timeGoal: 30 * 60 * 1000, // 30분을 밀리초로
        timeAchieved: timeSpent
      }
    };
  }

  /**
   * 주간 트렌드 계산
   */
  private calculateWeeklyTrend(weekStart: Date, sessions: StudySession[]): WeeklyTrend {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // 일별 데이터 생성
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(s => 
        s.studiedAt >= dayStart && s.studiedAt <= dayEnd
      );

      return {
        date,
        cardsStudied: new Set(daySessions.map(s => s.cardId)).size,
        timeSpent: daySessions.reduce((sum, s) => sum + s.responseTime, 0),
        averageQuality: daySessions.length > 0 
          ? daySessions.reduce((sum, s) => sum + s.quality, 0) / daySessions.length 
          : 0
      };
    });

    const totalCards = dailyData.reduce((sum, day) => sum + day.cardsStudied, 0);
    const totalTime = dailyData.reduce((sum, day) => sum + day.timeSpent, 0);
    const averageDaily = totalCards / 7;
    const bestDay = dailyData.reduce((best, day) => 
      day.cardsStudied > best.cardsStudied ? day : best
    ).date;

    // 일관성 계산 (간단한 구현)
    const consistency = dailyData.filter(day => day.cardsStudied > 0).length / 7;

    return {
      weekStart,
      weekEnd,
      dailyData,
      totalCards,
      totalTime,
      averageDaily,
      bestDay,
      consistency
    };
  }

  /**
   * 목표 달성 계산
   */
  private calculateGoalAchievement(
    date: Date, 
    sessions: StudySession[], 
    goals: DailyGoals
  ): GoalAchievement {
    const cardsStudied = new Set(sessions.map(s => s.cardId)).size;
    const timeSpent = sessions.reduce((sum, s) => sum + s.responseTime, 0);
    
    const cardsGoalAchieved = cardsStudied >= goals.cardsGoal;
    const timeGoalAchieved = timeSpent >= (goals.timeGoal * 60 * 1000); // 분을 밀리초로 변환
    const streakGoalAchieved = goals.currentStreak >= goals.streakGoal;

    const achievements = [];
    if (cardsGoalAchieved) achievements.push(`일일 카드 목표 달성: ${cardsStudied}/${goals.cardsGoal}`);
    if (timeGoalAchieved) achievements.push(`일일 시간 목표 달성: ${Math.round(timeSpent / 60000)}분/${goals.timeGoal}분`);
    if (streakGoalAchieved) achievements.push(`연속 학습 목표 달성: ${goals.currentStreak}일`);

    // 전체 진행률 계산
    const cardsProgress = Math.min(1, cardsStudied / goals.cardsGoal);
    const timeProgress = Math.min(1, timeSpent / (goals.timeGoal * 60 * 1000));
    const overallProgress = (cardsProgress + timeProgress) / 2;

    // 다음 마일스톤 계산
    let nextMilestone;
    if (!cardsGoalAchieved && cardsStudied < goals.cardsGoal) {
      nextMilestone = {
        type: 'cards' as const,
        target: goals.cardsGoal,
        current: cardsStudied,
        remaining: goals.cardsGoal - cardsStudied
      };
    } else if (!timeGoalAchieved && timeSpent < goals.timeGoal * 60 * 1000) {
      nextMilestone = {
        type: 'time' as const,
        target: goals.timeGoal,
        current: Math.round(timeSpent / 60000),
        remaining: goals.timeGoal - Math.round(timeSpent / 60000)
      };
    }

    return {
      date,
      cardsGoalAchieved,
      timeGoalAchieved,
      streakGoalAchieved,
      overallProgress,
      achievements,
      nextMilestone
    };
  }

  /**
   * 월간 리포트 계산
   */
  private calculateMonthlyReport(
    date: Date, 
    decks: Deck[], 
    cards: Card[], 
    sessions: StudySession[]
  ): MonthlyReport {
    const totalCardsStudied = new Set(sessions.map(s => s.cardId)).size;
    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.responseTime, 0);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const averageSessionsPerDay = sessions.length / daysInMonth;
    const averageCardsPerDay = totalCardsStudied / daysInMonth;

    // 최고의 주 계산 (간단한 구현)
    const bestWeek = {
      weekStart: new Date(date.getFullYear(), date.getMonth(), 1),
      cardsStudied: totalCardsStudied
    };

    const achievements = [
      `${sessions.length}개의 학습 세션 완료`,
      `${totalCardsStudied}장의 카드 학습`
    ];

    const recommendations = [
      '꾸준한 학습 패턴을 유지하세요',
      '어려운 카드에 더 많은 시간을 투자하세요'
    ];

    return {
      period: 'month',
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      totalStudySessions: sessions.length,
      totalCardsStudied,
      totalTimeSpent,
      averageSessionsPerDay,
      averageCardsPerDay,
      bestWeek,
      achievements,
      recommendations
    };
  }

  /**
   * 학습 곡선 계산
   */
  private calculateLearningCurve(cardId: number, sessions: StudySession[]): LearningCurveData {
    const qualityProgression = sessions.map(s => ({
      date: s.studiedAt,
      quality: s.quality
    }));

    const responseTimeProgression = sessions.map(s => ({
      date: s.studiedAt,
      responseTime: s.responseTime
    }));

    // 개선 트렌드 계산
    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (sessions.length >= 3) {
      const recentQuality = sessions.slice(-3).reduce((sum, s) => sum + s.quality, 0) / 3;
      const earlierQuality = sessions.slice(0, 3).reduce((sum, s) => sum + s.quality, 0) / 3;
      
      if (recentQuality > earlierQuality + 0.5) {
        improvementTrend = 'improving';
      } else if (recentQuality < earlierQuality - 0.5) {
        improvementTrend = 'declining';
      }
    }

    // 숙련도 점수 계산
    const masteryScore = sessions.length > 0 
      ? Math.min(1, sessions.reduce((sum, s) => sum + s.quality, 0) / (sessions.length * 4))
      : 0;

    return {
      cardId,
      qualityProgression,
      responseTimeProgression,
      improvementTrend,
      masteryScore
    };
  }

  /**
   * 트렌드 데이터 계산
   */
  private calculateTrendData(deckId: number, timeRange: TimeRange): TrendData {
    // 간단한 구현: 더미 데이터 반환
    const dataPoints = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 10) + 1
    }));

    const total = dataPoints.reduce((sum, point) => sum + point.value, 0);
    const average = total / dataPoints.length;

    return {
      period: timeRange,
      dataPoints,
      summary: {
        total,
        average,
        trend: 'stable'
      }
    };
  }

  /**
   * 전체 통계 계산
   */
  private calculateGlobalStatistics(
    decks: Deck[],
    cards: Card[],
    sessions: StudySession[]
  ): GlobalStatistics {
    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.responseTime, 0);
    const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    return {
      totalDecks: decks.length,
      totalCards: cards.length,
      totalSessions,
      totalStudyTime,
      overallAccuracy: 0.8,
      averageSessionLength,
      studyStreak: 0,
      longestStreak: 0,
      dailyAverage: 0,
      weeklyAverage: 0,
      monthlyAverage: 0,
      recentActivity: []
    };
  }
}
