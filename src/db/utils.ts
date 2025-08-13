import { db } from './MyAnkiDB';
import { Setting } from '../types/database';

/**
 * 데이터베이스 초기화 함수
 * 앱 시작 시 호출하여 데이터베이스 연결을 확인하고 기본 설정을 생성합니다.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // 데이터베이스 연결 테스트
    await db.open();
    console.log('MyAnki 데이터베이스 연결 성공');

    // 기본 설정 초기화
    await initializeDefaultSettings();
    
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw new Error('데이터베이스 초기화에 실패했습니다.');
  }
}

/**
 * 기본 설정값들을 데이터베이스에 추가합니다.
 */
async function initializeDefaultSettings(): Promise<void> {
  const defaultSettings: Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { key: 'theme', value: 'light' },
    { key: 'language', value: 'ko' },
    { key: 'dailyGoal', value: 20 },
    { key: 'reviewInterval', value: 1 },
    { key: 'soundEnabled', value: true }
  ];

  for (const setting of defaultSettings) {
    // 이미 존재하는 설정은 건너뛰기
    const existingSetting = await db.settings.where('key').equals(setting.key).first();
    if (!existingSetting) {
      await db.settings.add(setting);
    }
  }
}

/**
 * 데이터베이스 연결 상태를 확인합니다.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.settings.limit(1).toArray();
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 확인 실패:', error);
    return false;
  }
}

/**
 * 데이터베이스를 닫습니다.
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await db.close();
    console.log('데이터베이스 연결이 종료되었습니다.');
  } catch (error) {
    console.error('데이터베이스 연결 종료 실패:', error);
  }
}

/**
 * 데이터베이스 상태 정보를 반환합니다.
 */
export async function getDatabaseInfo(): Promise<{
  name: string;
  version: number;
  isOpen: boolean;
  settingsCount: number;
}> {
  const settingsCount = await db.settings.count();
  
  return {
    name: db.name,
    version: db.verno,
    isOpen: db.isOpen(),
    settingsCount
  };
}