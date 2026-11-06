# Design: 응답 시간 기록 수정

## 근본 원인

응답 시간은 "카드가 표시된 시각"과 "답을 고른 시각"의 차이다. 코드에는 이미 표시 시각을 담을 상태 `answerStartTime: Date | null`이 있고, `nextCard`는 다음 카드로 넘어갈 때 이를 `new Date()`로 갱신한다. 하지만 두 지점이 어긋나 있다.

1. `StudyInterface.handleAnswer`는 `answerStartTime`을 쓰지 않고 `Date.now() - new Date().getTime()`을 계산한다. 두 값이 같은 순간이라 결과는 항상 0ms 안팎이다.
2. `StudySessionStore.startSession`은 첫 카드를 띄우면서 `answerStartTime`을 설정하지 않는다. 그래서 첫 카드는 기준 시각이 없다.

## 데이터 흐름

```
startSession → currentCard 설정 + answerStartTime = now   (이번에 추가)
   ↓ (사용자가 답을 봄)
handleAnswer → responseTime = now - answerStartTime         (이번에 수정)
   ↓
processAnswer(quality, responseTime) → submitAnswer → sessionStats.totalTime 누적
   ↓
nextCard → 다음 카드 + answerStartTime = now                (기존 동작)
```

`answerStartTime`은 store 상태이지만 `StudyInterface`가 구독 목록에서 꺼내 쓰면 된다. 기존 코드가 store 값을 destructure하는 방식 그대로 추가한다.

## 변경

### 1. `src/store/StudySessionStore.ts` — `startSession`

성공 경로의 `set({...})`에 `answerStartTime: new Date()`를 추가한다. 첫 카드의 표시 시각을 기록한다. `nextCard`는 이미 동일하게 설정하므로 두 번째 이후 카드는 손대지 않는다.

### 2. `src/features/flashcard/components/StudySession/StudyInterface.tsx` — `handleAnswer`

- store destructure에 `answerStartTime`을 추가한다.
- `const responseTime = Date.now() - (new Date().getTime());`을
  `const responseTime = answerStartTime ? Date.now() - answerStartTime.getTime() : 0;`로 바꾼다.
- `useCallback` 의존성 배열에 `answerStartTime`을 추가한다(ESLint `react-hooks/exhaustive-deps`가 lint를 막으므로 필수).

`answerStartTime`이 `null`일 때 `0`으로 두는 것은 안전 기본값이다. `startSession`/`nextCard`가 항상 값을 채우므로 정상 흐름에서는 `null`이 아니다.

## 회귀 테스트

### 컴포넌트 테스트 (fake timers)

기존 `StudyInterface.test.tsx`는 store를 통째로 mock한다. 여기에 `answerStartTime`을 과거 시각(now - 3000ms)으로 넣은 상태를 만들고, 답 키를 눌러 1초 타이머를 진행시킨 뒤 `processAnswer`가 `responseTime` 3000ms 근처로 호출됐는지 확인한다. `jest.setSystemTime`으로 시계를 고정해 결정적으로 만든다.

- Before(수정 전): `Date.now() - new Date().getTime()`이라 0ms → 테스트 실패.
- After(수정 후): `answerStartTime` 기준 → 3000ms → 통과.

### store 테스트

`startSession` 호출 후 `answerStartTime`이 `Date` 인스턴스인지 확인한다.

- Before: `null` → 실패.
- After: `Date` → 통과.

두 테스트가 "무엇이 깨졌는지"와 "무엇이 그대로여야 하는지"(기존 중복 입력 무시·언마운트 취소 테스트는 유지)를 함께 못박는다.
