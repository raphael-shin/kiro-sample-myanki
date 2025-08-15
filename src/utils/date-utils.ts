/**
 * 날짜 관련 유틸리티 함수
 * 간격 반복 알고리즘에서 사용되는 날짜 계산 기능을 제공
 */

/**
 * 주어진 날짜에 일수를 더한 새로운 날짜를 반환합니다.
 * 
 * 이 함수는 원본 날짜 객체를 변경하지 않고 새로운 Date 객체를 반환합니다.
 * JavaScript의 Date.setDate() 메서드는 월/년 경계를 자동으로 처리합니다.
 * 
 * @param date 기준 날짜 (원본은 변경되지 않음)
 * @param days 더할 일수 (음수 가능, 0이면 같은 날짜 반환)
 * @returns 계산된 새로운 날짜 객체
 * 
 * @example
 * ```typescript
 * const today = new Date('2023-01-01');
 * const tomorrow = addDays(today, 1); // 2023-01-02
 * const yesterday = addDays(today, -1); // 2022-12-31
 * ```
 */
export function addDays(date: Date, days: number): Date {
  // 입력 검증
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  if (!Number.isInteger(days)) {
    throw new Error('Days must be an integer');
  }
  
  // 새로운 Date 객체 생성 (원본 보호)
  const result = new Date(date.getTime());
  
  // 일수 더하기 (JavaScript가 월/년 경계 자동 처리)
  result.setDate(result.getDate() + days);
  
  return result;
}

/**
 * 두 날짜 사이의 일수 차이를 계산합니다.
 * 
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns 일수 차이 (endDate가 더 늦으면 양수, 빠르면 음수)
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * 주어진 날짜가 오늘인지 확인합니다.
 * 
 * @param date 확인할 날짜
 * @returns 오늘이면 true, 아니면 false
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}

/**
 * 주어진 날짜가 오늘 이전인지 확인합니다.
 * 
 * @param date 확인할 날짜
 * @returns 오늘 이전이면 true, 아니면 false
 */
export function isBeforeToday(date: Date): boolean {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return dateStart.getTime() < todayStart.getTime();
}
