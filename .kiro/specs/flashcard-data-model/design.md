# Design Document

## Overview

MyAnki 플래시카드 애플리케이션의 핵심 데이터 모델과 CRUD 기능을 구현합니다. 이 설계는 Dexie.js를 활용한 IndexedDB 기반의 오프라인 우선 아키텍처를 채택하며, TypeScript를 통한 완전한 타입 안전성을 보장합니다. 서비스 레이어 패턴을 통해 비즈니스 로직을 캡슐화하고, TDD 접근 방식으로 견고한 코드를 구축합니다.

## Architecture

### 레이어드 아키텍처

```
┌─────────────────────────────────────┐
│           UI Components             │  ← 향후 구현
├─────────────────────────────────────┤
│          Service Layer              │  ← 이번 구현
│  ┌─────────────┬─────────────────┐   │
│  │ DeckService │ CardService     │   │
│  │             │ StudyService    │   │
│  └─────────────┴─────────────────┘   │
├─────────────────────────────────────┤
│         Data Access Layer           │  ← 이번 구현
│  ┌─────────────────────────────────┐ │
│  │        MyAnkiDB (Dexie)         │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│            IndexedDB                │
└─────────────────────────────────────┘
```

### 폴더 구조

```
src/
├── db/
│   ├── MyAnkiDB.ts              # 확장된 데이터베이스 스키마
│   └── migrations.ts            # 데이터베이스 마이그레이션
├── types/
│   ├── database.ts              # 확장된 데이터베이스 타입
│   └── flashcard.ts             # 플래시카드 관련 타입
├── services/
│   ├── DeckService.ts           # 덱 관리 서비스
│   ├── CardService.ts           # 카드 관리 서비스
│   ├── StudyService.ts          # 학습 기록 서비스
│   └── index.ts                 # 서비스 통합 export
├── utils/
│   ├── validation.ts            # 데이터 유효성 검사
│   └── dateUtils.ts             # 날짜 유틸리티
└── features/
    └── flashcard/               # 향후 UI 컴포넌트 위치
```

## Components and Interfaces

### 1. 데이터베이스 스키마 설계

**확장된 MyAnkiDB 클래스:**
```typescript
class MyAnkiDB extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card>;
  studySessions!: Table<StudySession>;
  settings!: Table<Setting>;

  constructor() {
    super(DATABASE_NAME);
    
    this.version(DATABASE_VERSION).stores({
      decks: '++id, name, createdAt, updatedAt',
      cards: '++id, deckId, front, back, createdAt, updatedAt',
      studySessions: '++id, cardId, studiedAt, quality, responseTime',
      settings: '++id, key, value, createdAt, updatedAt'
    });
  }
}
```

**인덱스 전략:**
- `decks`: 기본 키(id), 이름 검색용 인덱스
- `cards`: 기본 키(id), 덱별 조회용 deckId 인덱스
- `studySessions`: 기본 키(id), 카드별 조회용 cardId 인덱스, 날짜별 조회용 studiedAt 인덱스

### 2. 타입 시스템 설계

**핵심 데이터 타입:**
```typescript
// 덱 타입
interface Deck {
  id?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 카드 타입 (Basic 노트 타입만 지원)
interface Card {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 학습 세션 타입
interface StudySession {
  id?: number;
  cardId: number;
  studiedAt: Date;
  quality: StudyQuality; // 1-5 점수
  responseTime: number; // 밀리초
}

// 학습 품질 열거형
enum StudyQuality {
  AGAIN = 1,    // 다시
  HARD = 2,     // 어려움
  GOOD = 3,     // 보통
  EASY = 4      // 쉬움
}
```

**서비스 인터페이스:**
```typescript
interface CRUDService<T> {
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>;
  getById(id: number): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  update(id: number, updates: Partial<T>): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### 3. 서비스 레이어 설계

**DeckService 클래스:**
```typescript
class DeckService implements CRUDService<Deck> {
  // 기본 CRUD 작업
  async create(deck: CreateDeckInput): Promise<number>
  async getById(id: number): Promise<Deck | undefined>
  async getAll(): Promise<Deck[]>
  async update(id: number, updates: UpdateDeckInput): Promise<void>
  async delete(id: number): Promise<void>
  
  // 비즈니스 로직
  async getDeckWithStats(id: number): Promise<DeckWithStats>
  async searchDecks(query: string): Promise<Deck[]>
}
```

**CardService 클래스:**
```typescript
class CardService implements CRUDService<Card> {
  // 기본 CRUD 작업
  async create(card: CreateCardInput): Promise<number>
  async getById(id: number): Promise<Card | undefined>
  async getAll(): Promise<Card[]>
  async update(id: number, updates: UpdateCardInput): Promise<void>
  async delete(id: number): Promise<void>
  
  // 비즈니스 로직
  async getCardsByDeck(deckId: number): Promise<Card[]>
  async getCardsForStudy(deckId: number): Promise<Card[]>
  async searchCards(deckId: number, query: string): Promise<Card[]>
}
```

**StudyService 클래스:**
```typescript
class StudyService implements CRUDService<StudySession> {
  // 기본 CRUD 작업
  async create(session: CreateStudySessionInput): Promise<number>
  async getById(id: number): Promise<StudySession | undefined>
  async getAll(): Promise<StudySession[]>
  async update(id: number, updates: UpdateStudySessionInput): Promise<void>
  async delete(id: number): Promise<void>
  
  // 비즈니스 로직
  async getStudyHistory(cardId: number): Promise<StudySession[]>
  async getStudyStats(cardId: number): Promise<StudyStats>
  async recordStudySession(cardId: number, quality: StudyQuality, responseTime: number): Promise<void>
}
```

## Data Models

### 1. 데이터베이스 관계

```
Deck (1) ──────── (N) Card (1) ──────── (N) StudySession
  │                      │                       │
  ├─ id (PK)            ├─ id (PK)              ├─ id (PK)
  ├─ name               ├─ deckId (FK)          ├─ cardId (FK)
  ├─ description        ├─ front                ├─ studiedAt
  ├─ createdAt          ├─ back                 ├─ quality
  └─ updatedAt          ├─ createdAt            └─ responseTime
                        └─ updatedAt
```

### 2. 유효성 검사 규칙

**Deck 유효성 검사:**
- name: 필수, 1-100자, 중복 불가
- description: 선택, 최대 500자

**Card 유효성 검사:**
- deckId: 필수, 존재하는 덱 ID
- front: 필수, 1-1000자
- back: 필수, 1-1000자

**StudySession 유효성 검사:**
- cardId: 필수, 존재하는 카드 ID
- quality: 필수, 1-4 범위
- responseTime: 필수, 양수

### 3. 데이터 통계 모델

```typescript
interface DeckStats {
  totalCards: number;
  studiedCards: number;
  averageQuality: number;
  lastStudiedAt?: Date;
}

interface StudyStats {
  totalSessions: number;
  averageQuality: number;
  averageResponseTime: number;
  lastStudiedAt?: Date;
  studyStreak: number;
}
```

## Error Handling

### 1. 에러 타입 정의

```typescript
enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION'
}

class MyAnkiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}
```

### 2. 에러 처리 전략

**서비스 레이어 에러 처리:**
- 유효성 검사 실패 → ValidationError
- 데이터 없음 → NotFoundError
- 데이터베이스 오류 → DatabaseError
- 제약 조건 위반 → ConstraintViolationError

**트랜잭션 관리:**
- 연관 데이터 삭제 시 트랜잭션 사용
- 롤백 메커니즘 구현
- 데이터 무결성 보장

## Testing Strategy

### 1. 단위 테스트

**데이터베이스 테스트:**
- 각 테이블의 CRUD 작업 테스트
- 인덱스 성능 테스트
- 제약 조건 테스트

**서비스 테스트:**
- 각 서비스 메서드의 정상 동작 테스트
- 에러 케이스 테스트
- 비즈니스 로직 테스트

### 2. 통합 테스트

**데이터베이스 통합 테스트:**
- 실제 IndexedDB 환경에서 테스트
- 트랜잭션 동작 테스트
- 성능 테스트

**서비스 통합 테스트:**
- 서비스 간 상호작용 테스트
- 복잡한 쿼리 테스트
- 데이터 일관성 테스트

### 3. 테스트 환경 설정

**Mock 전략:**
- fake-indexeddb를 사용한 테스트 환경
- 각 테스트마다 깨끗한 데이터베이스 상태
- 테스트 데이터 팩토리 패턴 사용

**테스트 유틸리티:**
```typescript
// 테스트 데이터 생성 헬퍼
class TestDataFactory {
  static createDeck(overrides?: Partial<Deck>): Deck
  static createCard(deckId: number, overrides?: Partial<Card>): Card
  static createStudySession(cardId: number, overrides?: Partial<StudySession>): StudySession
}
```

## Implementation Considerations

### 1. 성능 최적화

**인덱스 전략:**
- 자주 조회되는 필드에 인덱스 설정
- 복합 인덱스 활용 (deckId + createdAt)
- 불필요한 인덱스 제거

**쿼리 최적화:**
- 페이지네이션 지원
- 지연 로딩 구현
- 배치 작업 최적화

### 2. 확장성 고려사항

**스키마 버전 관리:**
- 마이그레이션 스크립트 준비
- 하위 호환성 보장
- 점진적 업그레이드 지원

**모듈화:**
- 서비스별 독립적 구현
- 의존성 주입 패턴 적용
- 인터페이스 기반 설계

### 3. 타입 안전성

**엄격한 타입 검사:**
- 모든 데이터베이스 작업에 타입 적용
- 런타임 유효성 검사와 타입 검사 결합
- 제네릭을 활용한 재사용 가능한 코드

**타입 가드 활용:**
```typescript
function isDeck(obj: any): obj is Deck {
  return obj && typeof obj.name === 'string';
}
```