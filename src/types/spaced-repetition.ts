/**
 * 간격 반복 알고리즘 관련 타입 정의
 * SM-2 (SuperMemo 2) 알고리즘을 기반으로 한 간격 반복 학습 시스템
 */

/**
 * 간격 반복 카드 데이터
 * 
 * SM-2 알고리즘에 필요한 모든 정보를 저장하는 인터페이스입니다.
 * 각 카드의 학습 진행 상황과 다음 복습 일정을 관리합니다.
 * 
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */
export interface SpacedRepetitionCard {
  /** 
   * 연결된 카드 ID
   * Card 테이블의 외래 키
   */
  cardId: number;
  
  /** 
   * 용이도 인수 (Ease Factor)
   * 
   * SM-2 알고리즘의 핵심 매개변수로, 카드의 난이도를 나타냅니다.
   * - 기본값: 2.5
   * - 범위: 1.3 ~ 무제한 (일반적으로 3.0 이하)
   * - 높을수록 쉬운 카드 (간격이 빠르게 증가)
   */
  easeFactor: number;
  
  /** 
   * 다음 복습까지의 간격 (일 단위)
   * 
   * 현재 복습 후 다음 복습까지의 일수입니다.
   * - 첫 번째 복습: 1일
   * - 두 번째 복습: 6일
   * - 이후: 이전 간격 × 용이도 인수
   */
  interval: number;
  
  /** 
   * 연속 성공 횟수
   * 
   * 품질 점수 3 이상으로 연속 성공한 횟수입니다.
   * 품질 점수가 3 미만이면 0으로 리셋됩니다.
   */
  repetitions: number;
  
  /** 
   * 다음 복습 예정일
   * 
   * 사용자가 이 카드를 다시 학습해야 하는 날짜입니다.
   * 오늘 날짜와 비교하여 학습 대상 카드를 필터링하는 데 사용됩니다.
   */
  nextReviewDate: Date;
  
  /** 
   * 마지막 복습일
   * 
   * 사용자가 이 카드를 마지막으로 학습한 날짜입니다.
   * 학습 통계 및 진행률 계산에 사용됩니다.
   */
  lastReviewDate: Date;
  
  /** 
   * 생성일시
   * 간격 반복 데이터가 처음 생성된 시점
   */
  createdAt: Date;
  
  /** 
   * 수정일시
   * 간격 반복 데이터가 마지막으로 업데이트된 시점
   */
  updatedAt: Date;
}

/**
 * SM-2 알고리즘 상수
 */
export const SM2_CONSTANTS = {
  /** 기본 용이도 인수 */
  DEFAULT_EASE_FACTOR: 2.5,
  
  /** 최소 용이도 인수 */
  MIN_EASE_FACTOR: 1.3,
  
  /** 첫 번째 간격 (일) */
  FIRST_INTERVAL: 1,
  
  /** 두 번째 간격 (일) */
  SECOND_INTERVAL: 6,
  
  /** "Again" 응답 시 간격 (분) */
  AGAIN_INTERVAL_MINUTES: 1,
} as const;

/**
 * 간격 반복 카드 생성을 위한 입력 타입
 */
export type CreateSpacedRepetitionCardInput = Omit<SpacedRepetitionCard, 'createdAt' | 'updatedAt'>;

/**
 * 간격 반복 카드 수정을 위한 입력 타입
 */
export type UpdateSpacedRepetitionCardInput = Partial<Omit<SpacedRepetitionCard, 'cardId' | 'createdAt' | 'updatedAt'>>;
