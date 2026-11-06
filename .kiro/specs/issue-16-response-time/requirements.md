# Requirements: 학습 응답 시간(responseTime) 기록 수정

이슈 #16. 학습 화면이 카드마다 기록하는 `responseTime`이 항상 0ms 안팎으로 나온다. 평균 응답 시간 같은 통계가 모두 0으로 왜곡된다.

## 사용자 목표

학습자가 카드 앞면을 본 순간부터 답 난이도를 고른 순간까지 걸린 시간을, 카드마다 밀리초 단위로 정확히 남긴다. 그래야 학습 통계(평균 응답 시간 등)가 실제 소요 시간을 반영한다.

## Bug Analysis (3관점, EARS)

### 1. Current Behavior (Defect) — 지금 잘못된 동작

- WHEN 학습자가 `StudyInterface`에서 답 난이도를 고른다 THEN the system computes `responseTime`를 `Date.now() - new Date().getTime()`로 계산하여 항상 0ms 안팎을 `processAnswer`로 넘긴다.
- WHEN `StudySessionStore.startSession`이 첫 카드를 띄운다 THEN the system leaves `answerStartTime`를 `null`로 둔다(첫 카드의 표시 시각이 기록되지 않는다).
- WHEN 응답 시간을 쓰는 통계(`sessionStats.totalTime`, 평균 응답 시간, `getEstimatedTimeRemaining`)를 계산한다 THEN the system produces 0에 수렴하는 값을 낸다.

### 2. Expected Behavior (Correct) — 고친 뒤 맞는 동작

- WHEN 카드가 새로 표시된다 THEN the system SHALL record 그 표시 시각을 `answerStartTime`에 저장한다(첫 카드는 `startSession`에서, 이후 카드는 `nextCard`에서).
- WHEN 학습자가 답 난이도를 고른다 THEN the system SHALL compute `responseTime`를 `answerStartTime ? Date.now() - answerStartTime.getTime() : 0`로 계산하여 `processAnswer`로 넘긴다.
- WHEN 카드 앞면이 표시되고 3초 뒤 답을 고른다 THEN the system SHALL record `responseTime` ≈ 3000ms.

### 3. Unchanged Behavior (Regression Prevention) — 바뀌면 안 되는 동작

- WHEN 피드백 표시 중(답 처리 대기 중) 같은 답 입력이 또 들어온다 THEN the system SHALL CONTINUE TO 두 번째 입력을 무시하고 `processAnswer`를 한 번만 호출한다.
- WHEN 컴포넌트가 답 처리 대기 중에 언마운트된다 THEN the system SHALL CONTINUE TO 예약된 타이머를 취소하여 `processAnswer`/`nextCard`를 호출하지 않는다.
- WHEN `nextCard`가 다음 카드로 넘어간다 THEN the system SHALL CONTINUE TO `answerStartTime`를 그 시점으로 갱신한다(기존 동작 유지).
- WHEN 큐가 비어 더 넘길 카드가 없다 THEN the system SHALL CONTINUE TO `answerStartTime`를 `null`로 둔다.

## 완료 기준

- 첫 카드를 포함해 카드가 표시될 때마다 표시 시각이 기록되고, 답을 고를 때 그 시각과의 차이가 `responseTime`으로 전달된다.
- 컴포넌트 회귀 테스트(fake timers): 3초 대기 후 답하면 `responseTime`이 3000ms로 전달됨을 확인한다.
- store 회귀 테스트: `startSession` 후 `answerStartTime`이 `Date`로 설정됨을 확인한다.
- 전체 테스트, `tsc`, build, lint 통과.

## 일시정지 시간 처리 결정

이번 수정은 일시정지(`pauseSession`) 동안 흐른 시간을 응답 시간에서 **빼지 않는다**. 즉 벽시계 기준 경과 시간을 그대로 기록한다. 근거:

- 이슈의 완료 기준은 "표시된 시각부터 답을 고른 시각까지"의 벽시계 시간이다. 최소 수정으로 그 요구를 충족한다.
- 일시정지 보정은 표시 시각과 재개 시각을 각각 추적해 누적 일시정지 구간을 빼는 별도 상태가 필요하다. 이는 이 이슈 범위를 넘는 추가 기능이므로 끼워 넣지 않는다(Laziness Protocol).
- 한계: 학습자가 카드를 열어 둔 채 일시정지했다가 한참 뒤 재개하면 그 멈춘 시간도 응답 시간에 포함된다. 통계 정확도를 더 높이려면 후속 작업으로 일시정지 구간 차감을 추가한다.

이 결정은 PR 본문에도 적는다.
