/**
 * Validation 유틸리티 테스트
 * TDD 접근 방식으로 유효성 검사 함수들을 테스트
 */

import { 
  validateDeck, 
  validateCard, 
  validateStudySession 
} from '@/utils/validation';
import { 
  CreateDeckInput, 
  CreateCardInput, 
  CreateStudySessionInput, 
  StudyQuality 
} from '@/types/flashcard';
import { MyAnkiError, ErrorCode } from '@/types/errors';

// Mock 데이터베이스 - 중복 검사를 위해 필요
const mockDb = {
  decks: {
    filter: jest.fn(),
    toArray: jest.fn(),
    get: jest.fn()
  },
  cards: {
    get: jest.fn()
  }
};

describe('Validation Utils', () => {
  describe('validateDeck', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('이름이 없을 때 DECK_NAME_REQUIRED 에러를 발생시켜야 한다', async () => {
        const invalidDeckData: CreateDeckInput = {
          name: '',
          description: '테스트 덱'
        };

        await expect(validateDeck(invalidDeckData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_REQUIRED
          });
      });

      it('이름이 100자를 초과할 때 DECK_NAME_TOO_LONG 에러를 발생시켜야 한다', async () => {
        const longName = 'a'.repeat(101);
        const invalidDeckData: CreateDeckInput = {
          name: longName,
          description: '테스트 덱'
        };

        await expect(validateDeck(invalidDeckData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_TOO_LONG
          });
      });

      it('중복된 이름일 때 DECK_NAME_DUPLICATE 에러를 발생시켜야 한다', async () => {
        const duplicateDeckData: CreateDeckInput = {
          name: '기존 덱',
          description: '테스트 덱'
        };

        mockDb.decks.filter.mockReturnValue({
          toArray: jest.fn().mockResolvedValue([{ id: 1, name: '기존 덱' }])
        });

        await expect(validateDeck(duplicateDeckData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.DECK_NAME_DUPLICATE
          });
      });
    });

    describe('성공 케이스', () => {
      beforeEach(() => {
        mockDb.decks.filter.mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        });
      });

      it('유효한 덱 데이터일 때 에러가 발생하지 않아야 한다', async () => {
        const validDeckData: CreateDeckInput = {
          name: '유효한 덱',
          description: '유효한 설명'
        };

        await expect(validateDeck(validDeckData, mockDb as any))
          .resolves
          .not
          .toThrow();
      });
    });
  });

  describe('validateCard', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('front가 없을 때 CARD_FRONT_REQUIRED 에러를 발생시켜야 한다', async () => {
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '',
          back: '뒷면 내용'
        };

        await expect(validateCard(invalidCardData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_FRONT_REQUIRED
          });
      });

      it('back이 없을 때 CARD_BACK_REQUIRED 에러를 발생시켜야 한다', async () => {
        const invalidCardData: CreateCardInput = {
          deckId: 1,
          front: '앞면 내용',
          back: ''
        };

        await expect(validateCard(invalidCardData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_BACK_REQUIRED
          });
      });

      it('존재하지 않는 deckId일 때 CARD_INVALID_DECK 에러를 발생시켜야 한다', async () => {
        const invalidCardData: CreateCardInput = {
          deckId: 999,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        mockDb.decks.get = jest.fn().mockResolvedValue(undefined);

        await expect(validateCard(invalidCardData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.CARD_INVALID_DECK
          });
      });
    });

    describe('성공 케이스', () => {
      beforeEach(() => {
        mockDb.decks.get = jest.fn().mockResolvedValue({ id: 1, name: '테스트 덱' });
      });

      it('유효한 카드 데이터일 때 에러가 발생하지 않아야 한다', async () => {
        const validCardData: CreateCardInput = {
          deckId: 1,
          front: '앞면 내용',
          back: '뒷면 내용'
        };

        await expect(validateCard(validCardData, mockDb as any))
          .resolves
          .not
          .toThrow();
      });
    });
  });

  describe('validateStudySession', () => {
    describe('실패 케이스 (TDD Red)', () => {
      it('잘못된 quality 값(0)일 때 STUDY_QUALITY_INVALID 에러를 발생시켜야 한다', async () => {
        const invalidStudySessionData: CreateStudySessionInput = {
          cardId: 1,
          studiedAt: new Date(),
          quality: 0 as StudyQuality,
          responseTime: 5000
        };

        await expect(validateStudySession(invalidStudySessionData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.STUDY_QUALITY_INVALID
          });
      });

      it('음수 responseTime일 때 STUDY_RESPONSE_TIME_INVALID 에러를 발생시켜야 한다', async () => {
        const invalidStudySessionData: CreateStudySessionInput = {
          cardId: 1,
          studiedAt: new Date(),
          quality: StudyQuality.GOOD,
          responseTime: -1000
        };

        await expect(validateStudySession(invalidStudySessionData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.STUDY_RESPONSE_TIME_INVALID
          });
      });

      it('존재하지 않는 cardId일 때 STUDY_INVALID_CARD 에러를 발생시켜야 한다', async () => {
        const invalidStudySessionData: CreateStudySessionInput = {
          cardId: 999,
          studiedAt: new Date(),
          quality: StudyQuality.GOOD,
          responseTime: 5000
        };

        mockDb.cards.get = jest.fn().mockResolvedValue(undefined);

        await expect(validateStudySession(invalidStudySessionData, mockDb as any))
          .rejects
          .toMatchObject({
            code: ErrorCode.STUDY_INVALID_CARD
          });
      });
    });

    describe('성공 케이스', () => {
      beforeEach(() => {
        mockDb.cards.get = jest.fn().mockResolvedValue({ id: 1, deckId: 1, front: '앞면', back: '뒷면' });
      });

      it('유효한 학습 세션 데이터일 때 에러가 발생하지 않아야 한다', async () => {
        const validStudySessionData: CreateStudySessionInput = {
          cardId: 1,
          studiedAt: new Date(),
          quality: StudyQuality.GOOD,
          responseTime: 5000
        };

        await expect(validateStudySession(validStudySessionData, mockDb as any))
          .resolves
          .not
          .toThrow();
      });
    });
  });
});
