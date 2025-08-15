/**
 * SM-2 알고리즘 테스트
 * TDD 단계: 용이도 인수 계산, 간격 계산, SM2Algorithm 클래스 테스트
 */

import { calculateEaseFactor, calculateInterval, SM2Algorithm } from '@/algorithms/sm2-algorithm';
import { StudyQuality } from '@/types/flashcard';

describe('SM-2 알고리즘', () => {
  describe('calculateEaseFactor', () => {
    it('품질 점수 3(Good)일 때 용이도 인수가 감소해야 한다', () => {
      // Given: 현재 용이도 인수 2.5, 품질 점수 3
      const currentEF = 2.5;
      const quality = StudyQuality.GOOD;
      
      // When: 용이도 인수 계산
      const result = calculateEaseFactor(currentEF, quality);
      
      // Then: SM-2 공식에 따라 약간 감소해야 함
      expect(result).toBeCloseTo(2.36, 2);
    });

    it('품질 점수 4(Easy)일 때 용이도 인수가 유지되어야 한다', () => {
      // Given: 현재 용이도 인수 2.5, 품질 점수 4
      const currentEF = 2.5;
      const quality = StudyQuality.EASY;
      
      // When: 용이도 인수 계산
      const result = calculateEaseFactor(currentEF, quality);
      
      // Then: 용이도 인수가 유지되어야 함
      expect(result).toBeCloseTo(2.5, 2);
    });

    it('품질 점수 2(Hard)일 때 용이도 인수가 감소해야 한다', () => {
      // Given: 현재 용이도 인수 2.5, 품질 점수 2
      const currentEF = 2.5;
      const quality = StudyQuality.HARD;
      
      // When: 용이도 인수 계산
      const result = calculateEaseFactor(currentEF, quality);
      
      // Then: 용이도 인수가 감소해야 함
      expect(result).toBeLessThan(2.5);
    });

    it('품질 점수 1(Again)일 때 용이도 인수가 크게 감소해야 한다', () => {
      // Given: 현재 용이도 인수 2.5, 품질 점수 1
      const currentEF = 2.5;
      const quality = StudyQuality.AGAIN;
      
      // When: 용이도 인수 계산
      const result = calculateEaseFactor(currentEF, quality);
      
      // Then: 용이도 인수가 크게 감소해야 함
      expect(result).toBeLessThan(2.0);
    });

    it('용이도 인수가 최소값 1.3 아래로 내려가지 않아야 한다', () => {
      // Given: 낮은 용이도 인수 1.4, 품질 점수 1
      const currentEF = 1.4;
      const quality = StudyQuality.AGAIN;
      
      // When: 용이도 인수 계산
      const result = calculateEaseFactor(currentEF, quality);
      
      // Then: 최소값 1.3 이상이어야 함
      expect(result).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('calculateInterval', () => {
    it('첫 번째 복습(repetitions=0)일 때 간격이 1일이어야 한다', () => {
      // Given: 첫 번째 복습, 용이도 인수 2.5
      const repetitions = 0;
      const easeFactor = 2.5;
      
      // When: 간격 계산
      const result = calculateInterval(repetitions, easeFactor);
      
      // Then: 1일이어야 함
      expect(result).toBe(1);
    });

    it('두 번째 복습(repetitions=1)일 때 간격이 6일이어야 한다', () => {
      // Given: 두 번째 복습, 용이도 인수 2.5
      const repetitions = 1;
      const easeFactor = 2.5;
      
      // When: 간격 계산
      const result = calculateInterval(repetitions, easeFactor);
      
      // Then: 6일이어야 함
      expect(result).toBe(6);
    });

    it('세 번째 복습부터는 이전 간격에 용이도 인수를 곱해야 한다', () => {
      // Given: 세 번째 복습, 용이도 인수 2.5, 이전 간격 6
      const repetitions = 2;
      const easeFactor = 2.5;
      const previousInterval = 6;
      
      // When: 간격 계산
      const result = calculateInterval(repetitions, easeFactor, previousInterval);
      
      // Then: 6 * 2.5 = 15일이어야 함
      expect(result).toBe(15);
    });

    it('계산된 간격이 1일 미만일 때 1일로 설정되어야 한다', () => {
      // Given: 매우 낮은 용이도 인수와 작은 이전 간격
      const repetitions = 2;
      const easeFactor = 1.3;
      const previousInterval = 0.5;
      
      // When: 간격 계산
      const result = calculateInterval(repetitions, easeFactor, previousInterval);
      
      // Then: 최소 1일이어야 함
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('간격이 소수점일 때 정수로 반올림되어야 한다', () => {
      // Given: 소수점 결과가 나오는 계산
      const repetitions = 2;
      const easeFactor = 2.3;
      const previousInterval = 6;
      
      // When: 간격 계산
      const result = calculateInterval(repetitions, easeFactor, previousInterval);
      
      // Then: 정수여야 함
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBe(Math.round(6 * 2.3));
    });
  });

  describe('SM2Algorithm 클래스', () => {
    let algorithm: SM2Algorithm;

    beforeEach(() => {
      algorithm = new SM2Algorithm();
    });

    it('SM2Algorithm 클래스 인스턴스를 생성할 수 있어야 한다', () => {
      // When: SM2Algorithm 인스턴스 생성
      const algorithm = new SM2Algorithm();
      
      // Then: 인스턴스가 생성되어야 함
      expect(algorithm).toBeInstanceOf(SM2Algorithm);
    });

    it('calculateNextReview 메서드가 존재해야 한다', () => {
      // Given: SM2Algorithm 인스턴스
      const algorithm = new SM2Algorithm();
      
      // When & Then: calculateNextReview 메서드가 존재해야 함
      expect(typeof algorithm.calculateNextReview).toBe('function');
    });

    it('기본 생성자로 생성된 인스턴스가 정상 작동해야 한다', () => {
      // Given: 기본 생성자로 생성된 인스턴스
      const algorithm = new SM2Algorithm();
      
      // When & Then: 인스턴스가 정의되고 메서드가 존재해야 함
      expect(algorithm).toBeDefined();
      expect(algorithm.calculateNextReview).toBeDefined();
    });

    describe('품질 점수별 처리', () => {
      it('"Again" 품질 점수 처리 - 간격이 1분으로 설정되어야 한다', () => {
        // Given: 현재 데이터와 Again 품질 점수
        const currentData = {
          easeFactor: 2.5,
          interval: 15,
          repetitions: 3
        };
        
        // When: Again 품질로 다음 복습 계산
        const result = algorithm.calculateNextReview(currentData, StudyQuality.AGAIN);
        
        // Then: 간격이 1분(0.0007일)으로 설정되고 repetitions가 0으로 리셋
        expect(result.interval).toBeCloseTo(0.0007, 4); // 1분 = 1/1440일
        expect(result.repetitions).toBe(0);
      });

      it('"Hard" 품질 점수 처리 - 간격이 1.2배 증가해야 한다', () => {
        // Given: 현재 데이터와 Hard 품질 점수
        const currentData = {
          easeFactor: 2.5,
          interval: 10,
          repetitions: 2
        };
        
        // When: Hard 품질로 다음 복습 계산
        const result = algorithm.calculateNextReview(currentData, StudyQuality.HARD);
        
        // Then: 간격이 1.2배 증가하고 repetitions 유지
        expect(result.interval).toBeCloseTo(12, 1); // 10 * 1.2
        expect(result.repetitions).toBe(2);
      });

      it('"Good" 품질 점수 처리 - 용이도 인수 적용해야 한다', () => {
        // Given: 현재 데이터와 Good 품질 점수
        const currentData = {
          easeFactor: 2.5,
          interval: 6,
          repetitions: 1
        };
        
        // When: Good 품질로 다음 복습 계산
        const result = algorithm.calculateNextReview(currentData, StudyQuality.GOOD);
        
        // Then: 정상적인 SM-2 계산 적용
        expect(result.repetitions).toBe(2);
        expect(result.interval).toBe(15); // 6 * 2.5
      });

      it('"Easy" 품질 점수 처리 - 간격 1.3배 및 EF 증가해야 한다', () => {
        // Given: 현재 데이터와 Easy 품질 점수
        const currentData = {
          easeFactor: 2.5,
          interval: 10,
          repetitions: 2
        };
        
        // When: Easy 품질로 다음 복습 계산
        const result = algorithm.calculateNextReview(currentData, StudyQuality.EASY);
        
        // Then: 간격 1.3배 증가 및 EF 증가
        expect(result.interval).toBeCloseTo(13, 1); // 10 * 1.3
        expect(result.easeFactor).toBeGreaterThan(2.5);
      });
    });

    describe('최소 간격 제한', () => {
      it('계산된 간격이 1일 미만일 때 1일로 설정되어야 한다', () => {
        // Given: 매우 작은 간격이 계산되는 상황
        const currentData = {
          easeFactor: 1.3,
          interval: 0.5,
          repetitions: 2
        };
        
        // When: 다음 복습 계산
        const result = algorithm.calculateNextReview(currentData, StudyQuality.GOOD);
        
        // Then: 최소 1일로 설정되어야 함
        expect(result.interval).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
