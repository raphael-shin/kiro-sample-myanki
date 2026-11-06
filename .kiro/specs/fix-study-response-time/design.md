# 설계: 학습 응답 시간(responseTime) 기록 버그 수정

## 개요

`responseTime`이 항상 0ms로 기록되는 버그를 두 지점에서 바로잡는다.

1. `StudyInterface.tsx`의 `handleAnswer`가 응답 시간을 **스토어의 `answerStartTime`(카드 앞면 표시 시각)을 기준으로** 계산하도록 한다.
2. `StudySessionStore`의 `startSession`이 첫 카드에 대해 `answerStartTime`을 설정하도록 한다.

최소 변경 원칙을 따른다. 일시정지 시간은 responseTime에서 차감하지 않는다(요구사항 3의 결정).

## 근본 원인 분석

### 지점 1: 같은 순간의 두 시계를 빼는 계산

`StudyInterface.tsx`(수정 전):

```ts
const responseTime = Date.now() - (new Date().getTime());
```

`Date.now()`와 `new Date().getTime()`은 동일 시점의 밀리초 타임스탬프를 돌려주므로 차이는 사실상 0이다. 이 식에는 "카드가 언제 표시되었는가"라는 기준점이 아예 없다. 결과적으로 사용자가 얼마나 오래 고민했든 responseTime은 0ms에 수렴한다.

### 지점 2: 첫 카드에 기준 시각 미설정

`StudySessionStore.ts`의 상태 전이를 보면 `answerStartTime`은 다음에서 갱신된다.

- `nextCard`: 다음 카드로 넘어갈 때 `answerStartTime: new Date()` 설정 — **정상**
- `endSession` / 카드 소진: `answerStartTime: null` — **정상**
- `startSession`: 첫 카드(`currentCard: firstCard`)를 세팅하면서 `answerStartTime`은 설정하지 않음 — **결함**

초기 상태값이 `answerStartTime: null`이므로, 지점 1을 고쳐 `answerStartTime` 기반 계산으로 바꾸더라도 세션의 첫 카드에서는 `answerStartTime === null`이 되어 방어적 기본값 0이 기록된다. 따라서 지점 1과 지점 2를 함께 고쳐야 버그가 완전히 사라진다.

## 아키텍처

관련 구성요소와 데이터 흐름:

```
사용자 입력(버튼/단축키)
        │
        ▼
StudyInterface.handleAnswer(quality)
   │  responseTime = now - answerStartTime
   │  (피드백 표시 → 1s 후)
   ▼
StudySessionStore.processAnswer(quality, responseTime)
   │        └─> submitAnswer: sessionStats.totalTime += responseTime
   │        └─> SpacedRepetitionService.processStudyResult(cardId, quality)
   ▼
StudySessionStore.nextCard()  ← answerStartTime = new Date()  (다음 카드 기준점 갱신)
```

`answerStartTime`의 생애주기:

```
startSession   → answerStartTime = new Date()   (첫 카드 기준점) [추가]
nextCard(有)    → answerStartTime = new Date()   (다음 카드 기준점) [기존]
nextCard(無)    → answerStartTime = null         (카드 소진)       [기존]
endSession     → answerStartTime = null                            [기존]
```

## 컴포넌트 및 변경 설계

### 1) `StudyInterface.tsx` — `handleAnswer`

- 스토어에서 `answerStartTime`을 구조 분해로 가져온다.
- 응답 시간 계산을 다음으로 교체한다.

```ts
// 카드 앞면이 표시된 시각부터 답을 고른 지금까지의 시간. 일시정지 시간도 포함한다
const responseTime = answerStartTime ? Date.now() - answerStartTime.getTime() : 0;
```

- `useCallback` 의존성 배열에 `answerStartTime`을 추가한다(최신 기준 시각을 클로저가 포착하도록).

설계 근거:
- `answerStartTime`이 `null`일 수 있는 경로(이론상 카드 없음 등)에 대비해 삼항으로 0을 기본값으로 둔다(요구사항 1.3).
- 일시정지 중에는 답변 버튼/단축키가 비활성(`disabled={isPaused}`, 단축키 핸들러의 `isPaused` 가드)이므로 일시정지 상태에서 답이 들어오지 않는다. 다만 "표시 → 일시정지 → 재개 → 답" 흐름에서는 일시정지 구간이 벽시계에 포함되며, 이는 요구사항 3의 결정대로 responseTime에 포함한다.

### 2) `StudySessionStore.ts` — `startSession`

- 첫 카드를 설정하는 `set({ ... })` 블록에 다음을 추가한다.

```ts
answerStartTime: new Date(),
```

설계 근거:
- `nextCard`와 동일한 의미(현재 표시 카드의 기준 시각)를 첫 카드에도 부여하여 상태 전이를 일관되게 만든다.

### 영향 범위

- `submitAnswer`가 `sessionStats.totalTime`에 responseTime을 누적하므로, 수정 후 totalTime이 실제 경과 시간을 반영한다.
- `getEstimatedTimeRemaining()`은 `totalTime / cardsStudied`로 평균을 내므로, 올바른 responseTime 덕분에 추정값이 의미를 갖게 된다.
- 외부 서비스 시그니처(`SpacedRepetitionService.processStudyResult(cardId, quality)`)는 responseTime을 받지 않으므로 변경 없음.

## 오류 처리

- `answerStartTime`이 `null`인 경우 responseTime은 0으로 기록한다(음수/NaN 방지).
- 기존 `processAnswer`의 try/catch 및 에러 상태 세팅은 그대로 둔다.

## 테스트 전략

TDD 원칙(AGENTS.md)에 따라 실패하는 테스트를 먼저 작성한 뒤 통과시킨다.

### 단위/컴포넌트 테스트 (`StudyInterface.test.tsx`)

1. **경과 시간 측정**: fake timers로 세션 시작 후 카드 앞면 표시 상태에서 3000ms 진행 → "답 보기" → 난이도 선택 → 피드백 1000ms 경과 → `processAnswer`가 약 3000ms의 responseTime으로 호출되는지 단언. (버그 상태에서는 0으로 호출되어 실패해야 한다.)
2. **첫 카드 기준점**: 세션의 첫 카드에서도 위 측정이 0이 아닌 값으로 기록되는지 단언(요구사항 2.1 회귀 방지).

구현 메모:
- Jest fake timers 사용 시 `Date`와 타이머를 함께 제어해야 하므로, 타이머 진행에 맞춰 시스템 시각도 진행되는 설정(`jest.useFakeTimers()` + `jest.advanceTimersByTime` / `jest.setSystemTime`)을 사용한다.
- 피드백 후 실제 `processAnswer` 호출은 1초 지연 `setTimeout` 안에서 일어나므로, responseTime은 "답 선택 시점"에 캡처된 값임에 유의한다(지연 1초는 responseTime에 포함되지 않는다).

### 스토어 테스트 (`StudySessionStore` 관련)

1. `startSession` 후 상태의 `answerStartTime`이 `null`이 아니라 `Date`임을 단언.
2. `nextCard` 후 `answerStartTime`이 갱신되고, 카드 소진 시 `null`이 되는 기존 동작이 유지되는지 단언.

### 기준선 비교

- 작업 전 `npm test`로 기준선(기존 실패 수)을 기록하고, 작업 후 새로운 실패가 없는지 확인한다. build/typecheck(`npm run build`, `npx tsc --noEmit`)는 통과를 유지해야 한다.

## 결정 및 트레이드오프

- **일시정지 시간 포함(채택)**: 구현이 가장 단순하고(벽시계 차이 하나로 계산), 코드 변경이 최소다. 단점은 사용자가 오래 일시정지하면 responseTime이 과대 계상된다는 점. 통계가 어림치 용도임을 고려하면 수용 가능하다.
- **일시정지 시간 차감(미채택)**: 더 정확하지만 일시정지/재개 타임스탬프 누적 로직과 추가 상태가 필요해 변경 범위가 커진다. 본 스펙 범위 밖으로 둔다.
