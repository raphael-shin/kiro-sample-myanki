import { StudySessionData } from '@/types/flashcard';
import { ErrorFactory } from '@/types/errors';

/**
 * SessionManager 인터페이스
 */
export interface ISessionManager {
  createSession(deckId: number): Promise<string>;
  getSessionData(sessionId: string): Promise<StudySessionData>;
  updateSession(sessionId: string, updates: Partial<StudySessionData>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
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
