# Design Document

## Overview

MyAnki 애플리케이션의 덱 관리 및 학습 시스템을 구현합니다. 이 시스템은 기존의 데이터 모델과 서비스 레이어를 기반으로 사용자 인터페이스, 간격 반복 알고리즘, 그리고 학습 세션 관리 기능을 통합합니다. React 18+ 기반의 컴포넌트 아키텍처와 Zustand를 활용한 상태 관리를 통해 반응형이고 직관적인 사용자 경험을 제공합니다.

## Architecture

### 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                             │
│  ┌─────────────┬─────────────┬─────────────────────────┐ │
│  │ DeckManager │ CardEditor  │ StudySession            │ │
│  │ Component   │ Component   │ Component               │ │
│  └─────────────┴─────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  State Layer                            │
│  ┌─────────────┬─────────────┬─────────────────────────┐ │
│  │ DeckStore   │ StudyStore  │ SpacedRepetition        │ │
│  │ (Zustand)   │ (Zustand)   │ Engine                  │ │
│  └─────────────┴─────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                 Service Layer                           │
│  ┌─────────────┬─────────────┬─────────────────────────┐ │
│  │ DeckService │ CardService │ StudyService            │ │
│  │             │             │ (기존 구현)              │ │
│  └─────────────┴─────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                Data Access Layer                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              MyAnkiDB (Dexie)                       │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 폴더 구조 확장

```
src/
├── features/
│   └── flashcard/
│       ├── components/
│       │   ├── DeckManager/
│       │   │   ├── DeckList.tsx
│       │   │   ├── DeckCard.tsx
│       │   │   ├── CreateDeckModal.tsx
│       │   │   └── EditDeckModal.tsx
│       │   ├── CardEditor/
│       │   │   ├── CardList.tsx
│       │   │   ├── CardForm.tsx
│       │   │   └── CardPreview.tsx
│       │   ├── StudySession/
│       │   │   ├── StudyInterface.tsx
│       │   │   ├── CardDisplay.tsx
│       │   │   ├── AnswerButtons.tsx
│       │   │   └── StudyProgress.tsx
│       │   └── Statistics/
│       │       ├── DeckStats.tsx
│       │       ├── StudyChart.tsx
│       │       └── ProgressTracker.tsx
│       ├── hooks/
│       │   ├── useDeckManager.ts
│       │   ├── useCardEditor.ts
│       │   ├── useStudySession.ts
│       │   └── useSpacedRepetition.ts
│       └── store/
│           ├── deckStore.ts
│           ├── studyStore.ts
│           └── spacedRepetitionEngine.ts
├── algorithms/
│   └── spacedRepetition/
│       ├── SM2Algorithm.ts
│       ├── types.ts
│       └── utils.ts
└── utils/
    ├── dateUtils.ts
    └── studyUtils.ts
```

## Components and Interfaces

### 1. 간격 반복 알고리즘 엔진

**SM-2 알고리즘 구현:**
```typescript
interface SpacedRepetitionCard {
  id: number;
  easeFactor: number;      // 용이도 인수 (기본값: 2.5)
  interval: number;        // 다음 복습까지의 간격 (일)
  repetitions: number;     // 연속 성공 횟수
  nextReviewDate: Date;    // 다음 복습 날짜
  lastReviewDate?: Date;   // 마지막 복습 날짜
}

class SM2Algorithm {
  /**
   * SM-2 알고리즘을 사용하여 다음 복습 일정 계산
   * @param card 현재 카드 상태
   * @param quality 답변 품질 (1-4)
   * @returns 업데이트된 카드 상태
   */
  calculateNextReview(card: SpacedRepetitionCard, quality: StudyQuality): SpacedRepetitionCard {
    let { easeFactor, interval, repetitions } = card;
    
    if (quality >= StudyQuality.GOOD) {
      // 정답인 경우
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // 오답인 경우
      repetitions = 0;
      interval = 1;
    }
    
    // 용이도 인수 업데이트
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    
    return {
      ...card,
      easeFactor,
      interval,
      repetitions,
      nextReviewDate,
      lastReviewDate: new Date()
    };
  }
}
```

### 2. 상태 관리 설계

**DeckStore (Zustand):**
```typescript
interface DeckState {
  // 상태
  decks: Deck[];
  currentDeck: Deck | null;
  deckStats: Record<number, DeckStats>;
  loading: boolean;
  error: string | null;
  
  // 액션
  loadDecks: () => Promise<void>;
  createDeck: (deck: CreateDeckInput) => Promise<void>;
  updateDeck: (id: number, updates: UpdateDeckInput) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
  selectDeck: (deck: Deck) => void;
  loadDeckStats: (deckId: number) => Promise<void>;
  searchDecks: (query: string) => Promise<void>;
}
```

**StudyStore (Zustand):**
```typescript
interface StudyState {
  // 상태
  currentSession: StudySessionData | null;
  studyQueue: Card[];
  currentCardIndex: number;
  sessionStats: SessionStats;
  spacedRepetitionCards: Record<number, SpacedRepetitionCard>;
  
  // 액션
  startStudySession: (deckId: number) => Promise<void>;
  submitAnswer: (quality: StudyQuality, responseTime: number) => Promise<void>;
  skipCard: () => void;
  endSession: () => Promise<void>;
  loadSpacedRepetitionData: (cardIds: number[]) => Promise<void>;
  getCardsForToday: (deckId: number) => Promise<Card[]>;
}

interface StudySessionData {
  deckId: number;
  startTime: Date;
  totalCards: number;
  completedCards: number;
  correctAnswers: number;
}

interface SessionStats {
  totalTime: number;
  averageResponseTime: number;
  accuracy: number;
  cardsStudied: number;
}
```

### 3. 핵심 컴포넌트 설계

**DeckManager 컴포넌트:**
```typescript
interface DeckManagerProps {
  onDeckSelect?: (deck: Deck) => void;
}

const DeckManager: React.FC<DeckManagerProps> = ({ onDeckSelect }) => {
  const { decks, loading, createDeck, deleteDeck, searchDecks } = useDeckManager();
  
  return (
    <div className="deck-manager">
      <DeckList 
        decks={decks}
        loading={loading}
        onDeckSelect={onDeckSelect}
        onDeckDelete={deleteDeck}
      />
      <CreateDeckModal onCreateDeck={createDeck} />
    </div>
  );
};
```

**StudySession 컴포넌트:**
```typescript
interface StudySessionProps {
  deckId: number;
  onSessionComplete?: (stats: SessionStats) => void;
}

const StudySession: React.FC<StudySessionProps> = ({ deckId, onSessionComplete }) => {
  const { 
    currentSession, 
    studyQueue, 
    currentCardIndex, 
    submitAnswer, 
    endSession 
  } = useStudySession(deckId);
  
  if (!currentSession || studyQueue.length === 0) {
    return <div>오늘 학습할 카드가 없습니다.</div>;
  }
  
  const currentCard = studyQueue[currentCardIndex];
  
  return (
    <div className="study-session">
      <StudyProgress 
        current={currentCardIndex + 1} 
        total={studyQueue.length} 
      />
      <CardDisplay card={currentCard} />
      <AnswerButtons onAnswer={submitAnswer} />
    </div>
  );
};
```

### 4. 커스텀 훅 설계

**useSpacedRepetition 훅:**
```typescript
const useSpacedRepetition = () => {
  const algorithm = useMemo(() => new SM2Algorithm(), []);
  
  const calculateNextReview = useCallback((
    cardId: number, 
    quality: StudyQuality
  ) => {
    // 간격 반복 계산 로직
  }, [algorithm]);
  
  const getCardsForToday = useCallback(async (deckId: number) => {
    // 오늘 학습할 카드 조회 로직
  }, []);
  
  return {
    calculateNextReview,
    getCardsForToday
  };
};
```

## Data Models

### 1. 확장된 데이터 모델

**SpacedRepetitionData 테이블 추가:**
```typescript
interface SpacedRepetitionData {
  id?: number;
  cardId: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**데이터베이스 스키마 업데이트:**
```typescript
// MyAnkiDB 클래스에 추가
this.version(3).stores({
  // 기존 테이블들...
  spacedRepetitionData: '++id, cardId, nextReviewDate, lastReviewDate'
});
```

### 2. 뷰 모델 정의

```typescript
interface DeckCardViewModel {
  deck: Deck;
  stats: DeckStats;
  cardsToStudy: number;
  lastStudied?: Date;
}

interface StudyCardViewModel {
  card: Card;
  spacedRepetitionData: SpacedRepetitionData;
  isNew: boolean;
  daysSinceLastReview: number;
}
```

## Error Handling

### 1. 학습 세션 에러 처리

```typescript
enum StudyErrorCode {
  NO_CARDS_TO_STUDY = 'NO_CARDS_TO_STUDY',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_QUALITY_SCORE = 'INVALID_QUALITY_SCORE',
  ALGORITHM_ERROR = 'ALGORITHM_ERROR'
}

class StudySessionError extends MyAnkiError {
  constructor(code: StudyErrorCode, message: string, details?: any) {
    super(code, message, details);
  }
}
```

### 2. 에러 복구 전략

**네트워크 오류 처리:**
- 오프라인 상태에서도 학습 세션 계속 진행
- 로컬 스토리지에 임시 저장 후 온라인 시 동기화

**데이터 무결성 보장:**
- 학습 세션 중 브라우저 종료 시 진행 상황 복구
- 트랜잭션을 통한 원자적 업데이트

## Testing Strategy

### 1. 간격 반복 알고리즘 테스트

```typescript
describe('SM2Algorithm', () => {
  it('should calculate correct intervals for different quality scores', () => {
    const algorithm = new SM2Algorithm();
    const card: SpacedRepetitionCard = {
      id: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date()
    };
    
    // Quality 4 (Easy) 테스트
    const result = algorithm.calculateNextReview(card, StudyQuality.EASY);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });
});
```

### 2. 컴포넌트 통합 테스트

```typescript
describe('StudySession Integration', () => {
  it('should complete a full study session workflow', async () => {
    const { user } = renderWithProviders(<StudySession deckId={1} />);
    
    // 카드 표시 확인
    expect(screen.getByText('앞면 내용')).toBeInTheDocument();
    
    // 답안 보기 클릭
    await user.click(screen.getByText('답안 보기'));
    
    // 평가 버튼 표시 확인
    expect(screen.getByText('Again')).toBeInTheDocument();
    
    // Good 평가 선택
    await user.click(screen.getByText('Good'));
    
    // 다음 카드로 진행 확인
    // ...
  });
});
```

### 3. 성능 테스트

**대용량 데이터 테스트:**
- 10,000개 카드가 있는 덱에서의 성능 측정
- 간격 반복 계산 성능 벤치마크
- 메모리 사용량 모니터링

## Implementation Considerations

### 1. 성능 최적화

**가상화 구현:**
- 대량의 카드 목록을 위한 가상 스크롤링
- React.memo를 활용한 불필요한 리렌더링 방지

**지연 로딩:**
- 덱 통계 정보의 지연 로딩
- 이미지가 포함된 카드의 지연 로딩

### 2. 사용자 경험 개선

**오프라인 지원:**
- 학습 세션 중 네트워크 연결 끊김 대응
- 오프라인 상태 표시 및 안내

**접근성:**
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 고대비 모드 지원

### 3. 확장성 고려사항

**알고리즘 확장:**
- 다른 간격 반복 알고리즘 (Anki, SuperMemo) 지원 준비
- 개인화된 학습 패턴 분석

**다국어 지원:**
- i18n 라이브러리 통합 준비
- RTL 언어 지원 고려

### 4. 보안 고려사항

**데이터 보호:**
- 민감한 학습 데이터의 로컬 암호화
- 사용자 개인정보 최소화 원칙 적용

**입력 검증:**
- XSS 공격 방지를 위한 사용자 입력 검증
- HTML 콘텐츠 sanitization