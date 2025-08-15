/**
 * 날짜 유틸리티 함수 테스트
 * TDD Red 단계: addDays 함수가 정확한 날짜를 반환하는지 테스트
 */

import { addDays } from '@/utils/date-utils';

describe('날짜 유틸리티 함수', () => {
  describe('addDays', () => {
    it('양수 일수를 더할 수 있어야 한다', () => {
      // Given: 기준 날짜
      const baseDate = new Date('2023-01-01');
      
      // When: 5일을 더함
      const result = addDays(baseDate, 5);
      
      // Then: 2023-01-06이 되어야 함
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // 0-based
      expect(result.getDate()).toBe(6);
    });

    it('음수 일수를 빼서 과거 날짜를 계산할 수 있어야 한다', () => {
      // Given: 기준 날짜
      const baseDate = new Date('2023-01-10');
      
      // When: 3일을 뺌
      const result = addDays(baseDate, -3);
      
      // Then: 2023-01-07이 되어야 함
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(7);
    });

    it('월 경계를 넘나드는 계산이 정확해야 한다', () => {
      // Given: 1월 말일
      const baseDate = new Date('2023-01-30');
      
      // When: 5일을 더함
      const result = addDays(baseDate, 5);
      
      // Then: 2월 4일이 되어야 함
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it('년도 경계를 넘나드는 계산이 정확해야 한다', () => {
      // Given: 12월 말일
      const baseDate = new Date('2023-12-30');
      
      // When: 5일을 더함
      const result = addDays(baseDate, 5);
      
      // Then: 2024-01-04가 되어야 함
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(4);
    });

    it('윤년을 고려한 계산이 정확해야 한다', () => {
      // Given: 윤년 2월 말일
      const baseDate = new Date('2024-02-28');
      
      // When: 2일을 더함
      const result = addDays(baseDate, 2);
      
      // Then: 2024-03-01이 되어야 함 (2월 29일 고려)
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(1);
    });

    it('0일을 더하면 같은 날짜를 반환해야 한다', () => {
      // Given: 기준 날짜
      const baseDate = new Date('2023-06-15');
      
      // When: 0일을 더함
      const result = addDays(baseDate, 0);
      
      // Then: 같은 날짜여야 함
      expect(result.getTime()).toBe(baseDate.getTime());
    });

    it('원본 날짜 객체를 변경하지 않아야 한다', () => {
      // Given: 기준 날짜
      const baseDate = new Date('2023-01-01');
      const originalTime = baseDate.getTime();
      
      // When: 날짜를 더함
      addDays(baseDate, 10);
      
      // Then: 원본 날짜가 변경되지 않아야 함
      expect(baseDate.getTime()).toBe(originalTime);
    });
  });
});
