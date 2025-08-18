import { db } from '@/db/MyAnkiDB';

/**
 * 모든 데이터베이스 테이블을 초기화합니다.
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('데이터베이스 초기화 시작...');
    
    // 데이터베이스 완전 삭제 후 재생성
    await db.delete();
    await db.open();
    
    console.log('데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw error;
  }
};

// 개발 환경에서만 전역으로 노출
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).resetDatabase = resetDatabase;
}
