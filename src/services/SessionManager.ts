import { StudySessionData, SessionProgress, SessionSummary } from '@/types/flashcard';
import { ErrorFactory } from '@/types/errors';

/**
 * SessionManager 인터페이스
 */
export interface ISessionManager {
  createSession(deckId: number): Promise<string>;
  getSessionData(sessionId: string): Promise<StudySessionData>;
  updateSession(sessionId: string, updates: Partial<StudySessionData>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  pauseSession(sessionId: string): Promise<void>;
  resumeSession(sessionId: string): Promise<void>;
  isSessionActive(sessionId: string): Promise<boolean>;
  getSessionProgress(sessionId: string): Promise<SessionProgress>;
  getEstimatedTimeRemaining(sessionId: string): Promise<number>;
  getSessionSummary(sessionId: string): Promise<SessionSummary>;
}

/**
 * SessionManager 서비스
 * 학습 세션의 생명주기를 관리하는 핵심 서비스
 */
export class SessionManager implements ISessionManager {
  private sessions: Map<string, StudySessionData> = new Map();

  /**
   * 새로운 학습 세션 생성
   */
  async createSession(deckId: number): Promise<string> {
    const sessionId = this.generateSessionId();
    const sessionData = this.createInitialSessionData(sessionId, deckId);
    
    this.sessions.set(sessionId, sessionData);
    return sessionId;
  }

  /**
   * 세션 데이터 조회
   */
  async getSessionData(sessionId: string): Promise<StudySessionData> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) {
      throw ErrorFactory.session.notFound(sessionId);
    }
    return { ...sessionData }; // 불변성 보장을 위한 복사
  }

  /**
   * 세션 데이터 업데이트
   */
  async updateSession(sessionId: string, updates: Partial<StudySessionData>): Promise<void> {
    const existingData = await this.getSessionData(sessionId);
    const updatedData = { ...existingData, ...updates };
    this.sessions.set(sessionId, updatedData);
  }

  /**
   * 세션 삭제
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (!this.sessions.has(sessionId)) {
      throw ErrorFactory.session.notFound(sessionId);
    }
    this.sessions.delete(sessionId);
  }

  /**
   * 세션 일시정지
   */
  async pauseSession(sessionId: string): Promise<void> {
    const sessionData = await this.getSessionData(sessionId);
    this.validateStateTransition(sessionData.status, 'paused');
    await this.updateSession(sessionId, { status: 'paused' });
  }

  /**
   * 세션 재개
   */
  async resumeSession(sessionId: string): Promise<void> {
    const sessionData = await this.getSessionData(sessionId);
    this.validateStateTransition(sessionData.status, 'active');
    await this.updateSession(sessionId, { status: 'active' });
  }

  /**
   * 세션 활성 상태 확인
   */
  async isSessionActive(sessionId: string): Promise<boolean> {
    const sessionData = await this.getSessionData(sessionId);
    return sessionData.status === 'active';
  }

  /**
   * 세션 진행률 조회
   */
  async getSessionProgress(sessionId: string): Promise<SessionProgress> {
    const sessionData = await this.getSessionData(sessionId);
    
    return {
      totalCards: sessionData.totalCards,
      completedCards: sessionData.completedCards,
      currentCardIndex: sessionData.currentCardIndex,
      percentage: this.calculateProgressPercentage(sessionData.completedCards, sessionData.totalCards),
      remainingCards: sessionData.totalCards - sessionData.completedCards
    };
  }

  /**
   * 예상 완료 시간 계산
   */
  async getEstimatedTimeRemaining(sessionId: string): Promise<number> {
    const sessionData = await this.getSessionData(sessionId);
    return this.calculateEstimatedTime(sessionData);
  }

  /**
   * 세션 요약 생성
   */
  async getSessionSummary(sessionId: string): Promise<SessionSummary> {
    const sessionData = await this.getSessionData(sessionId);
    
    return {
      cardsStudied: sessionData.completedCards,
      totalTime: this.calculateTotalSessionTime(sessionData),
      averageQuality: this.calculateAverageQuality(sessionData.qualityScores),
      correctAnswers: sessionData.correctAnswers,
      sessionDate: sessionData.startTime
    };
  }

  /**
   * 진행률 백분율 계산
   */
  private calculateProgressPercentage(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  /**
   * 예상 완료 시간 계산
   */
  private calculateEstimatedTime(sessionData: StudySessionData): number {
    if (sessionData.completedCards === 0 || sessionData.completedCards >= sessionData.totalCards) {
      return 0;
    }
    
    const averageTimePerCard = sessionData.totalResponseTime / sessionData.completedCards;
    const remainingCards = sessionData.totalCards - sessionData.completedCards;
    
    return Math.round(averageTimePerCard * remainingCards);
  }

  /**
   * 총 세션 시간 계산
   */
  private calculateTotalSessionTime(sessionData: StudySessionData): number {
    return sessionData.endTime && sessionData.startTime
      ? sessionData.endTime.getTime() - sessionData.startTime.getTime()
      : 0;
  }

  /**
   * 평균 품질 점수 계산
   */
  private calculateAverageQuality(qualityScores: number[]): number {
    if (qualityScores.length === 0) return 0;
    
    const sum = qualityScores.reduce((acc, score) => acc + score, 0);
    const average = sum / qualityScores.length;
    
    return Math.round(average * 10) / 10; // 소수점 1자리
  }

  /**
   * 상태 전환 유효성 검증
   */
  private validateStateTransition(currentStatus: string, targetStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      'active': ['paused', 'completed', 'abandoned'],
      'paused': ['active', 'abandoned'],
      'completed': [],
      'abandoned': []
    };

    const allowedTargets = validTransitions[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      throw ErrorFactory.session.invalidState(currentStatus, targetStatus);
    }
  }

  /**
   * 초기 세션 데이터 생성
   */
  private createInitialSessionData(sessionId: string, deckId: number): StudySessionData {
    return {
      id: sessionId,
      deckId,
      startTime: new Date(),
      status: 'active',
      totalCards: 0,
      completedCards: 0,
      currentCardIndex: 0,
      correctAnswers: 0,
      totalResponseTime: 0,
      qualityScores: [],
      keyboardShortcuts: true,
      autoAdvance: false,
      pausedTime: 0
    };
  }

  /**
   * 고유한 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
