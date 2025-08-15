/**
 * CardService 클래스
 * 카드 관리를 위한 CRUD 작업과 비즈니스 로직을 제공
 */

import { MyAnkiDB } from '@/db/MyAnkiDB';
import { ICardService } from './interfaces';
import {
  Card,
  CreateCardInput,
  UpdateCardInput
} from '@/types/flashcard';
import {
  MyAnkiError,
  ErrorCode,
  ErrorFactory
} from '@/types/errors';

export class CardService implements ICardService {
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
   * 새로운 카드 생성
   */
  async create(input: CreateCardInput): Promise<number> {
    return this.handleDatabaseOperation('create card', async () => {
      // 유효성 검사
      this.validateCreateInput(input);
      
      // 덱 존재 확인
      await this.validateDeckExists(input.deckId);

      // 카드 생성 (타임스탬프는 훅에서 자동 설정)
      const id = await this.db.cards.add({
        deckId: input.deckId,
        front: input.front.trim(),
        back: input.back.trim()
      });

      return Number(id);
    });
  }

  /**
   * ID로 카드 조회
   */
  async getById(id: number): Promise<Card | undefined> {
    return this.handleDatabaseOperation('get card by id', async () => {
      // ID 유효성 검사
      this.validateId(id);
      
      return await this.db.cards.get(id);
    });
  }

  /**
   * 모든 카드 조회 (생성일시 순)
   */
  async getAll(): Promise<Card[]> {
    return this.handleDatabaseOperation('get all cards', async () => {
      return await this.db.cards.orderBy('createdAt').toArray();
    });
  }

  /**
   * 카드 수정
   */
  async update(id: number, updates: UpdateCardInput): Promise<void> {
    return this.handleDatabaseOperation('update card', async () => {
      // 카드 존재 확인
      await this.validateCardExists(id);

      // 유효성 검사
      this.validateUpdateInput(updates);

      // 업데이트 데이터 준비
      const updateData = this.prepareUpdateData(updates);

      await this.db.cards.update(id, updateData);
    });
  }

  /**
   * 카드 삭제 (연관 데이터도 함께 삭제)
   */
  async delete(id: number): Promise<void> {
    return this.handleDatabaseOperation('delete card', async () => {
      // 카드 존재 확인
      await this.validateCardExists(id);

      // 트랜잭션으로 연관 데이터 삭제
      await this.deleteCardWithRelatedData(id);
    });
  }

  /**
   * 특정 덱의 모든 카드 조회
   */
  async getCardsByDeck(deckId: number): Promise<Card[]> {
    return this.handleDatabaseOperation('get cards by deck', async () => {
      // ID 유효성 검사
      this.validateId(deckId);
      
      // 인덱스를 활용한 최적화된 쿼리
      const cards = await this.db.cards
        .where('deckId')
        .equals(deckId)
        .toArray();
      
      // 메모리에서 정렬 (작은 데이터셋에 대해 효율적)
      return cards.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    });
  }

  /**
   * 학습용 카드 조회 (향후 간격 반복 알고리즘 적용)
   */
  async getCardsForStudy(deckId: number): Promise<Card[]> {
    return this.handleDatabaseOperation('get cards for study', async () => {
      // 현재는 단순히 덱의 모든 카드를 반환
      // 향후 간격 반복 알고리즘 적용 예정
      return await this.getCardsByDeck(deckId);
    });
  }

  /**
   * 덱 내에서 카드 검색
   */
  async searchCards(deckId: number, query: string): Promise<Card[]> {
    return this.handleDatabaseOperation('search cards', async () => {
      // ID 유효성 검사
      this.validateId(deckId);
      
      const normalizedQuery = this.normalizeSearchQuery(query);
      if (!normalizedQuery) {
        return [];
      }

      return await this.db.cards
        .where('deckId')
        .equals(deckId)
        .filter(card => this.matchesSearchQuery(card, normalizedQuery))
        .toArray();
    });
  }

  /**
   * 덱의 카드 개수 조회
   */
  async getCardCount(deckId: number): Promise<number> {
    return this.handleDatabaseOperation('get card count', async () => {
      // ID 유효성 검사
      this.validateId(deckId);
      
      return await this.db.cards.where('deckId').equals(deckId).count();
    });
  }

  /**
   * 카드 내용 유효성 검사 (공통 로직)
   */
  private validateCardContent(content: string, type: 'front' | 'back'): void {
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw type === 'front' 
        ? ErrorFactory.card.frontRequired()
        : ErrorFactory.card.backRequired();
    }

    if (content.length > 1000) {
      const errorCode = type === 'front' 
        ? ErrorCode.CARD_FRONT_TOO_LONG 
        : ErrorCode.CARD_BACK_TOO_LONG;
      
      throw new MyAnkiError(
        errorCode,
        `Card ${type} content is too long: ${content.length} characters (max: 1000)`,
        { [type]: content, length: content.length, maxLength: 1000 }
      );
    }
  }

  /**
   * 카드 앞면 유효성 검사 (공통 로직)
   */
  private validateCardFront(front: string): void {
    this.validateCardContent(front, 'front');
  }

  /**
   * 카드 뒷면 유효성 검사 (공통 로직)
   */
  private validateCardBack(back: string): void {
    this.validateCardContent(back, 'back');
  }

  /**
   * 카드 생성 입력 유효성 검사
   */
  private validateCreateInput(input: CreateCardInput): void {
    // deckId 검사
    this.validateId(input.deckId);
    
    // 앞면 검사
    this.validateCardFront(input.front);
    
    // 뒷면 검사
    this.validateCardBack(input.back);
  }

  /**
   * 카드 수정 입력 유효성 검사
   */
  private validateUpdateInput(updates: UpdateCardInput): void {
    // 앞면 검사 (제공된 경우)
    if ('front' in updates) {
      this.validateCardFront(updates.front!);
    }

    // 뒷면 검사 (제공된 경우)
    if ('back' in updates) {
      this.validateCardBack(updates.back!);
    }
  }

  /**
   * 덱 존재 확인 (공통 로직)
   */
  private async validateDeckExists(deckId: number): Promise<void> {
    const deck = await this.db.decks.get(deckId);
    if (!deck) {
      throw ErrorFactory.deck.notFound(deckId);
    }
  }

  /**
   * 카드 존재 확인 (공통 로직)
   */
  private async validateCardExists(cardId: number): Promise<Card> {
    const card = await this.getById(cardId);
    if (!card) {
      throw ErrorFactory.card.notFound(cardId);
    }
    return card;
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
   * 업데이트 데이터 준비 (공통 로직)
   */
  private prepareUpdateData(updates: UpdateCardInput): Partial<Card> {
    const updateData: Partial<Card> = {};
    
    if (updates.front !== undefined) {
      updateData.front = updates.front.trim();
    }
    
    if (updates.back !== undefined) {
      updateData.back = updates.back.trim();
    }
    
    return updateData;
  }

  /**
   * 카드와 연관 데이터 삭제 (트랜잭션)
   */
  private async deleteCardWithRelatedData(cardId: number): Promise<void> {
    await this.db.transaction('rw', [this.db.cards, this.db.studySessions], async (tx: any) => {
      // 카드의 학습 기록 삭제
      await tx.studySessions.where('cardId').equals(cardId).delete();
      
      // 카드 삭제
      await tx.cards.delete(cardId);
    });
  }

  /**
   * 검색 쿼리 정규화 (공통 로직)
   */
  private normalizeSearchQuery(query: string): string {
    return query.trim().toLowerCase();
  }

  /**
   * 카드가 검색 쿼리와 일치하는지 확인 (공통 로직)
   */
  private matchesSearchQuery(card: Card, normalizedQuery: string): boolean {
    return card.front.toLowerCase().includes(normalizedQuery) ||
           card.back.toLowerCase().includes(normalizedQuery);
  }
}