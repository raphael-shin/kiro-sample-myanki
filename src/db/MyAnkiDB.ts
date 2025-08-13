import Dexie, { Table } from 'dexie';
import { Setting, DATABASE_VERSION, DATABASE_NAME } from '../types/database';

export class MyAnkiDB extends Dexie {
  // 테이블 정의
  settings!: Table<Setting>;

  constructor() {
    super(DATABASE_NAME);
    
    // 스키마 정의
    this.version(DATABASE_VERSION).stores({
      settings: '++id, key, value, createdAt, updatedAt'
    });

    // 훅 설정 - 자동으로 타임스탬프 추가
    this.settings.hook('creating', function (_primKey, obj, _trans) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.settings.hook('updating', function (modifications, _primKey, _obj, _trans) {
      (modifications as any).updatedAt = new Date();
    });
  }
}

// 싱글톤 인스턴스 생성
export const db = new MyAnkiDB();