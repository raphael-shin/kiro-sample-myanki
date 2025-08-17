/**
 * Database Mock for integration tests
 * 통합 테스트에서 실제 db 인스턴스 대신 사용할 Mock
 */

import { MyAnkiDB } from './MyAnkiDB';

// db 인스턴스를 Mock으로 대체
export const db = new MyAnkiDB();
