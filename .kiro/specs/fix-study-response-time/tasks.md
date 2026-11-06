# 구현 작업: 학습 응답 시간(responseTime) 기록 버그 수정

TDD로 진행한다(AGENTS.md). 실패하는 테스트를 먼저 쓰고, 통과할 만큼만 구현한 뒤 정리한다. 구조 변경과 동작 변경 커밋을 분리하고, Conventional Commits로 커밋한다. 완료 전 `npx tsc --noEmit`, `npm run build`, `npm test`를 실행한다.

- [ ] 1. 기준선 기록
  - 작업 전 `npm test`를 1회 실행해 기존 실패 수를 기준선으로 기록한다(이 버그 수정으로 실패 수가 늘지 않는지 비교용).
  - _요구사항: 4.2_

- [ ] 2. 실패하는 회귀 테스트 작성 (RED)
- [ ] 2.1 컴포넌트 테스트: 경과 시간 측정
  - `src/features/flashcard/components/StudySession/__tests__/StudyInterface.test.tsx`에 테스트를 추가한다.
  - Jest fake timers로 세션을 시작하고(모킹된 스토어/서비스 사용), 카드 앞면 표시 후 3000ms를 진행시킨 뒤 "답 보기" → 난이도 선택을 수행한다.
  - 피드백 지연 1000ms을 진행시킨 뒤 `processAnswer`가 약 3000ms의 responseTime으로 호출됨을 단언한다.
  - 수정 전 코드에서는 0으로 호출되어 이 테스트가 실패(RED)해야 한다.
  - _요구사항: 1.1, 1.2, 4.1_

- [ ] 2.2 스토어 테스트: 첫 카드 기준점
  - `StudySessionStore` 테스트에 `startSession` 직후 `answerStartTime`이 `null`이 아니라 `Date`임을 단언하는 테스트를 추가한다.
  - 수정 전 코드에서는 `null`이라 실패(RED)해야 한다.
  - _요구사항: 2.1, 4.1_

- [ ] 3. 스토어 수정 (GREEN) — `src/store/StudySessionStore.ts`
  - `startSession`의 첫 카드 설정 `set({ ... })` 블록에 `answerStartTime: new Date()`를 추가한다.
  - `nextCard`(카드 전환 시 갱신 / 소진 시 `null`)와 `endSession`(`null`)의 기존 동작은 유지한다.
  - _요구사항: 2.1, 2.2, 2.3_

- [ ] 4. 컴포넌트 수정 (GREEN) — `src/features/flashcard/components/StudySession/StudyInterface.tsx`
  - 스토어 구조 분해에 `answerStartTime`을 추가한다.
  - `handleAnswer`의 응답 시간 계산을 `Date.now() - (new Date().getTime())`에서
    `answerStartTime ? Date.now() - answerStartTime.getTime() : 0`으로 교체한다.
  - `handleAnswer`의 `useCallback` 의존성 배열에 `answerStartTime`을 추가한다.
  - _요구사항: 1.1, 1.2, 1.3, 3.1_

- [ ] 5. 일시정지 결정 반영 확인
  - responseTime이 벽시계 기준 `지금 - answerStartTime`이며 일시정지 구간을 차감하지 않음을 코드 주석으로 명시한다(최소 변경 결정).
  - 일시정지 시간 차감 로직은 추가하지 않는다(범위 밖).
  - _요구사항: 3.1, 3.2_

- [ ] 6. 검증 및 정리 (REFACTOR/VERIFY)
  - 2.1, 2.2 테스트가 통과(GREEN)하는지 확인한다.
  - `npx tsc --noEmit`와 `npm run build`가 통과하는지 확인한다.
  - `npm test`를 실행해 1번에서 기록한 기준선 대비 새로운 실패가 없는지 확인한다.
  - 임시 파일/로그를 정리한다.
  - _요구사항: 4.1, 4.2_
