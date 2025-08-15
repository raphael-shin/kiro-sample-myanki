/**
 * SM-2 간격 반복 알고리즘 구현
 * SuperMemo 2 알고리즘을 기반으로 한 간격 반복 학습 시스템
 */

import { StudyQuality } from '@/types/flashcard';
import { SM2_CONSTANTS } from '@/types/spaced-repetition';

/**
 * SM-2 알고리즘 계산 상수
 */
const SM2_CALCULATION_CONSTANTS = {
  /** 용이도 인수 계산 기본 증가값 */
  EF_BASE_INCREMENT: 0.1,
  
  /** 용이도 인수 계산 첫 번째 계수 */
  EF_FIRST_COEFFICIENT: 0.08,
  
  /** 용이도 인수 계산 두 번째 계수 */
  EF_SECOND_COEFFICIENT: 0.02,
  
  /** 품질 점수 기준값 */
  QUALITY_REFERENCE: 5,
} as const;

/**
 * 품질 점수에 따른 용이도 인수 계산
 * 
 * SM-2 공식: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
 * 여기서 q는 품질 점수 (1-4), EF는 용이도 인수
 * 
 * @param currentEF 현재 용이도 인수 (일반적으로 1.3 ~ 3.0 범위)
 * @param quality 품질 점수 (1: Again, 2: Hard, 3: Good, 4: Easy)
 * @returns 새로운 용이도 인수 (최소 1.3)
 * 
 * @example
 * ```typescript
 * const newEF = calculateEaseFactor(2.5, StudyQuality.GOOD); // ~2.36
 * ```
 */
export function calculateEaseFactor(currentEF: number, quality: StudyQuality): number {
  const q = quality;
  const qualityDiff = SM2_CALCULATION_CONSTANTS.QUALITY_REFERENCE - q;
  
  // SM-2 공식 적용
  const efAdjustment = SM2_CALCULATION_CONSTANTS.EF_BASE_INCREMENT - 
    qualityDiff * (
      SM2_CALCULATION_CONSTANTS.EF_FIRST_COEFFICIENT + 
      qualityDiff * SM2_CALCULATION_CONSTANTS.EF_SECOND_COEFFICIENT
    );
  
  const newEF = currentEF + efAdjustment;
  
  // 최소값 제한 적용
  return Math.max(newEF, SM2_CONSTANTS.MIN_EASE_FACTOR);
}

/**
 * 반복 횟수와 용이도 인수에 따른 간격 계산
 * 
 * @param repetitions 연속 성공 횟수
 * @param easeFactor 용이도 인수
 * @param previousInterval 이전 간격 (repetitions >= 2일 때 필요)
 * @returns 다음 복습까지의 간격 (일 단위)
 */
export function calculateInterval(repetitions: number, easeFactor: number, previousInterval?: number): number {
  let interval: number;
  
  if (repetitions === 0) {
    // 첫 번째 복습
    interval = SM2_CONSTANTS.FIRST_INTERVAL;
  } else if (repetitions === 1) {
    // 두 번째 복습
    interval = SM2_CONSTANTS.SECOND_INTERVAL;
  } else {
    // 세 번째 복습부터
    if (previousInterval === undefined) {
      throw new Error('Previous interval is required for repetitions >= 2');
    }
    interval = previousInterval * easeFactor;
  }
  
  // 최소 간격 제한 및 정수 반올림
  return Math.max(Math.round(interval), 1);
}

/**
 * SM-2 알고리즘 클래스
 * 간격 반복 학습을 위한 핵심 알고리즘을 캡슐화
 */
export class SM2Algorithm {
  /**
   * SM2Algorithm 생성자
   */
  constructor() {
    // 기본 생성자 - 현재는 특별한 초기화 없음
  }

  /**
   * 다음 복습 일정 계산
   * 
   * @param currentData 현재 간격 반복 데이터
   * @param quality 품질 점수
   * @returns 업데이트된 간격 반복 데이터
   */
  calculateNextReview(currentData: any, quality: StudyQuality): any {
    const { easeFactor, interval, repetitions } = currentData;
    
    if (quality === StudyQuality.AGAIN) {
      // "Again" 처리: 간격 1분, repetitions 리셋
      return {
        ...currentData,
        interval: SM2_CONSTANTS.AGAIN_INTERVAL_MINUTES / 1440, // 1분을 일 단위로 변환
        repetitions: 0,
        easeFactor: calculateEaseFactor(easeFactor, quality)
      };
    }
    
    if (quality === StudyQuality.HARD) {
      // "Hard" 처리: 간격 1.2배 증가
      return {
        ...currentData,
        interval: Math.max(Math.round(interval * 1.2), 1),
        easeFactor: calculateEaseFactor(easeFactor, quality)
      };
    }
    
    if (quality === StudyQuality.GOOD) {
      // "Good" 처리: 정상적인 SM-2 계산
      const newRepetitions = repetitions + 1;
      const newInterval = calculateInterval(newRepetitions, easeFactor, interval);
      
      return {
        ...currentData,
        interval: newInterval,
        repetitions: newRepetitions,
        easeFactor: calculateEaseFactor(easeFactor, quality)
      };
    }
    
    if (quality === StudyQuality.EASY) {
      // "Easy" 처리: 간격 1.3배 증가 및 EF 증가
      const newRepetitions = repetitions + 1;
      const baseInterval = calculateInterval(newRepetitions, easeFactor, interval);
      
      return {
        ...currentData,
        interval: Math.max(Math.round(baseInterval * 1.3), 1),
        repetitions: newRepetitions,
        easeFactor: calculateEaseFactor(easeFactor, quality)
      };
    }
    
    return currentData;
  }
}

/**
 * 용이도 인수가 유효한 범위 내에 있는지 검증
 * 
 * @param easeFactor 검증할 용이도 인수
 * @returns 유효하면 true, 아니면 false
 */
export function isValidEaseFactor(easeFactor: number): boolean {
  return typeof easeFactor === 'number' && 
         easeFactor >= SM2_CONSTANTS.MIN_EASE_FACTOR &&
         !isNaN(easeFactor) &&
         isFinite(easeFactor);
}
