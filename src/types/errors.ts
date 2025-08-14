/**
 * MyAnki 애플리케이션 에러 타입 시스템
 * 일관된 에러 처리와 사용자 친화적인 에러 메시지를 위한 타입 정의
 */

/**
 * 에러 코드 열거형
 * 각 에러 유형을 구분하기 위한 코드
 */
export enum ErrorCode {
  // 일반적인 에러
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // 덱 관련 에러
  DECK_NOT_FOUND = 'DECK_NOT_FOUND',
  DECK_NAME_DUPLICATE = 'DECK_NAME_DUPLICATE',
  DECK_NAME_REQUIRED = 'DECK_NAME_REQUIRED',
  DECK_NAME_TOO_LONG = 'DECK_NAME_TOO_LONG',
  DECK_DESCRIPTION_TOO_LONG = 'DECK_DESCRIPTION_TOO_LONG',
  
  // 카드 관련 에러
  CARD_NOT_FOUND = 'CARD_NOT_FOUND',
  CARD_FRONT_REQUIRED = 'CARD_FRONT_REQUIRED',
  CARD_BACK_REQUIRED = 'CARD_BACK_REQUIRED',
  CARD_FRONT_TOO_LONG = 'CARD_FRONT_TOO_LONG',
  CARD_BACK_TOO_LONG = 'CARD_BACK_TOO_LONG',
  CARD_INVALID_DECK = 'CARD_INVALID_DECK',
  
  // 학습 세션 관련 에러
  STUDY_SESSION_NOT_FOUND = 'STUDY_SESSION_NOT_FOUND',
  STUDY_QUALITY_INVALID = 'STUDY_QUALITY_INVALID',
  STUDY_RESPONSE_TIME_INVALID = 'STUDY_RESPONSE_TIME_INVALID',
  STUDY_INVALID_CARD = 'STUDY_INVALID_CARD',
  
  // 시스템 에러
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INDEX_ERROR = 'INDEX_ERROR',
  MIGRATION_ERROR = 'MIGRATION_ERROR'
}

/**
 * MyAnki 커스텀 에러 클래스
 * 구조화된 에러 정보와 사용자 친화적인 메시지를 제공
 */
export class MyAnkiError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message: string,
    details?: any
  ) {
    super(message);
    this.name = 'MyAnkiError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Error 클래스 상속 시 프로토타입 체인 복원
    Object.setPrototypeOf(this, MyAnkiError.prototype);
  }

  /**
   * 에러를 JSON 형태로 직렬화
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }

  /**
   * 사용자 친화적인 메시지 반환
   */
  getUserMessage(): string {
    return getErrorMessage(this.code);
  }
}

/**
 * 에러 코드별 사용자 친화적인 메시지 매핑
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 일반적인 에러
  [ErrorCode.NOT_FOUND]: '요청한 데이터를 찾을 수 없습니다.',
  [ErrorCode.VALIDATION_ERROR]: '입력한 데이터가 올바르지 않습니다.',
  [ErrorCode.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [ErrorCode.CONSTRAINT_VIOLATION]: '데이터 제약 조건을 위반했습니다.',
  
  // 덱 관련 에러
  [ErrorCode.DECK_NOT_FOUND]: '덱을 찾을 수 없습니다.',
  [ErrorCode.DECK_NAME_DUPLICATE]: '이미 존재하는 덱 이름입니다.',
  [ErrorCode.DECK_NAME_REQUIRED]: '덱 이름은 필수입니다.',
  [ErrorCode.DECK_NAME_TOO_LONG]: '덱 이름이 너무 깁니다. (최대 100자)',
  [ErrorCode.DECK_DESCRIPTION_TOO_LONG]: '덱 설명이 너무 깁니다. (최대 500자)',
  
  // 카드 관련 에러
  [ErrorCode.CARD_NOT_FOUND]: '카드를 찾을 수 없습니다.',
  [ErrorCode.CARD_FRONT_REQUIRED]: '카드 앞면 내용은 필수입니다.',
  [ErrorCode.CARD_BACK_REQUIRED]: '카드 뒷면 내용은 필수입니다.',
  [ErrorCode.CARD_FRONT_TOO_LONG]: '카드 앞면 내용이 너무 깁니다. (최대 1000자)',
  [ErrorCode.CARD_BACK_TOO_LONG]: '카드 뒷면 내용이 너무 깁니다. (최대 1000자)',
  [ErrorCode.CARD_INVALID_DECK]: '존재하지 않는 덱입니다.',
  
  // 학습 세션 관련 에러
  [ErrorCode.STUDY_SESSION_NOT_FOUND]: '학습 기록을 찾을 수 없습니다.',
  [ErrorCode.STUDY_QUALITY_INVALID]: '학습 품질 점수가 올바르지 않습니다. (1-4)',
  [ErrorCode.STUDY_RESPONSE_TIME_INVALID]: '응답 시간이 올바르지 않습니다.',
  [ErrorCode.STUDY_INVALID_CARD]: '존재하지 않는 카드입니다.',
  
  // 시스템 에러
  [ErrorCode.TRANSACTION_FAILED]: '데이터베이스 트랜잭션이 실패했습니다.',
  [ErrorCode.INDEX_ERROR]: '데이터베이스 인덱스 오류가 발생했습니다.',
  [ErrorCode.MIGRATION_ERROR]: '데이터베이스 마이그레이션 오류가 발생했습니다.'
};

/**
 * 에러 코드에 해당하는 사용자 친화적인 메시지 반환
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 생성 헬퍼 함수들
 */
export const ErrorFactory = {
  /**
   * 데이터를 찾을 수 없는 에러 생성
   */
  notFound(entityType: string, id: number | string): MyAnkiError {
    return new MyAnkiError(
      ErrorCode.NOT_FOUND,
      `${entityType} with id ${id} not found`,
      { entityType, id }
    );
  },

  /**
   * 유효성 검사 에러 생성
   */
  validation(field: string, value: any, constraint: string): MyAnkiError {
    return new MyAnkiError(
      ErrorCode.VALIDATION_ERROR,
      `Validation failed for field '${field}': ${constraint}`,
      { field, value, constraint }
    );
  },

  /**
   * 데이터베이스 에러 생성
   */
  database(operation: string, originalError?: Error): MyAnkiError {
    return new MyAnkiError(
      ErrorCode.DATABASE_ERROR,
      `Database operation '${operation}' failed`,
      { operation, originalError: originalError?.message }
    );
  },

  /**
   * 덱 관련 에러 생성
   */
  deck: {
    notFound: (id: number): MyAnkiError => new MyAnkiError(
      ErrorCode.DECK_NOT_FOUND,
      `Deck with id ${id} not found`,
      { id }
    ),
    
    duplicateName: (name: string): MyAnkiError => new MyAnkiError(
      ErrorCode.DECK_NAME_DUPLICATE,
      `Deck name '${name}' already exists`,
      { name }
    ),
    
    nameRequired: (): MyAnkiError => new MyAnkiError(
      ErrorCode.DECK_NAME_REQUIRED,
      'Deck name is required'
    ),
    
    nameTooLong: (name: string, maxLength: number): MyAnkiError => new MyAnkiError(
      ErrorCode.DECK_NAME_TOO_LONG,
      `Deck name '${name}' is too long: ${name.length} characters (max: ${maxLength})`,
      { name, length: name.length, maxLength }
    )
  },

  /**
   * 카드 관련 에러 생성
   */
  card: {
    notFound: (id: number): MyAnkiError => new MyAnkiError(
      ErrorCode.CARD_NOT_FOUND,
      `Card with id ${id} not found`,
      { id }
    ),
    
    frontRequired: (): MyAnkiError => new MyAnkiError(
      ErrorCode.CARD_FRONT_REQUIRED,
      'Card front content is required'
    ),
    
    backRequired: (): MyAnkiError => new MyAnkiError(
      ErrorCode.CARD_BACK_REQUIRED,
      'Card back content is required'
    ),
    
    invalidDeck: (deckId: number): MyAnkiError => new MyAnkiError(
      ErrorCode.CARD_INVALID_DECK,
      `Deck with id ${deckId} does not exist`,
      { deckId }
    )
  },

  /**
   * 학습 세션 관련 에러 생성
   */
  study: {
    notFound: (id: number): MyAnkiError => new MyAnkiError(
      ErrorCode.STUDY_SESSION_NOT_FOUND,
      `Study session with id ${id} not found`,
      { id }
    ),
    
    invalidQuality: (quality: number): MyAnkiError => new MyAnkiError(
      ErrorCode.STUDY_QUALITY_INVALID,
      `Invalid study quality: ${quality} (must be 1-4)`,
      { quality }
    ),
    
    invalidResponseTime: (responseTime: number): MyAnkiError => new MyAnkiError(
      ErrorCode.STUDY_RESPONSE_TIME_INVALID,
      `Invalid response time: ${responseTime} (must be positive)`,
      { responseTime }
    ),
    
    invalidCard: (cardId: number): MyAnkiError => new MyAnkiError(
      ErrorCode.STUDY_INVALID_CARD,
      `Card with id ${cardId} does not exist`,
      { cardId }
    )
  }
};

/**
 * 에러 타입 가드 함수들
 */
export function isMyAnkiError(error: any): error is MyAnkiError {
  return error instanceof MyAnkiError;
}

export function isValidationError(error: any): boolean {
  return isMyAnkiError(error) && error.code === ErrorCode.VALIDATION_ERROR;
}

export function isNotFoundError(error: any): boolean {
  return isMyAnkiError(error) && error.code === ErrorCode.NOT_FOUND;
}

export function isDatabaseError(error: any): boolean {
  return isMyAnkiError(error) && error.code === ErrorCode.DATABASE_ERROR;
}