/**
 * 간격 반복 알고리즘 타입 테스트
 * TDD Green 단계: SpacedRepetitionCard 인터페이스 사용 테스트
 */

import { SpacedRepetitionCard } from '@/types/spaced-repetition';

describe('SpacedRepetitionCard 타입', () => {
  it('SpacedRepetitionCard 인터페이스가 정의되어야 한다', () => {
    // Given: SpacedRepetitionCard 타입을 사용한 객체
    const card: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // When & Then: 타입이 올바르게 정의되어야 함
    expect(card.cardId).toBe(1);
    expect(card.easeFactor).toBe(2.5);
    expect(card.interval).toBe(1);
    expect(card.repetitions).toBe(0);
    expect(card.nextReviewDate).toBeInstanceOf(Date);
    expect(card.lastReviewDate).toBeInstanceOf(Date);
    expect(card.createdAt).toBeInstanceOf(Date);
    expect(card.updatedAt).toBeInstanceOf(Date);
  });

  it('필수 필드가 모두 포함되어야 한다', () => {
    // Given: 필수 필드만 포함한 객체
    const minimalCard: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // When & Then: 모든 필수 필드가 존재해야 함
    expect(typeof minimalCard.cardId).toBe('number');
    expect(typeof minimalCard.easeFactor).toBe('number');
    expect(typeof minimalCard.interval).toBe('number');
    expect(typeof minimalCard.repetitions).toBe('number');
    expect(minimalCard.nextReviewDate).toBeInstanceOf(Date);
    expect(minimalCard.lastReviewDate).toBeInstanceOf(Date);
    expect(minimalCard.createdAt).toBeInstanceOf(Date);
    expect(minimalCard.updatedAt).toBeInstanceOf(Date);
  });

  it('기본값이 올바르게 설정되어야 한다', () => {
    // Given: 새로운 카드의 기본값
    const newCard: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 2.5, // SM-2 알고리즘 기본값
      interval: 1, // 첫 번째 간격은 1일
      repetitions: 0, // 아직 학습하지 않음
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // When & Then: 기본값이 SM-2 알고리즘에 맞게 설정되어야 함
    expect(newCard.easeFactor).toBe(2.5);
    expect(newCard.interval).toBe(1);
    expect(newCard.repetitions).toBe(0);
  });
});
