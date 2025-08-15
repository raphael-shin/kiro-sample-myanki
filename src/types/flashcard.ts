/**
 * 플래시카드 관련 타입 정의
 * Basic 노트 타입만 지원하는 간단한 플래시카드 시스템
 */

/**
 * 학습 품질 열거형
 * 간격 반복 알고리즘에서 사용되는 답변 품질 점수
 */
export enum StudyQuality {
  AGAIN = 1,    // 다시 - 답을 틀렸거나 기억하지 못함
  HARD = 2,     // 어려움 - 답을 맞췄지만 어려웠음
  GOOD = 3,     // 보통 - 적절한 노력으로 답을 맞춤
  EASY = 4      // 쉬움 - 쉽게 답을 맞춤
}

/**
 * 학습 세션 상태 열거형
 */
export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

/**
 * 세션 진행률 정보
 */
export interface SessionProgress {
  totalCards: number;
  completedCards: number;
  currentCardIndex: number;
}

/**
 * 세션 통계 정보
 */
export interface SessionStatistics {
  correctAnswers: number;
  totalResponseTime: number;
  qualityScores: StudyQuality[];
}

/**
 * 세션 설정 정보
 */
export interface SessionSettings {
  keyboardShortcuts: boolean;
  autoAdvance: boolean;
}

/**
 * 학습 세션 데이터 인터페이스
 * 학습 세션의 전체 데이터를 관리하는 모델
 */
export interface StudySessionData {
  id: string;
  deckId: number;
  userId?: string; // 향후 다중 사용자 지원
  startTime: Date;
  endTime?: Date;
  pausedTime: number; // 총 일시정지 시간
  status: SessionStatus;
  
  // 진행률 정보
  totalCards: number;
  completedCards: number;
  currentCardIndex: number;
  
  // 통계 정보
  correctAnswers: number;
  totalResponseTime: number;
  qualityScores: StudyQuality[];
  
  // 설정
  keyboardShortcuts: boolean;
  autoAdvance: boolean;
}

/**
 * 덱(카드 묶음) 인터페이스
 */
export interface Deck {
  id?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 카드 인터페이스 (Basic 타입만 지원)
 */
export interface Card {
  id?: number;
  deckId: number;
  front: string;    // 앞면 내용
  back: string;     // 뒷면 내용
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 학습 세션 인터페이스
 * 사용자가 카드를 학습한 기록을 저장
 */
export interface StudySession {
  id?: number;
  cardId: number;
  studiedAt: Date;
  quality: StudyQuality;
  responseTime: number;  // 응답 시간 (밀리초)
}

/**
 * 덱 생성을 위한 입력 타입
 */
export type CreateDeckInput = Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 덱 수정을 위한 입력 타입
 */
export type UpdateDeckInput = Partial<Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * 카드 생성을 위한 입력 타입
 */
export type CreateCardInput = Omit<Card, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 카드 수정을 위한 입력 타입
 */
export type UpdateCardInput = Partial<Omit<Card, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>>;

/**
 * 학습 세션 생성을 위한 입력 타입
 */
export type CreateStudySessionInput = Omit<StudySession, 'id'>;

/**
 * 학습 세션 수정을 위한 입력 타입
 */
export type UpdateStudySessionInput = Partial<Omit<StudySession, 'id' | 'cardId'>>;

/**
 * 덱 통계 정보
 */
export interface DeckStats {
  totalCards: number;
  studiedCards: number;
  averageQuality: number;
  lastStudiedAt?: Date;
}

/**
 * 학습 통계 정보
 */
export interface StudyStats {
  totalSessions: number;
  averageQuality: number;
  averageResponseTime: number;
  lastStudiedAt?: Date;
  studyStreak: number;
}

/**
 * 세션 진행률 업데이트 정보
 */
export interface SessionProgressUpdate {
  totalCards?: number;
  completedCards?: number;
  currentCardIndex?: number;
}

/**
 * 세션 진행률 정보
 */
export interface SessionProgress {
  totalCards: number;
  completedCards: number;
  currentCardIndex: number;
  percentage: number;
  remainingCards: number;
}

/**
 * 세션 요약 정보
 */
export interface SessionSummary {
  cardsStudied: number;
  totalTime: number;
  averageQuality: number;
  correctAnswers: number;
  sessionDate: Date;
}

/**
 * 일일 진행률 정보
 */
export interface DailyProgress {
  date: Date;
  cardsStudied: number;
  timeSpent: number;
  averageQuality: number;
  sessionsCompleted: number;
  goalProgress: {
    cardsGoal: number;
    cardsAchieved: number;
    timeGoal: number;
    timeAchieved: number;
  };
}

/**
 * 주간 트렌드 정보
 */
export interface WeeklyTrend {
  weekStart: Date;
  weekEnd: Date;
  dailyData: Array<{
    date: Date;
    cardsStudied: number;
    timeSpent: number;
    averageQuality: number;
  }>;
  totalCards: number;
  totalTime: number;
  averageDaily: number;
  bestDay: Date;
  consistency: number;
}

/**
 * 월간 리포트 정보
 */
export interface MonthlyReport {
  period: 'month';
  month: number;
  year: number;
  totalStudySessions: number;
  totalCardsStudied: number;
  totalTimeSpent: number;
  averageSessionsPerDay: number;
  averageCardsPerDay: number;
  bestWeek: {
    weekStart: Date;
    cardsStudied: number;
  };
  achievements: string[];
  recommendations: string[];
}

/**
 * 카드별 통계 정보
 */
export interface CardStatistics {
  cardId: number;
  totalReviews: number;
  correctAnswers: number;
  averageQuality: number;
  averageResponseTime: number;
  currentInterval: number;
  easeFactor: number;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  learningHistory: Array<{
    sessionId: string;
    reviewedAt: Date;
    quality: number;
    responseTime: number;
    easeFactor: number;
    interval: number;
  }>;
}

/**
 * 학습 곡선 데이터
 */
export interface LearningCurveData {
  cardId: number;
  qualityProgression: Array<{ date: Date; quality: number }>;
  responseTimeProgression: Array<{ date: Date; responseTime: number }>;
  improvementTrend: 'improving' | 'stable' | 'declining';
  masteryScore: number;
}

/**
 * 시간 범위 타입
 */
export type TimeRange = 'day' | 'week' | 'month' | 'year';

/**
 * 트렌드 데이터 포인트
 */
export interface TrendDataPoint {
  date: Date;
  value: number;
  label?: string;
}

/**
 * 트렌드 데이터
 */
export interface TrendData {
  period: TimeRange;
  dataPoints: TrendDataPoint[];
  summary: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
}

/**
 * 통계 및 진행률 추적 관련 타입들
 */

/**
 * 기본 통계 정보 (공통 타입)
 */
export interface BaseStatistics {
  totalSessions: number;
  totalStudyTime: number;
  averageQuality: number;
  lastStudiedAt?: Date;
}

/**
 * 활동 요약 정보
 */
export interface ActivitySummary {
  date: Date;
  cardsStudied: number;
  timeSpent: number;
  averageQuality: number;
}

/**
 * 카드 상태 분류 (공통 타입)
 */
export interface CardStatusBreakdown {
  newCards: number;
  learningCards: number;
  reviewCards: number;
  completedCards: number;
}

/**
 * 덱별 상세 통계 정보
 */
export interface DeckStatistics extends BaseStatistics, CardStatusBreakdown {
  deckId: number;
  totalCards: number;
  averageSessionTime: number;
  createdAt: Date;
  
  // 성과 지표
  retentionRate: number;
  difficultyRating: number;
  masteryLevel: number;
}

/**
 * 전체 애플리케이션 통계
 */
export interface GlobalStatistics {
  // 전체 현황
  totalDecks: number;
  totalCards: number;
  totalSessions: number;
  totalStudyTime: number;
  
  // 학습 성과
  overallAccuracy: number;
  averageSessionLength: number;
  studyStreak: number;
  longestStreak: number;
  
  // 시간별 분석
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  
  // 최근 활동
  lastStudyDate?: Date;
  recentActivity: ActivitySummary[];
}

/**
 * 목표 진행률 (공통 타입)
 */
export interface GoalProgress {
  cardsCompleted: number;
  timeCompleted: number;
  currentStreak: number;
}

/**
 * 목표 달성 정보
 */
export interface GoalAchievement {
  date: Date;
  cardsGoalAchieved: boolean;
  timeGoalAchieved: boolean;
  streakGoalAchieved: boolean;
  overallProgress: number;
  achievements: string[];
  nextMilestone?: {
    type: 'cards' | 'time' | 'streak';
    target: number;
    current: number;
    remaining: number;
  };
}

/**
 * 일일 학습 목표 관리
 */
export interface DailyGoals extends GoalProgress {
  cardsGoal: number;
  timeGoal: number; // 분 단위
  streakGoal: number;
  
  // 목표 달성 기록
  lastAchievedDate?: Date;
  totalAchievements: number;
}

/**
 * 통계 정보가 포함된 덱
 */
export interface DeckWithStats extends Deck {
  stats: DeckStats;
}