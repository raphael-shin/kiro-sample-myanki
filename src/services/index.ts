/**
 * 서비스 레이어 통합 export
 * 모든 서비스 인터페이스와 구현체를 중앙에서 관리
 */

import { MyAnkiDB } from '@/db/MyAnkiDB';

// 인터페이스 export
export * from './interfaces';

// 서비스 클래스 export
export { DeckService } from './DeckService';
export { CardService } from './CardService';
export { StudyService } from './StudyService';

/**
 * 서비스 팩토리 함수
 * 데이터베이스 인스턴스를 받아 모든 서비스를 생성
 */
export function createServices(db: MyAnkiDB) {
  const deckService = new (require('./DeckService').DeckService)(db);
  const cardService = new (require('./CardService').CardService)(db);
  const studyService = new (require('./StudyService').StudyService)(db);

  return {
    deckService,
    cardService,
    studyService
  };
}

/**
 * 서비스 컨테이너 타입
 */
export interface ServiceContainer {
  deckService: InstanceType<typeof import('./DeckService').DeckService>;
  cardService: InstanceType<typeof import('./CardService').CardService>;
  studyService: InstanceType<typeof import('./StudyService').StudyService>;
}

/**
 * 기본 데이터베이스 인스턴스로 서비스 생성
 */
export async function createDefaultServices(): Promise<ServiceContainer> {
  const db = new MyAnkiDB();
  await db.open();
  return createServices(db);
}