/**
 * 데이터베이스 공통 유틸리티 함수
 */

import { MyAnkiDB } from '@/db/MyAnkiDB';

/**
 * 데이터베이스 연결 상태 확인
 */
export function isDatabaseOpen(db: MyAnkiDB): boolean {
  return db.isOpen();
}

/**
 * 안전한 데이터베이스 종료
 */
export async function safeCloseDatabase(db: MyAnkiDB): Promise<void> {
  try {
    if (db.isOpen()) {
      await db.close();
    }
  } catch (error) {
    console.warn('Database close warning:', error);
  }
}

/**
 * 데이터베이스 초기화 및 연결
 */
export async function initializeDatabase(): Promise<MyAnkiDB> {
  const db = new MyAnkiDB();
  await db.open();
  return db;
}

/**
 * 트랜잭션 헬퍼 함수
 */
export async function withTransaction<T>(
  db: MyAnkiDB,
  tables: any[],
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return await db.transaction('rw', tables, callback);
}
