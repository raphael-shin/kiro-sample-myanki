/**
 * Validation utility functions
 */

import { MyAnkiDB } from '@/db/MyAnkiDB';
import { 
  CreateDeckInput, 
  CreateCardInput, 
  CreateStudySessionInput,
  StudyQuality 
} from '@/types/flashcard';
import { MyAnkiError, ErrorCode, ErrorFactory } from '@/types/errors';

/**
 * Check if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is not empty (after trimming)
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Check if a string meets minimum length requirement
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Check if a string doesn't exceed maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Check if a value is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate form field with multiple rules
 */
export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message: string = '필수 입력 항목입니다.'): ValidationRule => ({
    test: isNotEmpty,
    message,
  }),
  
  email: (message: string = '올바른 이메일 주소를 입력해주세요.'): ValidationRule => ({
    test: isValidEmail,
    message,
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => hasMinLength(value, length),
    message: message || `최소 ${length}자 이상 입력해주세요.`,
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => hasMaxLength(value, length),
    message: message || `최대 ${length}자까지 입력 가능합니다.`,
  }),
};

/**
 * 공통 유효성 검사 유틸리티
 */
class ValidationUtils {
  /**
   * 문자열 필수 검사
   */
  static validateRequiredString(value: any, fieldName: string): void {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new MyAnkiError(
        ErrorCode.VALIDATION_ERROR,
        `${fieldName} is required`,
        { field: fieldName, value }
      );
    }
  }

  /**
   * 문자열 길이 검사
   */
  static validateStringLength(value: string, fieldName: string, maxLength: number): void {
    if (value.length > maxLength) {
      throw new MyAnkiError(
        ErrorCode.VALIDATION_ERROR,
        `${fieldName} is too long: ${value.length} characters (max: ${maxLength})`,
        { field: fieldName, value, length: value.length, maxLength }
      );
    }
  }

  /**
   * ID 유효성 검사
   */
  static validateId(id: any, fieldName: string): void {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw ErrorFactory.invalidId(id, `${fieldName} must be positive`);
    }
  }

  /**
   * 엔티티 존재 확인
   */
  static async validateEntityExists<T>(
    entity: T | undefined, 
    entityName: string, 
    id: number,
    errorFactory: (id: number) => MyAnkiError
  ): Promise<void> {
    if (!entity) {
      throw errorFactory(id);
    }
  }
}

/**
 * Deck 유효성 검사
 */
export async function validateDeck(input: CreateDeckInput, db: MyAnkiDB, excludeId?: number): Promise<void> {
  // 이름 필수 검사
  if (!input.name || typeof input.name !== 'string' || input.name.trim() === '') {
    throw ErrorFactory.deck.nameRequired();
  }

  // 이름 길이 검사
  if (input.name.length > 100) {
    throw ErrorFactory.deck.nameTooLong(input.name, 100);
  }

  // 설명 길이 검사
  if (input.description && input.description.length > 500) {
    throw new MyAnkiError(
      ErrorCode.DECK_DESCRIPTION_TOO_LONG,
      `Deck description is too long: ${input.description.length} characters (max: 500)`,
      { description: input.description, length: input.description.length, maxLength: 500 }
    );
  }

  // 중복 이름 검사
  await validateDeckNameUniqueness(input.name, db, excludeId);
}

/**
 * Card 유효성 검사
 */
export async function validateCard(input: CreateCardInput, db: MyAnkiDB): Promise<void> {
  // front 필수 검사
  if (!input.front || typeof input.front !== 'string' || input.front.trim() === '') {
    throw ErrorFactory.card.frontRequired();
  }

  // back 필수 검사
  if (!input.back || typeof input.back !== 'string' || input.back.trim() === '') {
    throw ErrorFactory.card.backRequired();
  }

  // 길이 검사
  ValidationUtils.validateStringLength(input.front, 'Card front', 1000);
  ValidationUtils.validateStringLength(input.back, 'Card back', 1000);

  // deckId 유효성 및 존재 확인
  ValidationUtils.validateId(input.deckId, 'Deck ID');
  const deck = await db.decks.get(input.deckId);
  await ValidationUtils.validateEntityExists(
    deck, 
    'Deck', 
    input.deckId, 
    ErrorFactory.card.invalidDeck
  );
}

/**
 * StudySession 유효성 검사
 */
export async function validateStudySession(input: CreateStudySessionInput, db: MyAnkiDB): Promise<void> {
  // cardId 유효성 검사
  ValidationUtils.validateId(input.cardId, 'Card ID');

  // quality 유효성 검사
  if (!Object.values(StudyQuality).includes(input.quality)) {
    throw ErrorFactory.study.invalidQuality(input.quality);
  }

  // responseTime 유효성 검사
  if (typeof input.responseTime !== 'number' || input.responseTime <= 0) {
    throw ErrorFactory.study.invalidResponseTime(input.responseTime);
  }

  // cardId 존재 확인
  const card = await db.cards.get(input.cardId);
  await ValidationUtils.validateEntityExists(
    card,
    'Card',
    input.cardId,
    ErrorFactory.study.invalidCard
  );
}

/**
 * 덱 이름 중복 검사 (추출된 공통 로직)
 */
async function validateDeckNameUniqueness(name: string, db: MyAnkiDB, excludeId?: number): Promise<void> {
  const trimmedName = name.trim().toLowerCase();
  const existingDecks = await db.decks
    .filter(deck => deck.name.toLowerCase() === trimmedName)
    .toArray();

  if (excludeId) {
    const duplicates = existingDecks.filter(deck => deck.id !== excludeId);
    if (duplicates.length > 0) {
      throw ErrorFactory.deck.duplicateName(name);
    }
  } else {
    if (existingDecks.length > 0) {
      throw ErrorFactory.deck.duplicateName(name);
    }
  }
}
