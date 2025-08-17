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
        
        const createInput: CreateSpacedRepetitionCardInput = {
          cardId,
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
          nextReviewDate: result.nextReviewDate,
          lastReviewDate: new Date()
        };
        
        await this.create(createInput);
        
        // 카드 테이블도 업데이트
        await db.cards.update(cardId, {
          lastReviewDate: new Date(),
          repetitions: result.repetitions,
          easinessFactor: result.easeFactor,
          nextReviewDate: result.nextReviewDate
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
        
        // 카드 테이블도 업데이트
        await db.cards.update(cardId, {
          lastReviewDate: new Date(),
          repetitions: result.repetitions,
          easinessFactor: result.easeFactor,
          nextReviewDate: result.nextReviewDate
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 특정 덱에서 오늘 복습할 카드 목록 조회
   */
  async getCardsForReview(deckId?: number): Promise<import('../types/flashcard').Card[]> {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // 오늘 끝까지
      
      // 복습 예정인 카드 ID들 조회
      const dueCards = await db.spacedRepetitionData
        .where('nextReviewDate')
        .belowOrEqual(today)
        .toArray();
      
      const dueCardIds = dueCards.map(card => card.cardId);
      
      // 실제 카드 데이터 조회
      let cards;
      if (deckId) {
        // 특정 덱의 카드만 조회
        cards = await db.cards
          .where('deckId')
          .equals(deckId)
          .and(card => dueCardIds.includes(card.id!))
          .toArray();
      } else {
        // 모든 복습 예정 카드 조회
        cards = await db.cards
          .where('id')
          .anyOf(dueCardIds)
          .toArray();
      }
      
      // 새로운 카드도 포함 (간격 반복 데이터가 없는 카드)
      if (deckId) {
        const allDeckCards = await db.cards
          .where('deckId')
          .equals(deckId)
          .toArray();
        
        const newCards = allDeckCards.filter(card => 
          card.id && !dueCardIds.includes(card.id)
        );
        
        // 새 카드는 최대 10개까지만 추가
        cards.push(...newCards.slice(0, 10));
      }
      
      return cards;
    } catch (error) {
      throw error;
    }
  }
}
