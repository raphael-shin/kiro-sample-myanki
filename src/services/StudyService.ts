/**
 * StudyService 클래스
 * 학습 세션 관리를 위한 CRUD 작업과 비즈니스 로직을 제공
 */

import { MyAnkiDB } from '@/db/MyAnkiDB';
import { IStudyService } from './interfaces';
import {
  StudySession,
  CreateStudySessionInput,
  UpdateStudySessionInput,
  StudyQuality,
  StudyStats
} from '@/types/flashcard';
import {
  MyAnkiError,
  ErrorCode,
  ErrorFactory
} from '@/types/errors';

export class StudyService implements IStudyService {
  constructor(private db: MyAnkiDB) {}

  /**
   * 새로운 학습 세션 생성
   */
  async create(input: CreateStudySessionInput): Promise<number> {
    try {
      // 유효성 검사
      this.validateCreateInput(input);
      
      // 카드 존재 확인
      const card = await this.db.cards.get(input.cardId);
      if (!card) {
        throw ErrorFactory.study.invalidCard(input.cardId);
      }

      // 학습 세션 생성
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
      // 학습 세션 존재 확인
      const existingSession = await this.getById(id);
      if (!existingSession) {
        throw ErrorFactory.study.notFound(id);
      }

      // 유효성 검사
      this.validateUpdateInput(updates);

      // 업데이트
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

      await this.db.studySessions.update(id, updateData);
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
      // 학습 세션 존재 확인
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
        return {
          totalSessions: 0,
          averageQuality: 0,
          averageResponseTime: 0,
          lastStudiedAt: undefined,
          studyStreak: 0
        };
      }

      const totalSessions = sessions.length;
      const totalQuality = sessions.reduce((sum, session) => sum + session.quality, 0);
      const totalResponseTime = sessions.reduce((sum, session) => sum + session.responseTime, 0);
      const averageQuality = totalQuality / totalSessions;
      const averageResponseTime = totalResponseTime / totalSessions;
      const lastStudiedAt = sessions[sessions.length - 1].studiedAt;
      
      // 연속 학습 일수 계산 (간단한 구현)
      const studyStreak = this.calculateStudyStreak(sessions);

      return {
        totalSessions,
        averageQuality,
        averageResponseTime,
        lastStudiedAt,
        studyStreak
      };
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

  /**
   * 학습 세션 생성 입력 유효성 검사
   */
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

    // studiedAt이 undefined, null이거나 잘못된 타입일 때 에러
    if (input.studiedAt === undefined || input.studiedAt === null || !(input.studiedAt instanceof Date)) {
      throw ErrorFactory.validation('studiedAt', input.studiedAt, 'studiedAt is required and must be a Date object');
    }
  }

  /**
   * 학습 세션 수정 입력 유효성 검사
   */
  private validateUpdateInput(updates: UpdateStudySessionInput): void {
    if (updates.quality !== undefined && !Object.values(StudyQuality).includes(updates.quality)) {
      throw ErrorFactory.study.invalidQuality(updates.quality);
    }

    if (updates.responseTime !== undefined && (typeof updates.responseTime !== 'number' || updates.responseTime <= 0)) {
      throw ErrorFactory.study.invalidResponseTime(updates.responseTime);
    }
  }

  /**
   * ID 유효성 검사
   */
  private validateId(id: any): void {
    if (typeof id !== 'number') {
      throw ErrorFactory.invalidId(id, 'ID must be a number');
    }
    
    if (id <= 0) {
      throw ErrorFactory.invalidId(id, 'ID must be positive');
    }
  }

  /**
   * 연속 학습 일수 계산
   */
  private calculateStudyStreak(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    // 간단한 구현: 최근 세션부터 역순으로 연속된 날짜 계산
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
