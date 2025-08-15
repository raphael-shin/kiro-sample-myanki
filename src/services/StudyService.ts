/**
 * StudyService 클래스
 * 학습 세션 관리를 위한 CRUD 작업과 비즈니스 로직을 제공
 */

import { MyAnkiDB } from '@/db/MyAnkiDB';
import { IStudyService } from './interfaces';
import { SessionManager, ISessionManager } from './SessionManager';
import {
  StudySession,
  CreateStudySessionInput,
  UpdateStudySessionInput,
  StudyQuality,
  StudyStats,
  StudySessionData,
  SessionSummary,
  SessionProgressUpdate,
  SessionProgress,
  Card
} from '@/types/flashcard';
import {
  MyAnkiError,
  ErrorCode,
  ErrorFactory
} from '@/types/errors';

export class StudyService implements IStudyService {
  private sessionManager: ISessionManager;

  constructor(private db: MyAnkiDB, sessionManager?: ISessionManager) {
    this.sessionManager = sessionManager || new SessionManager();
  }

  // 세션 관리 메서드들 (새로 추가)

  /**
   * 학습 세션 시작
   */
  async startStudySession(deckId: number): Promise<StudySessionData> {
    try {
      this.validateId(deckId);
      const sessionId = await this.sessionManager.createSession(deckId);
      return await this.sessionManager.getSessionData(sessionId);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('start study session', error as Error);
    }
  }

  /**
   * 학습 세션 종료
   */
  async endStudySession(sessionId: string): Promise<SessionSummary> {
    try {
      const sessionData = await this.sessionManager.getSessionData(sessionId);
      await this.sessionManager.updateSession(sessionId, { 
        endTime: new Date(),
        status: 'completed'
      });
      return await this.sessionManager.getSessionSummary(sessionId);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('end study session', error as Error);
    }
  }

  /**
   * 다음 카드 조회
   */
  async getNextCard(sessionId: string): Promise<Card | null> {
    try {
      const sessionData = await this.sessionManager.getSessionData(sessionId);
      const cards = await this.getCardsForDeck(sessionData.deckId);
      
      if (cards.length === 0) {
        return null;
      }
      
      // 간단한 구현: 첫 번째 카드 반환
      return cards[0];
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('get next card', error as Error);
    }
  }

  /**
   * 세션 진행률 업데이트
   */
  async updateSessionProgress(sessionId: string, progress: SessionProgressUpdate): Promise<void> {
    try {
      await this.sessionManager.updateSession(sessionId, progress);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('update session progress', error as Error);
    }
  }

  /**
   * 카드 답변 처리
   */
  async processCardAnswer(sessionId: string, cardId: number, quality: StudyQuality, responseTime: number): Promise<void> {
    try {
      // 세션 존재 확인
      const sessionData = await this.sessionManager.getSessionData(sessionId);
      
      // 학습 기록 저장
      await this.recordStudySession(cardId, quality, responseTime);
      
      // 세션 통계 업데이트
      await this.updateSessionStatistics(sessionData, quality, responseTime);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('process card answer', error as Error);
    }
  }

  /**
   * 세션 통계 업데이트 (헬퍼 메서드)
   */
  private async updateSessionStatistics(sessionData: StudySessionData, quality: StudyQuality, responseTime: number): Promise<void> {
    const isCorrect = quality >= StudyQuality.GOOD;
    const updatedStats = {
      completedCards: sessionData.completedCards + 1,
      correctAnswers: isCorrect ? sessionData.correctAnswers + 1 : sessionData.correctAnswers,
      totalResponseTime: sessionData.totalResponseTime + responseTime,
      qualityScores: [...sessionData.qualityScores, quality]
    };
    
    await this.sessionManager.updateSession(sessionData.id, updatedStats);
  }

  /**
   * 세션 통계 계산
   */
  async calculateSessionStats(sessionId: string): Promise<SessionProgress> {
    try {
      return await this.sessionManager.getSessionProgress(sessionId);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('calculate session stats', error as Error);
    }
  }

  /**
   * 예상 완료 시간 계산
   */
  async getEstimatedCompletionTime(sessionId: string): Promise<number> {
    try {
      return await this.sessionManager.getEstimatedTimeRemaining(sessionId);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('get estimated completion time', error as Error);
    }
  }

  // 기존 CRUD 메서드들 (그룹화)
  
  /**
   * 새로운 학습 세션 생성
   */
  async create(input: CreateStudySessionInput): Promise<number> {
    try {
      this.validateCreateInput(input);
      await this.validateCardExists(input.cardId);

      const id = await this.db.studySessions.add({
        cardId: input.cardId,
        studiedAt: input.studiedAt,
        quality: input.quality,
        responseTime: input.responseTime
      });

      return Number(id);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('create study session', error as Error);
    }
  }

  /**
   * ID로 학습 세션 조회
   */
  async getById(id: number): Promise<StudySession | undefined> {
    try {
      this.validateId(id);
      return await this.db.studySessions.get(id);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('get study session by id', error as Error);
    }
  }

  /**
   * 모든 학습 세션 조회 (학습일시 순)
   */
  async getAll(): Promise<StudySession[]> {
    try {
      return await this.db.studySessions.orderBy('studiedAt').toArray();
    } catch (error) {
      throw ErrorFactory.database('get all study sessions', error as Error);
    }
  }

  /**
   * 학습 세션 수정
   */
  async update(id: number, updates: UpdateStudySessionInput): Promise<void> {
    try {
      const existingSession = await this.getById(id);
      if (!existingSession) {
        throw ErrorFactory.study.notFound(id);
      }

      this.validateUpdateInput(updates);
      await this.db.studySessions.update(id, this.buildUpdateData(updates));
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('update study session', error as Error);
    }
  }

  /**
   * 학습 세션 삭제
   */
  async delete(id: number): Promise<void> {
    try {
      const existingSession = await this.getById(id);
      if (!existingSession) {
        throw ErrorFactory.study.notFound(id);
      }

      await this.db.studySessions.delete(id);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('delete study session', error as Error);
    }
  }

  // 통계 및 분석 메서드들 (그룹화)

  /**
   * 카드별 학습 기록 조회
   */
  async getStudyHistory(cardId: number): Promise<StudySession[]> {
    try {
      this.validateId(cardId);
      return await this.db.studySessions
        .where('cardId')
        .equals(cardId)
        .orderBy('studiedAt')
        .toArray();
    } catch (error) {
      throw ErrorFactory.database('get study history', error as Error);
    }
  }

  /**
   * 카드별 학습 통계 계산
   */
  async getStudyStats(cardId: number): Promise<StudyStats> {
    try {
      this.validateId(cardId);
      
      const sessions = await this.getStudyHistory(cardId);
      
      if (sessions.length === 0) {
        return this.createEmptyStats();
      }

      return this.calculateStats(sessions);
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('get study stats', error as Error);
    }
  }

  /**
   * 학습 세션 기록 (편의 메서드)
   */
  async recordStudySession(cardId: number, quality: StudyQuality, responseTime: number): Promise<void> {
    try {
      await this.create({
        cardId,
        quality,
        responseTime,
        studiedAt: new Date()
      });
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database('record study session', error as Error);
    }
  }

  // 유효성 검사 메서드들 (그룹화)

  private validateCreateInput(input: CreateStudySessionInput): void {
    if (!input.cardId || typeof input.cardId !== 'number' || input.cardId <= 0) {
      throw ErrorFactory.invalidId(input.cardId, 'Card ID must be positive');
    }

    if (!Object.values(StudyQuality).includes(input.quality)) {
      throw ErrorFactory.study.invalidQuality(input.quality);
    }

    if (typeof input.responseTime !== 'number' || input.responseTime <= 0) {
      throw ErrorFactory.study.invalidResponseTime(input.responseTime);
    }

    if (input.studiedAt === undefined || input.studiedAt === null || !(input.studiedAt instanceof Date)) {
      throw ErrorFactory.validation('studiedAt', input.studiedAt, 'studiedAt is required and must be a Date object');
    }
  }

  private validateUpdateInput(updates: UpdateStudySessionInput): void {
    if (updates.quality !== undefined && !Object.values(StudyQuality).includes(updates.quality)) {
      throw ErrorFactory.study.invalidQuality(updates.quality);
    }

    if (updates.responseTime !== undefined && (typeof updates.responseTime !== 'number' || updates.responseTime <= 0)) {
      throw ErrorFactory.study.invalidResponseTime(updates.responseTime);
    }
  }

  private validateId(id: any): void {
    if (typeof id !== 'number') {
      throw ErrorFactory.invalidId(id, 'ID must be a number');
    }
    
    if (id <= 0) {
      throw ErrorFactory.invalidId(id, 'ID must be positive');
    }
  }

  private async validateCardExists(cardId: number): Promise<void> {
    const card = await this.db.cards.get(cardId);
    if (!card) {
      throw ErrorFactory.study.invalidCard(cardId);
    }
  }

  // 헬퍼 메서드들 (그룹화)

  private buildUpdateData(updates: UpdateStudySessionInput): Partial<StudySession> {
    const updateData: Partial<StudySession> = {};
    if (updates.quality !== undefined) {
      updateData.quality = updates.quality;
    }
    if (updates.responseTime !== undefined) {
      updateData.responseTime = updates.responseTime;
    }
    if (updates.studiedAt !== undefined) {
      updateData.studiedAt = updates.studiedAt;
    }
    return updateData;
  }

  private createEmptyStats(): StudyStats {
    return {
      totalSessions: 0,
      averageQuality: 0,
      averageResponseTime: 0,
      lastStudiedAt: undefined,
      studyStreak: 0
    };
  }

  private calculateStats(sessions: StudySession[]): StudyStats {
    const totalSessions = sessions.length;
    const totalQuality = sessions.reduce((sum, session) => sum + session.quality, 0);
    const totalResponseTime = sessions.reduce((sum, session) => sum + session.responseTime, 0);
    const averageQuality = totalQuality / totalSessions;
    const averageResponseTime = totalResponseTime / totalSessions;
    const lastStudiedAt = sessions[sessions.length - 1].studiedAt;
    const studyStreak = this.calculateStudyStreak(sessions);

    return {
      totalSessions,
      averageQuality,
      averageResponseTime,
      lastStudiedAt,
      studyStreak
    };
  }

  private async getCardsForDeck(deckId: number): Promise<Card[]> {
    return await this.db.cards
      .where('deckId')
      .equals(deckId)
      .toArray();
  }

  private calculateStudyStreak(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    const today = new Date();
    const sortedSessions = sessions.sort((a, b) => b.studiedAt.getTime() - a.studiedAt.getTime());
    
    let streak = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.studiedAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
