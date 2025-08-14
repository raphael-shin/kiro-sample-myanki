/**
 * 에러 타입 시스템 검증 테스트
 * MyAnkiError 클래스와 ErrorCode enum의 동작을 검증
 */

import {
  ErrorCode,
  MyAnkiError,
  getErrorMessage,
  ErrorFactory,
  isMyAnkiError,
  isValidationError,
  isNotFoundError,
  isDatabaseError
} from '@/types/errors';

describe('Error Type System', () => {
  describe('ErrorCode enum', () => {
    it('should have all required error codes', () => {
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(ErrorCode.CONSTRAINT_VIOLATION).toBe('CONSTRAINT_VIOLATION');
      
      // 덱 관련 에러
      expect(ErrorCode.DECK_NOT_FOUND).toBe('DECK_NOT_FOUND');
      expect(ErrorCode.DECK_NAME_DUPLICATE).toBe('DECK_NAME_DUPLICATE');
      expect(ErrorCode.DECK_NAME_REQUIRED).toBe('DECK_NAME_REQUIRED');
      
      // 카드 관련 에러
      expect(ErrorCode.CARD_NOT_FOUND).toBe('CARD_NOT_FOUND');
      expect(ErrorCode.CARD_FRONT_REQUIRED).toBe('CARD_FRONT_REQUIRED');
      expect(ErrorCode.CARD_BACK_REQUIRED).toBe('CARD_BACK_REQUIRED');
      
      // 학습 세션 관련 에러
      expect(ErrorCode.STUDY_SESSION_NOT_FOUND).toBe('STUDY_SESSION_NOT_FOUND');
      expect(ErrorCode.STUDY_QUALITY_INVALID).toBe('STUDY_QUALITY_INVALID');
      expect(ErrorCode.STUDY_RESPONSE_TIME_INVALID).toBe('STUDY_RESPONSE_TIME_INVALID');
    });

    it('should be usable as object keys', () => {
      const errorMap = {
        [ErrorCode.NOT_FOUND]: 'Not Found',
        [ErrorCode.VALIDATION_ERROR]: 'Validation Error'
      };

      expect(errorMap[ErrorCode.NOT_FOUND]).toBe('Not Found');
      expect(errorMap[ErrorCode.VALIDATION_ERROR]).toBe('Validation Error');
    });
  });

  describe('MyAnkiError class', () => {
    it('should create error with basic properties', () => {
      const error = new MyAnkiError(
        ErrorCode.NOT_FOUND,
        'Test error message'
      );

      expect(error.name).toBe('MyAnkiError');
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Test error message');
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.details).toBeUndefined();
    });

    it('should create error with details', () => {
      const details = { id: 123, type: 'deck' };
      const error = new MyAnkiError(
        ErrorCode.DECK_NOT_FOUND,
        'Deck not found',
        details
      );

      expect(error.code).toBe(ErrorCode.DECK_NOT_FOUND);
      expect(error.message).toBe('Deck not found');
      expect(error.details).toEqual(details);
    });

    it('should be instance of Error', () => {
      const error = new MyAnkiError(ErrorCode.NOT_FOUND, 'Test');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(MyAnkiError);
    });

    it('should serialize to JSON correctly', () => {
      const error = new MyAnkiError(
        ErrorCode.VALIDATION_ERROR,
        'Validation failed',
        { field: 'name' }
      );

      const json = error.toJSON();

      expect(json.name).toBe('MyAnkiError');
      expect(json.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(json.message).toBe('Validation failed');
      expect(json.details).toEqual({ field: 'name' });
      expect(json.timestamp).toBeDefined();
      expect(typeof json.timestamp).toBe('string');
    });

    it('should return user-friendly message', () => {
      const error = new MyAnkiError(
        ErrorCode.DECK_NOT_FOUND,
        'Technical error message'
      );

      const userMessage = error.getUserMessage();
      expect(userMessage).toBe('덱을 찾을 수 없습니다.');
    });
  });

  describe('getErrorMessage function', () => {
    it('should return correct Korean messages for all error codes', () => {
      expect(getErrorMessage(ErrorCode.NOT_FOUND)).toBe('요청한 데이터를 찾을 수 없습니다.');
      expect(getErrorMessage(ErrorCode.VALIDATION_ERROR)).toBe('입력한 데이터가 올바르지 않습니다.');
      expect(getErrorMessage(ErrorCode.DECK_NOT_FOUND)).toBe('덱을 찾을 수 없습니다.');
      expect(getErrorMessage(ErrorCode.CARD_FRONT_REQUIRED)).toBe('카드 앞면 내용은 필수입니다.');
      expect(getErrorMessage(ErrorCode.STUDY_QUALITY_INVALID)).toBe('학습 품질 점수가 올바르지 않습니다. (1-4)');
    });

    it('should return default message for unknown error code', () => {
      const unknownCode = 'UNKNOWN_ERROR' as ErrorCode;
      expect(getErrorMessage(unknownCode)).toBe('알 수 없는 오류가 발생했습니다.');
    });
  });

  describe('ErrorFactory', () => {
    describe('general error factories', () => {
      it('should create notFound error', () => {
        const error = ErrorFactory.notFound('Deck', 123);

        expect(error.code).toBe(ErrorCode.NOT_FOUND);
        expect(error.message).toBe('Deck with id 123 not found');
        expect(error.details).toEqual({ entityType: 'Deck', id: 123 });
      });

      it('should create validation error', () => {
        const error = ErrorFactory.validation('name', '', 'required');

        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.message).toBe("Validation failed for field 'name': required");
        expect(error.details).toEqual({ field: 'name', value: '', constraint: 'required' });
      });

      it('should create database error', () => {
        const originalError = new Error('Connection failed');
        const error = ErrorFactory.database('insert', originalError);

        expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
        expect(error.message).toBe("Database operation 'insert' failed");
        expect(error.details).toEqual({ operation: 'insert', originalError: 'Connection failed' });
      });
    });

    describe('deck error factories', () => {
      it('should create deck not found error', () => {
        const error = ErrorFactory.deck.notFound(123);

        expect(error.code).toBe(ErrorCode.DECK_NOT_FOUND);
        expect(error.message).toBe('Deck with id 123 not found');
        expect(error.details).toEqual({ id: 123 });
      });

      it('should create duplicate name error', () => {
        const error = ErrorFactory.deck.duplicateName('Test Deck');

        expect(error.code).toBe(ErrorCode.DECK_NAME_DUPLICATE);
        expect(error.message).toBe("Deck name 'Test Deck' already exists");
        expect(error.details).toEqual({ name: 'Test Deck' });
      });

      it('should create name required error', () => {
        const error = ErrorFactory.deck.nameRequired();

        expect(error.code).toBe(ErrorCode.DECK_NAME_REQUIRED);
        expect(error.message).toBe('Deck name is required');
        expect(error.details).toBeUndefined();
      });

      it('should create name too long error', () => {
        const longName = 'A'.repeat(150);
        const error = ErrorFactory.deck.nameTooLong(longName, 100);

        expect(error.code).toBe(ErrorCode.DECK_NAME_TOO_LONG);
        expect(error.message).toBe(`Deck name '${longName}' is too long: 150 characters (max: 100)`);
        expect(error.details).toEqual({ name: longName, length: 150, maxLength: 100 });
      });
    });

    describe('card error factories', () => {
      it('should create card not found error', () => {
        const error = ErrorFactory.card.notFound(456);

        expect(error.code).toBe(ErrorCode.CARD_NOT_FOUND);
        expect(error.message).toBe('Card with id 456 not found');
        expect(error.details).toEqual({ id: 456 });
      });

      it('should create front required error', () => {
        const error = ErrorFactory.card.frontRequired();

        expect(error.code).toBe(ErrorCode.CARD_FRONT_REQUIRED);
        expect(error.message).toBe('Card front content is required');
      });

      it('should create back required error', () => {
        const error = ErrorFactory.card.backRequired();

        expect(error.code).toBe(ErrorCode.CARD_BACK_REQUIRED);
        expect(error.message).toBe('Card back content is required');
      });

      it('should create invalid deck error', () => {
        const error = ErrorFactory.card.invalidDeck(999);

        expect(error.code).toBe(ErrorCode.CARD_INVALID_DECK);
        expect(error.message).toBe('Deck with id 999 does not exist');
        expect(error.details).toEqual({ deckId: 999 });
      });
    });

    describe('study error factories', () => {
      it('should create study session not found error', () => {
        const error = ErrorFactory.study.notFound(789);

        expect(error.code).toBe(ErrorCode.STUDY_SESSION_NOT_FOUND);
        expect(error.message).toBe('Study session with id 789 not found');
        expect(error.details).toEqual({ id: 789 });
      });

      it('should create invalid quality error', () => {
        const error = ErrorFactory.study.invalidQuality(5);

        expect(error.code).toBe(ErrorCode.STUDY_QUALITY_INVALID);
        expect(error.message).toBe('Invalid study quality: 5 (must be 1-4)');
        expect(error.details).toEqual({ quality: 5 });
      });

      it('should create invalid response time error', () => {
        const error = ErrorFactory.study.invalidResponseTime(-100);

        expect(error.code).toBe(ErrorCode.STUDY_RESPONSE_TIME_INVALID);
        expect(error.message).toBe('Invalid response time: -100 (must be positive)');
        expect(error.details).toEqual({ responseTime: -100 });
      });

      it('should create invalid card error', () => {
        const error = ErrorFactory.study.invalidCard(999);

        expect(error.code).toBe(ErrorCode.STUDY_INVALID_CARD);
        expect(error.message).toBe('Card with id 999 does not exist');
        expect(error.details).toEqual({ cardId: 999 });
      });
    });
  });

  describe('Type guard functions', () => {
    it('should identify MyAnkiError correctly', () => {
      const myAnkiError = new MyAnkiError(ErrorCode.NOT_FOUND, 'Test');
      const regularError = new Error('Regular error');
      const notAnError = { message: 'Not an error' };

      expect(isMyAnkiError(myAnkiError)).toBe(true);
      expect(isMyAnkiError(regularError)).toBe(false);
      expect(isMyAnkiError(notAnError)).toBe(false);
    });

    it('should identify validation errors correctly', () => {
      const validationError = new MyAnkiError(ErrorCode.VALIDATION_ERROR, 'Validation failed');
      const notFoundError = new MyAnkiError(ErrorCode.NOT_FOUND, 'Not found');
      const regularError = new Error('Regular error');

      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(notFoundError)).toBe(false);
      expect(isValidationError(regularError)).toBe(false);
    });

    it('should identify not found errors correctly', () => {
      const notFoundError = new MyAnkiError(ErrorCode.NOT_FOUND, 'Not found');
      const validationError = new MyAnkiError(ErrorCode.VALIDATION_ERROR, 'Validation failed');
      const regularError = new Error('Regular error');

      expect(isNotFoundError(notFoundError)).toBe(true);
      expect(isNotFoundError(validationError)).toBe(false);
      expect(isNotFoundError(regularError)).toBe(false);
    });

    it('should identify database errors correctly', () => {
      const databaseError = new MyAnkiError(ErrorCode.DATABASE_ERROR, 'Database failed');
      const validationError = new MyAnkiError(ErrorCode.VALIDATION_ERROR, 'Validation failed');
      const regularError = new Error('Regular error');

      expect(isDatabaseError(databaseError)).toBe(true);
      expect(isDatabaseError(validationError)).toBe(false);
      expect(isDatabaseError(regularError)).toBe(false);
    });
  });

  describe('Error message format validation', () => {
    it('should have consistent error message format', () => {
      const error = new MyAnkiError(
        ErrorCode.DECK_NOT_FOUND,
        'Deck with id 123 not found',
        { id: 123 }
      );

      // 기술적 메시지는 영어로
      expect(error.message).toMatch(/^[A-Za-z]/);
      expect(error.message).toContain('Deck');
      expect(error.message).toContain('123');

      // 사용자 메시지는 한국어로
      const userMessage = error.getUserMessage();
      expect(userMessage).toMatch(/[가-힣]/);
    });

    it('should include relevant details in error messages', () => {
      const nameError = ErrorFactory.deck.nameTooLong('VeryLongDeckName', 10);
      expect(nameError.message).toContain('VeryLongDeckName');
      expect(nameError.message).toContain('10');

      const qualityError = ErrorFactory.study.invalidQuality(5);
      expect(qualityError.message).toContain('5');
      expect(qualityError.message).toContain('1-4');
    });
  });
});