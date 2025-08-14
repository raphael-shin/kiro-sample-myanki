/**
 * MyAnkiDB Mock
 * 테스트에서 사용할 MyAnkiDB 모킹
 */

import { MockTable } from './dexie';

export class MyAnkiDB {
  // 테이블 인스턴스들
  decks = new MockTable();
  cards = new MockTable();
  studySessions = new MockTable();
  settings = new MockTable();

  // Dexie 메서드들
  version = jest.fn().mockReturnThis();
  stores = jest.fn().mockReturnThis();
  open = jest.fn();
  close = jest.fn();
  delete = jest.fn();
  isOpen = jest.fn().mockReturnValue(true);
  hasBeenClosed = jest.fn().mockReturnValue(false);
  hasFailed = jest.fn().mockReturnValue(false);
  dynamicallyOpened = jest.fn().mockReturnValue(false);
  transaction = jest.fn().mockImplementation(async (mode, tables, callback) => {
    // 트랜잭션 객체를 생성하여 콜백에 전달
    const tx = {
      decks: this.decks,
      cards: this.cards,
      studySessions: this.studySessions,
      settings: this.settings
    };
    return await callback(tx);
  });

  constructor() {
    // 생성자에서 테이블들을 초기화
    this.decks = new MockTable();
    this.cards = new MockTable();
    this.studySessions = new MockTable();
    this.settings = new MockTable();
  }
}