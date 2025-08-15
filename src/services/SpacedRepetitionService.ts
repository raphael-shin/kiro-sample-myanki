import { SpacedRepetitionCard, CreateSpacedRepetitionCardInput, UpdateSpacedRepetitionCardInput } from '../types/spaced-repetition';
import { db } from '../db/MyAnkiDB';

/**
 * 간격 반복 데이터 관리 서비스
 * 
 * SM-2 알고리즘에 필요한 카드별 학습 데이터를 관리합니다.
 * 각 카드의 용이도 인수, 간격, 반복 횟수 등을 저장하고 조회합니다.
 */
export class SpacedRepetitionService {
  constructor() {}

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
}
