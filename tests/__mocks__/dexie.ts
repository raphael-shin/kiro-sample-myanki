/**
 * Dexie 모킹
 * Jest 테스트에서 Dexie ESM 모듈 문제를 해결하기 위한 모킹
 */

export class MockTable {
  add = jest.fn();
  get = jest.fn();
  put = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  where = jest.fn().mockReturnThis();
  equals = jest.fn().mockReturnThis();
  anyOf = jest.fn().mockReturnThis();
  and = jest.fn().mockReturnThis();
  count = jest.fn();
  toArray = jest.fn();
  first = jest.fn();
  orderBy = jest.fn().mockReturnThis();
  reverse = jest.fn().mockReturnThis();
  limit = jest.fn().mockReturnThis();
  offset = jest.fn().mockReturnThis();
  filter = jest.fn().mockReturnThis();
  each = jest.fn();
  modify = jest.fn();
  clear = jest.fn();
  bulkAdd = jest.fn();
  bulkPut = jest.fn();
  bulkDelete = jest.fn();
  hook = jest.fn().mockReturnThis();
}

export class MockDexie {
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
    return await callback();
  });
  
  // 테이블 인스턴스들
  decks = new MockTable();
  cards = new MockTable();
  studySessions = new MockTable();
  settings = new MockTable();

  constructor() {
    // 생성자에서 테이블들을 초기화
    this.decks = new MockTable();
    this.cards = new MockTable();
    this.studySessions = new MockTable();
    this.settings = new MockTable();
  }
}

// 기본 export
export default MockDexie;

// named export
export { MockDexie as Dexie };

// Table export
export { MockTable as Table };