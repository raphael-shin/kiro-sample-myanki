# 요구사항: 학습 응답 시간(responseTime) 기록 버그 수정

## 개요

학습 화면에서 카드에 답할 때 기록되는 `responseTime`이 실제 소요 시간과 무관하게 항상 0ms(에 가까운 값)로 저장된다. 이 스펙은 버그의 근본 원인을 문서화하고, 카드 앞면이 표시된 시각부터 사용자가 난이도를 고르는 순간까지의 실제 경과 시간이 기록되도록 하는 요구사항을 정의한다.

## 용어

- **responseTime**: 카드 앞면이 화면에 표시된 시각부터 사용자가 난이도(Again/Hard/Good/Easy)를 선택한 시각까지의 경과 시간(ms). `StudySessionStore`의 `sessionStats.totalTime` 누적과 `getEstimatedTimeRemaining()`의 입력으로 쓰인다.
- **answerStartTime**: 현재 카드의 앞면이 표시되기 시작한 시각. `StudySessionStore`의 상태 값(`Date | null`).

## 근본 원인 (현상 설명)

버그가 있던 코드(`StudyInterface.tsx`의 `handleAnswer`)는 다음과 같이 응답 시간을 계산했다.

```ts
const responseTime = Date.now() - (new Date().getTime());
```

- `Date.now()`와 `new Date().getTime()`은 **같은 순간에 읽은 두 시계**다. 둘을 빼면 항상 0에 가까운 값(수 ms 이내)이 나온다.
- 즉, 카드가 표시된 시점을 기준으로 삼지 않고, 답을 처리하는 그 순간의 시각에서 같은 순간의 시각을 빼고 있었다. 사용자가 실제로 몇 초를 들였는지와 무관하다.
- 한편 스토어에는 "카드 앞면이 표시된 시각"을 담는 `answerStartTime` 상태가 이미 있었지만, `handleAnswer`는 이 값을 전혀 사용하지 않았다.
- 추가로 `startSession`은 첫 카드를 세팅할 때 `answerStartTime`을 설정하지 않았다(`nextCard`만 `answerStartTime: new Date()`를 세팅). 따라서 설령 `handleAnswer`가 `answerStartTime`을 참조하도록 고치더라도, 세션의 **첫 카드**에서는 `answerStartTime`이 `null`이라 responseTime이 0으로 기록되는 두 번째 결함이 남는다.

## 재현 절차

1. 학습 세션을 시작한다(덱에 카드가 1장 이상 있어야 한다).
2. Jest fake timers 환경에서 카드 앞면이 표시된 뒤 3초(3000ms)를 진행시킨다.
3. "답 보기" 후 난이도 버튼 중 하나를 선택한다.
4. **기대**: `processAnswer`에 약 3000ms가 전달된다.
5. **실제(버그)**: `processAnswer`에 0ms(에 가까운 값)가 전달된다. 첫 카드의 경우 `answerStartTime`이 미설정이라 명시적으로 0이 된다.

## 요구사항

### 요구사항 1 — 경과 시간 기반 responseTime 계산

**사용자 스토리:** 학습자로서, 내가 카드에 답하는 데 실제로 걸린 시간이 기록되기를 원한다. 그래야 세션 통계와 남은 시간 추정이 의미를 가진다.

#### 수용 기준

1. WHEN 사용자가 난이도를 선택하면 THEN 시스템은 `responseTime`을 "카드 앞면이 표시된 시각(answerStartTime)부터 지금까지의 경과 시간(ms)"으로 계산해야 한다.
2. WHEN 카드 앞면 표시 후 N ms가 경과한 뒤 답하면 THEN 기록되는 `responseTime`은 약 N ms여야 한다(같은 순간의 두 시계를 빼서 0이 되어서는 안 된다).
3. WHEN responseTime을 계산할 기준 시각이 존재하지 않으면(`answerStartTime`이 `null`) THEN 시스템은 음수나 비정상 값 대신 0을 기록해야 한다(방어적 기본값).

### 요구사항 2 — 첫 카드에도 기준 시각 설정

**사용자 스토리:** 학습자로서, 세션의 첫 카드에 대해서도 응답 시간이 올바르게 측정되기를 원한다.

#### 수용 기준

1. WHEN `startSession`이 첫 카드를 현재 카드로 설정하면 THEN `answerStartTime`은 그 시점의 현재 시각으로 설정되어야 한다.
2. WHEN `nextCard`가 다음 카드로 전환하면 THEN `answerStartTime`은 전환 시점의 현재 시각으로 갱신되어야 한다(기존 동작 유지).
3. WHEN 세션이 종료되거나 더 이상 카드가 없으면 THEN `answerStartTime`은 `null`로 설정되어야 한다(기존 동작 유지).

### 요구사항 3 — 일시정지 시간 처리(결정 사항)

**사용자 스토리:** 유지보수자로서, 일시정지 시간을 responseTime에 어떻게 반영할지에 대한 결정이 명확히 문서화되기를 원한다.

#### 수용 기준

1. WHEN 사용자가 카드 표시 중 세션을 일시정지했다가 재개하면 THEN 그 일시정지 시간은 responseTime에 **포함**된다(최소 변경 결정). 즉 responseTime은 벽시계 기준 `지금 - answerStartTime`이며 일시정지 구간을 빼지 않는다.
2. 이 동작은 의도된 결정이며, 일시정지 시간 차감은 본 스펙의 범위에 포함하지 않는다(향후 별도 작업으로 다룰 수 있다).

### 요구사항 4 — 회귀 방지

**사용자 스토리:** 유지보수자로서, 이 버그가 다시 발생하지 않도록 테스트로 고정되기를 원한다.

#### 수용 기준

1. WHEN fake timers로 카드 표시 후 일정 시간을 진행시킨 뒤 답하면 THEN `processAnswer`(또는 `submitAnswer`)가 그 시간에 상응하는 responseTime 값으로 호출되는지 검증하는 테스트가 있어야 한다.
2. WHEN 기존 학습 세션/스토어 테스트를 실행하면 THEN 이 변경으로 새로운 실패가 추가되어서는 안 된다(기준선 대비 실패 수가 늘지 않아야 한다).
