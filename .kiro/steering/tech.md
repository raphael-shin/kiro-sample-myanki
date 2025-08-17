# 기술 스택

## 핵심 기술

- **프론트엔드 프레임워크**: React 18+ (TypeScript 포함)
- **빌드 도구**: Vite 4+ (빠른 컴파일을 위한 SWC 사용)
- **스타일링**: Tailwind CSS (커스텀 디자인 시스템 포함)
- **상태 관리**: Zustand (전역 상태 관리)
- **데이터베이스**: Dexie.js (IndexedDB 래퍼, 오프라인 데이터 영속성)
- **테스팅**: Jest + React Testing Library + fake-indexeddb

## 개발 도구

- **패키지 관리자**: npm
- **린팅**: ESLint (TypeScript 규칙 포함)
- **타입 검사**: TypeScript 5+ (엄격 모드)
- **CSS 처리**: PostCSS (Autoprefixer 포함)

## 주요 라이브러리

- **UI 유틸리티**: clsx + tailwind-merge (클래스 관리)
- **테스팅 유틸리티**: fake-indexeddb (데이터베이스 테스팅)
- **개발**: Vite 플러그인 (React 및 SWC용)

## 구현된 아키텍처

### 알고리즘 레이어
- **SM-2 간격 반복 알고리즘**: 과학적 학습 최적화 (`src/algorithms/spaced-repetition/SM2Algorithm.ts`)
- **날짜 유틸리티**: 복습 스케줄링 계산 (`src/utils/date-utils.ts`)
- **용이도 인수 관리**: 개인화된 학습 패턴
- **알고리즘 상수**: 최소 간격 및 기본값 관리 (`src/algorithms/spaced-repetition/constants.ts`)

### 서비스 레이어
- **DeckService**: 덱 CRUD 작업 및 관련 카드 관리
- **CardService**: 카드 생성, 수정, 삭제 및 유효성 검사
- **StudyService**: 학습 세션 관리 및 진행률 추적
- **SpacedRepetitionService**: SM-2 알고리즘 통합 및 복습 스케줄링
- **StatisticsService**: 학습 통계 계산 및 분석
- **SessionManager**: 학습 세션 생명주기 관리
- **OfflineStatisticsService**: 오프라인 통계 계산
- **OfflineSyncService**: 오프라인 작업 큐 관리

### 상태 관리
- **DeckStore**: 덱 관리 상태 (Zustand) - 덱 목록, 선택, CRUD 작업
- **StudySessionStore**: 학습 세션 상태 (Zustand) - 현재 카드, 진행률, 답변 처리
- **StatisticsStore**: 통계 데이터 상태 관리
- **appStore**: 애플리케이션 전역 상태 (테마, 로딩, 네트워크 상태)

### 컴포넌트 아키텍처
- **Feature-based 구조**: flashcard 기능별 컴포넌트 그룹화
- **UI 컴포넌트**: 재사용 가능한 기본 컴포넌트 (Button, Card, Input)
- **공통 컴포넌트**: 앱 전체에서 사용되는 컴포넌트 (ThemeToggle, LoadingSpinner, OfflineIndicator)
- **모달 시스템**: 덱 생성 및 편집 모달 (CreateDeckModal)
- **덱 관리**: DeckManagerPage, DeckList, DeckCard
- **카드 편집**: CardEditorPage, CardTable, CreateCardModal
  - 인라인 편집 시스템
  - 실시간 검색 및 필터링
  - 배치 작업 지원
  - 키보드 단축키 통합
- **학습 세션**: StudyInterface, CardDisplay, AnswerButtons, StudyProgress
- **통계**: StatsDashboard, DeckStats, ProgressTracker, StudyHistory, GoalTracker

### 데이터베이스 레이어
- **MyAnkiDB**: Dexie.js 기반 IndexedDB 래퍼
- **테이블 구조**: settings, decks, cards, studySessions, spacedRepetitionData, offlineQueue
- **자동 타임스탬프**: 생성/수정 시간 자동 관리
- **트랜잭션 지원**: 복합 작업의 원자성 보장

## 일반적인 명령어

### 개발
```bash
npm run dev          # 개발 서버 시작 (포트 5173)
npm run build        # 프로덕션 빌드
npm run preview      # 프로덕션 빌드 미리보기
```

### 테스팅
```bash
npm test             # 모든 테스트 실행 (Jest)
npm run test:watch   # 테스트를 감시 모드로 실행
```

### 코드 품질
```bash
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 문제 자동 수정
```

## 빌드 구성

- **타겟**: ES2020 (최신 브라우저 지원)
- **모듈 시스템**: ESNext (번들러 해석 포함)
- **JSX**: react-jsx (React import 불필요)
- **소스 맵**: 디버깅을 위해 활성화됨
- **코드 분할**: React, Zustand, Dexie용 벤더 청크

## 경로 별칭

프로젝트는 @ 접두사를 사용한 절대 경로 가져오기를 사용합니다:
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/features/*` → `src/features/*`
- `@/algorithms/*` → `src/algorithms/*`
- `@/services/*` → `src/services/*`
- `@/hooks/*` → `src/hooks/*`
- `@/store/*` → `src/store/*`
- `@/db/*` → `src/db/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`

## 테스트 전략

### 테스트 도구
- **Jest**: 테스트 러너 및 assertion 라이브러리
- **React Testing Library**: 컴포넌트 테스팅
- **fake-indexeddb**: IndexedDB 모킹
- **userEvent**: 사용자 상호작용 시뮬레이션

### 테스트 커버리지
- **단위 테스트**: 개별 컴포넌트 및 함수
- **통합 테스트**: 전체 워크플로우 및 에러 처리
- **서비스 테스트**: 비즈니스 로직 및 데이터베이스 통합
- **알고리즘 테스트**: SM-2 알고리즘 검증

### 성능 최적화
- **Vite HMR**: 개발 중 빠른 리로드
- **코드 분할**: 필요한 코드만 로드
- **React 18 최적화**: Concurrent Features 활용
- **Zustand**: 최소한의 리렌더링