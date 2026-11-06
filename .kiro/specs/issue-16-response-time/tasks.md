# Tasks: 응답 시간 기록 수정

- [ ] 1. `StudySessionStore.startSession`의 성공 경로 `set`에 `answerStartTime: new Date()` 추가. 첫 카드 표시 시각 기록.
  - 요구: Expected #1, Current #2
- [ ] 2. `StudyInterface`에서 store destructure에 `answerStartTime` 추가.
  - 요구: Expected #2
- [ ] 3. `handleAnswer`의 `responseTime` 계산을 `answerStartTime ? Date.now() - answerStartTime.getTime() : 0`로 교체하고 `useCallback` 의존성에 `answerStartTime` 추가.
  - 요구: Expected #2, #3
- [ ] 4. store 회귀 테스트: `startSession` 후 `answerStartTime`이 `Date`임을 확인.
  - 요구: Expected #1 (Unchanged: nextCard/빈 큐 동작)
- [ ] 5. 컴포넌트 회귀 테스트(fake timers): `answerStartTime` 3초 전 → 답 → `responseTime` 3000ms 전달 확인.
  - 요구: Expected #3
- [ ] 6. 검증: 전체 jest, `tsc`, `vite build`, eslint 모두 통과. Before(0ms)/After(3000ms) 재현 기록.
