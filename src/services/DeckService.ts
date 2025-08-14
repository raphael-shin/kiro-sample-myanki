/**
 * DeckService 클래스
 * 덱 관리를 위한 CRUD 작업과 비즈니스 로직을 제공
 */

import { MyAnkiDB } from '@/db/MyAnkiDB';
import { IDeckService } from './interfaces';
import {
  Deck,
  Card,
  CreateDeckInput,
  UpdateDeckInput,
  DeckWithStats,
  DeckStats
} from '@/types/flashcard';
import {
  MyAnkiError,
  ErrorCode,
  ErrorFactory
} from '@/types/errors';

export class DeckService implements IDeckService {
  constructor(private db: MyAnkiDB) {}

  /**
   * 공통 에러 처리 래퍼
   */
  private async handleDatabaseOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      throw ErrorFactory.database(operation, error as Error);
    }
  }

  /**
   * 새로운 덱 생성
   */
  async create(input: CreateDeckInput): Promise<number> {
    return this.handleDatabaseOperation('create deck', async () => {
      // 유효성 검사
      this.validateCreateInput(input);
      
      // 중복 이름 검사
      const isDuplicate = await this.isDuplicateName(input.name);
      if (isDuplicate) {
        throw ErrorFactory.deck.duplicateName(input.name);
      }

      // 덱 생성 (타임스탬프는 훅에서 자동 설정)
      const id = await this.db.decks.add({
        name: input.name.trim(),
        description: input.description?.trim()
      });

      return Number(id);
    });
  }

  /**
   * ID로 덱 조회
   */
  async getById(id: number): Promise<Deck | undefined> {
    return this.handleDatabaseOperation('get deck by id', async () => {
      // ID 유효성 검사
      this.validateId(id);
      
      return await this.db.decks.get(id);
    });
  }

  /**
   * 모든 덱 조회 (생성일시 순)
   */
  async getAll(): Promise<Deck[]> {
    return this.handleDatabaseOperation('get all decks', async () => {
      return await this.db.decks.orderBy('createdAt').toArray();
    });
  }

  /**
   * 덱 수정
   */
  async update(id: number, updates: UpdateDeckInput): Promise<void> {
    return this.handleDatabaseOperation('update deck', async () => {
      // 덱 존재 확인
      const existingDeck = await this.getById(id);
      if (!existingDeck) {
        throw ErrorFactory.deck.notFound(id);
      }

      // 유효성 검사
      this.validateUpdateInput(updates);

      // 이름 변경 시 중복 검사
      if (updates.name && updates.name !== existingDeck.name) {
        const isDuplicate = await this.isDuplicateName(updates.name, id);
        if (isDuplicate) {
          throw ErrorFactory.deck.duplicateName(updates.name);
        }
      }

      // 업데이트 (updatedAt은 훅에서 자동 설정)
      const updateData: Partial<Deck> = {};
      if (updates.name !== undefined) {
        updateData.name = updates.name.trim();
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description?.trim();
      }

      await this.db.decks.update(id, updateData);
    });
  }

  /**
   * 덱 삭제 (연관 데이터도 함께 삭제)
   */
  async delete(id: number): Promise<void> {
    try {
      // 덱 존재 확인
      const existingDeck = await this.getById(id);
      if (!existingDeck) {
        throw ErrorFactory.deck.notFound(id);
      }

      // 트랜잭션으로 연관 데이터 삭제
      await this.db.transaction('rw', [this.db.decks, this.db.cards, this.db.studySessions], async (tx: any) => {
        // 해당 덱의 모든 카드 조회
        const cards: Card[] = await tx.cards.where('deckId').equals(id).toArray();
        const cardIds = cards.map(card => card.id!);

        // 카드들의 학습 기록 삭제
        if (cardIds.length > 0) {
          try {
            await tx.studySessions.where('cardId').anyOf(cardIds).delete();
          } catch (error) {
            throw error; // 원본 에러를 그대로 전달
          }
        }

        // 카드들 삭제
        try {
          await tx.cards.where('deckId').equals(id).delete();
        } catch (error) {
          throw error; // 원본 에러를 그대로 전달
        }

        // 덱 삭제
        try {
          await tx.decks.delete(id);
        } catch (error) {
          throw error; // 원본 에러를 그대로 전달
        }
      });
    } catch (error) {
      if (error instanceof MyAnkiError) {
        throw error;
      }
      
      // DATABASE_ERROR를 직접 생성
      const errorMessage = (error as Error).message;
      throw new MyAnkiError(
        ErrorCode.DATABASE_ERROR,
        errorMessage,
        { operation: 'delete deck', originalError: errorMessage }
      );
    }
  }

  /**
   * 통계 정보가 포함된 덱 조회
   */
  async getDeckWithStats(id: number): Promise<DeckWithStats | undefined> {
    return this.handleDatabaseOperation('get deck with stats', async () => {
      const deck = await this.getById(id);
      if (!deck) {
        return undefined;
      }

      const stats = await this.calculateDeckStats(id);
      return {
        ...deck,
        stats
      };
    });
  }

  /**
   * 덱 이름으로 검색
   */
  async searchDecks(query: string): Promise<Deck[]> {
    return this.handleDatabaseOperation('search decks', async () => {
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery) {
        return [];
      }

      return await this.db.decks
        .filter(deck => 
          deck.name.toLowerCase().includes(trimmedQuery) ||
          (deck.description ? deck.description.toLowerCase().includes(trimmedQuery) : false)
        )
        .toArray();
    });
  }

  /**
   * 덱 이름 중복 확인
   */
  async isDuplicateName(name: string, excludeId?: number): Promise<boolean> {
    return this.handleDatabaseOperation('check duplicate name', async () => {
      const trimmedName = name.trim().toLowerCase();
      const existingDecks = await this.db.decks
        .filter(deck => deck.name.toLowerCase() === trimmedName)
        .toArray();

      if (excludeId) {
        return existingDecks.some(deck => deck.id !== excludeId);
      }

      return existingDecks.length > 0;
    });
  }

  /**
   * 덱 이름 유효성 검사 (공통 로직)
   */
  private validateDeckName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw ErrorFactory.deck.nameRequired();
    }

    if (name.length > 100) {
      throw ErrorFactory.deck.nameTooLong(name, 100);
    }
  }

  /**
   * 덱 설명 유효성 검사 (공통 로직)
   */
  private validateDeckDescription(description: string): void {
    if (description && description.length > 500) {
      throw new MyAnkiError(
        ErrorCode.DECK_DESCRIPTION_TOO_LONG,
        `Deck description is too long: ${description.length} characters (max: 500)`,
        { description, length: description.length, maxLength: 500 }
      );
    }
  }

  /**
   * 덱 생성 입력 유효성 검사
   */
  private validateCreateInput(input: CreateDeckInput): void {
    this.validateDeckName(input.name);
    if (input.description) {
      this.validateDeckDescription(input.description);
    }
  }

  /**
   * 덱 수정 입력 유효성 검사
   */
  private validateUpdateInput(updates: UpdateDeckInput): void {
    // 이름 검사 (제공된 경우)
    if ('name' in updates) {
      this.validateDeckName(updates.name!);
    }

    // 설명 검사 (제공된 경우)
    if ('description' in updates && updates.description !== undefined) {
      this.validateDeckDescription(updates.description);
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
   * 덱 통계 계산
   */
  private async calculateDeckStats(deckId: number): Promise<DeckStats> {
    return this.handleDatabaseOperation('calculate deck stats', async () => {
      // 총 카드 수
      const totalCards = await this.db.cards.where('deckId').equals(deckId).count();

      // 학습한 카드 수 (학습 기록이 있는 카드)
      const cardsWithStudy = await this.db.cards
        .where('deckId')
        .equals(deckId)
        .toArray();

      let studiedCards = 0;
      let totalQuality = 0;
      let totalSessions = 0;
      let lastStudiedAt: Date | undefined;

      for (const card of cardsWithStudy) {
        const sessions = await this.db.studySessions
          .where('cardId')
          .equals(card.id!)
          .toArray();

        if (sessions.length > 0) {
          studiedCards++;
          totalSessions += sessions.length;
          totalQuality += sessions.reduce((sum, session) => sum + session.quality, 0);

          // 가장 최근 학습 일시 찾기
          const cardLastStudied = sessions.reduce((latest, session) => 
            session.studiedAt > latest ? session.studiedAt : latest, 
            sessions[0].studiedAt
          );

          if (!lastStudiedAt || cardLastStudied > lastStudiedAt) {
            lastStudiedAt = cardLastStudied;
          }
        }
      }

      const averageQuality = totalSessions > 0 ? totalQuality / totalSessions : 0;

      return {
        totalCards,
        studiedCards,
        averageQuality,
        lastStudiedAt
      };
    });
  }
}