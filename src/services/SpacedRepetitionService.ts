import { SpacedRepetitionCard, CreateSpacedRepetitionCardInput, UpdateSpacedRepetitionCardInput } from '../types/spaced-repetition';
import { StudyQuality } from '../types/flashcard';
import { SM2Algorithm } from '../algorithms/spaced-repetition/SM2Algorithm';
import { SM2_CONSTANTS } from '../algorithms/spaced-repetition/constants';
import { db } from '../db/MyAnkiDB';

/**
 * 간격 반복 데이터 관리 서비스
 * 
 * SM-2 알고리즘에 필요한 카드별 학습 데이터를 관리합니다.
 * 각 카드의 용이도 인수, 간격, 반복 횟수 등을 저장하고 조회합니다.
 */
export class SpacedRepetitionService {
  private sm2Algorithm: SM2Algorithm;

  constructor() {
    this.sm2Algorithm = new SM2Algorithm();
  }

  /**
   * 카드 ID로 간격 반복 데이터 조회
   */
  async getByCardId(cardId: number): Promise<SpacedRepetitionCard | undefined> {
    try {
      return await db.spacedRepetitionData
        .where('cardId')
        .equals(cardId)
        .first();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 새로운 간격 반복 데이터 생성
   */
  async create(input: CreateSpacedRepetitionCardInput): Promise<number> {
    try {
      const data: SpacedRepetitionCard = {
        ...input,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.spacedRepetitionData.add(data);
      return input.cardId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 간격 반복 데이터 업데이트
   */
  async update(cardId: number, updates: UpdateSpacedRepetitionCardInput): Promise<void> {
    try {
      await db.spacedRepetitionData
        .where('cardId')
        .equals(cardId)
        .modify({
          ...updates,
          updatedAt: new Date()
        });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 간격 반복 데이터 삭제
   */
  async delete(cardId: number): Promise<void> {
    try {
      await db.spacedRepetitionData
        .where('cardId')
        .equals(cardId)
        .delete();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 학습 결과를 처리하여 SM2 알고리즘 적용
   */
  async processStudyResult(cardId: number, quality: StudyQuality): Promise<void> {
    try {
      const existingData = await this.getByCardId(cardId);
      
      if (!existingData) {
        // 새 카드인 경우 초기 데이터 생성
        const result = this.sm2Algorithm.calculateNextReview({
          cardId,
          easeFactor: SM2_CONSTANTS.DEFAULT_EASE_FACTOR,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date(),
          lastReviewDate: new Date()
        }, quality);
        
        await this.create({
          cardId,
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewDate: result.nextReviewDate,
          lastReviewDate: new Date()
        });
      } else {
        // 기존 카드 업데이트
        const result = this.sm2Algorithm.calculateNextReview(existingData, quality);
        
        await this.update(cardId, {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewDate: result.nextReviewDate,
          lastReviewDate: new Date()
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 오늘 복습할 카드 목록 조회
   */
  async getCardsForReview(): Promise<number[]> {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // 오늘 끝까지
      
      const dueCards = await db.spacedRepetitionData
        .where('nextReviewDate')
        .belowOrEqual(today)
        .toArray();
      
      return dueCards.map(card => card.cardId);
    } catch (error) {
      throw error;
    }
  }
}
