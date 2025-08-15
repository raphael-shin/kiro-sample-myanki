# Implementation Plan

- [x] 1. 간격 반복 알고리즘 기본 타입 정의
  - **(TDD Red)** 실패하는 테스트: SpacedRepetitionCard 인터페이스 사용 테스트 작성
  - **(TDD Green)** 최소 구현: 기본 타입 인터페이스만 정의
  - **(TDD Refactor)** 리팩터링: 타입 구조 정리 및 JSDoc 추가
  - _Requirements: 3.1_

- [x] 1.1 날짜 유틸리티 함수 구현 (TDD)
  - **(TDD Red)** 실패하는 테스트: addDays 함수가 정확한 날짜를 반환하는지 테스트
  - **(TDD Green)** 최소 구현: 단순한 날짜 더하기 함수 구현
  - **(TDD Refactor)** 리팩터링: 엣지 케이스 처리 및 함수명 개선
  - _Requirements: 3.7_

- [x] 1.2 용이도 인수 계산 함수 구현 (TDD)
  - **(TDD Red)** 실패하는 테스트: 품질 점수에 따른 용이도 인수 계산 테스트
  - **(TDD Green)** 최소 구현: SM-2 공식의 용이도 인수 계산만 구현
  - **(TDD Refactor)** 리팩터링: 매직 넘버 상수화 및 함수 분리
  - _Requirements: 3.2, 3.5, 3.6_

- [x] 1.3 간격 계산 함수 구현 (TDD)
  - **(TDD Red)** 실패하는 테스트: 반복 횟수와 용이도에 따른 간격 계산 테스트
  - **(TDD Green)** 최소 구현: 기본 간격 계산 로직만 구현
  - **(TDD Refactor)** 리팩터링: 계산 로직 함수 분리 및 가독성 개선
  - _Requirements: 3.3, 3.4_

- [x] 1.4 SM2Algorithm 클래스 기본 구조 (TDD)
  - **(TDD Red)** 실패하는 테스트: SM2Algorithm 클래스 인스턴스 생성 테스트
  - **(TDD Green)** 최소 구현: 빈 클래스와 생성자만 구현
  - **(TDD Refactor)** 리팩터링: 클래스 구조 정리 및 private 메서드 분리
  - _Requirements: 3.1_

- [x] 1.5 "Again" 품질 점수 처리 (TDD)
  - **(TDD Red)** 실패하는 테스트: 품질 점수 1일 때 간격이 1분으로 설정되는 테스트
  - **(TDD Green)** 최소 구현: AGAIN 케이스만 처리하는 로직 구현
  - **(TDD Refactor)** 리팩터링: 상수 정의 및 조건문 정리
  - _Requirements: 3.2_

- [x] 1.6 "Hard" 품질 점수 처리 (TDD)
  - **(TDD Red)** 실패하는 테스트: 품질 점수 2일 때 간격이 1.2배 증가하는 테스트
  - **(TDD Green)** 최소 구현: HARD 케이스 처리 로직 추가
  - **(TDD Refactor)** 리팩터링: 중복 코드 제거 및 계산 로직 함수화
  - _Requirements: 3.3_

- [x] 1.7 "Good" 품질 점수 처리 (TDD)
  - **(TDD Red)** 실패하는 테스트: 품질 점수 3일 때 용이도 인수 적용 테스트
  - **(TDD Green)** 최소 구현: GOOD 케이스 처리 로직 추가
  - **(TDD Refactor)** 리팩터링: 공통 계산 로직 추출 및 메서드 분리
  - _Requirements: 3.4_

- [x] 1.8 "Easy" 품질 점수 처리 (TDD)
  - **(TDD Red)** 실패하는 테스트: 품질 점수 4일 때 간격 1.3배 및 EF 증가 테스트
  - **(TDD Green)** 최소 구현: EASY 케이스 처리 로직 추가
  - **(TDD Refactor)** 리팩터링: 전체 알고리즘 로직 정리 및 최적화
  - _Requirements: 3.5_

- [x] 1.9 최소 간격 제한 로직 (TDD)
  - **(TDD Red)** 실패하는 테스트: 계산된 간격이 1일 미만일 때 1일로 설정되는 테스트
  - **(TDD Green)** 최소 구현: 간격 최솟값 검증 로직 추가
  - **(TDD Refactor)** 리팩터링: 유효성 검사 함수 분리 및 상수 정의
  - _Requirements: 3.7_

- [x] 2. 간격 반복 데이터 모델 확장 (구조적 변경)
  - 기존 데이터베이스 스키마에 간격 반복 테이블 추가
  - 동작 변경 없이 구조만 확장
  - _Requirements: 3.1, 3.7_

- [x] 2.1 SpacedRepetitionData 타입 정의 (TDD)
  - **(TDD Red)** 실패하는 테스트: SpacedRepetitionData 인터페이스 사용 테스트
  - **(TDD Green)** 최소 구현: 기본 필드만 포함한 인터페이스 정의
  - **(TDD Refactor)** 리팩터링: 타입 정의 정리 및 JSDoc 추가
  - _Requirements: 3.1_

- [x] 2.2 데이터베이스 스키마 확장 (TDD)
  - **(TDD Red)** 실패하는 테스트: spacedRepetitionData 테이블 생성 테스트
  - **(TDD Green)** 최소 구현: MyAnkiDB에 새 테이블 스키마만 추가
  - **(TDD Refactor)** 리팩터링: 인덱스 최적화 및 스키마 버전 관리
  - _Requirements: 3.7_

- [x] 2.3 SpacedRepetitionService 기본 구조 (TDD)
  - **(TDD Red)** 실패하는 테스트: 서비스 클래스 인스턴스 생성 테스트
  - **(TDD Green)** 최소 구현: 빈 서비스 클래스와 생성자만 구현
  - **(TDD Refactor)** 리팩터링: 서비스 인터페이스 정의 및 의존성 주입 준비
  - _Requirements: 3.1_

- [x] 3. 덱 상태 관리 기본 구조 구현
  - Zustand를 사용한 덱 상태 관리 스토어 구현 완료
  - 덱 목록, 선택, 로딩, 에러 상태 관리 완료
  - _Requirements: 4.1, 4.2_

- [x] 3.1 DeckStore 기본 상태 정의 (TDD)
  - **(TDD Red)** 실패하는 테스트: DeckStore 기본 상태 접근 테스트
  - **(TDD Green)** 최소 구현: 기본 상태 필드만 포함한 스토어 생성
  - **(TDD Refactor)** 리팩터링: 상태 구조 정리 및 타입 안전성 강화
  - _Requirements: 4.1_

- [x] 3.2 덱 목록 로딩 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: loadDecks 액션 호출 테스트
  - **(TDD Green)** 최소 구현: 비동기 로딩 액션과 상태 업데이트 로직
  - **(TDD Refactor)** 리팩터링: 에러 처리 및 로딩 상태 관리 개선
  - _Requirements: 4.1_

- [x] 3.3 덱 선택 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: selectDeck, clearSelection 액션 테스트
  - **(TDD Green)** 최소 구현: 덱 선택 상태 변경 로직
  - **(TDD Refactor)** 리팩터링: 선택 상태 관리 로직 정리
  - _Requirements: 4.2_

- [x] 3.4 에러 처리 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: setError, clearError 액션 테스트
  - **(TDD Green)** 최소 구현: 에러 상태 설정 및 초기화 로직
  - **(TDD Refactor)** 리팩터링: 에러 처리 패턴 표준화
  - _Requirements: 4.1_

- [x] 3.5 덱 생성 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: createDeck 액션으로 새 덱 추가 테스트
  - **(TDD Green)** 최소 구현: DeckService.create() 호출 및 상태 업데이트
  - **(TDD Refactor)** 리팩터링: 낙관적 업데이트 및 롤백 로직 추가
  - _Requirements: 1.1_

- [x] 3.6 덱 수정 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: updateDeck 액션으로 덱 정보 수정 테스트
  - **(TDD Green)** 최소 구현: DeckService.update() 호출 및 상태 업데이트
  - **(TDD Refactor)** 리팩터링: 부분 업데이트 최적화 및 검증 로직 추가
  - _Requirements: 1.4_

- [x] 3.7 덱 삭제 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: deleteDeck 액션으로 덱 제거 테스트
  - **(TDD Green)** 최소 구현: DeckService.delete() 호출 및 상태에서 제거
  - **(TDD Refactor)** 리팩터링: 관련 데이터 정리 및 확인 로직 추가
  - _Requirements: 1.5, 1.6_

- [x] 3.8 DeckStore 리팩터링 (TDD Refactor)
  - 전체 스토어 구조 정리 및 문서화
  - 중복된 에러 처리 및 로딩 상태 관리 로직을 withAsyncOperation 헬퍼로 추출
  - 모든 테스트 통과 확인 (24개 테스트 모두 통과)
  - _Requirements: 4.1, 4.2_

- [x] 4. 학습 세션 상태 관리 구현
  - Zustand를 사용한 학습 세션 상태 관리 스토어 구현 완료
  - 세션 관리, 답변 처리, 진행률 추적 모든 기능 완성
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 4.1 StudySessionStore 기본 상태 정의 (TDD)
  - **(TDD Red)** 실패하는 테스트: StudySessionStore 기본 상태 접근 테스트
  - **(TDD Green)** 최소 구현: 기본 상태 필드만 포함한 스토어 생성
  - **(TDD Refactor)** 리팩터링: 상태 구조 정리 및 타입 안전성 강화
  - _Requirements: 5.1_

- [x] 4.2 학습 세션 시작/종료 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: startSession, endSession 액션 테스트
  - **(TDD Green)** 최소 구현: 세션 시작/종료 상태 변경 로직
  - **(TDD Refactor)** 리팩터링: 세션 관리 로직 정리
  - _Requirements: 5.1_

- [x] 4.3 카드 답변 처리 액션 (TDD)
  - **(TDD Red)** 실패하는 테스트: submitAnswer, nextCard 액션 테스트
  - **(TDD Green)** 최소 구현: 답변 처리 및 통계 업데이트 로직
  - **(TDD Refactor)** 리팩터링: 답변 품질별 처리 로직 정리
  - _Requirements: 5.2_

- [x] 4.4 학습 진행률 추적 (TDD)
  - **(TDD Red)** 실패하는 테스트: getProgress, updateProgress 액션 테스트
  - **(TDD Green)** 최소 구현: 진행률 계산 및 추적 로직
  - **(TDD Refactor)** 리팩터링: 진행률 계산 로직 최적화
  - _Requirements: 5.3_

- [x] 4.5 StudySessionStore 리팩터링 (TDD Refactor)
  - 전체 스토어 구조 정리 및 JSDoc 문서화
  - 액션별 그룹화로 코드 가독성 개선
  - 모든 테스트 통과 확인 (19개 테스트 모두 통과)
  - get() 함수 사용으로 성능 최적화
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. 서비스 레이어 데이터베이스 연동 완성
- [x] 5.1 DeckStore와 DeckService 연동 (TDD)
  - **(TDD Red)** 실패하는 테스트: DeckStore의 TODO 주석 제거하고 실제 DeckService 호출 테스트
  - **(TDD Green)** 최소 구현: createDeck, updateDeck, deleteDeck, loadDecks 액션에서 실제 DeckService 메서드 호출
  - **(TDD Refactor)** 리팩터링: 의존성 주입 패턴으로 테스트 가능한 구조 구현
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 5.2 SpacedRepetitionService 데이터베이스 연동 (TDD)
  - **(TDD Red)** 실패하는 테스트: 현재 Map 기반 메모리 저장을 데이터베이스 연동으로 변경 테스트
  - **(TDD Green)** 최소 구현: spacedRepetitionData 테이블과 연동하여 CRUD 작업 구현
  - **(TDD Refactor)** 리팩터링: 에러 처리 및 데이터베이스 쿼리 최적화
  - _Requirements: 3.1, 3.6_

- [x] 6. 간격 반복 알고리즘 통합
- [x] 6.1 SM2Algorithm과 SpacedRepetitionService 통합 (TDD)
  - **(TDD Red)** 실패하는 테스트: SM2Algorithm을 사용하여 다음 복습 날짜 계산 로직 테스트
  - **(TDD Green)** 최소 구현: processStudyResult 메서드로 답변 품질에 따른 알고리즘 적용
  - **(TDD Refactor)** 리팩터링: getCardsForReview 메서드로 오늘 복습할 카드 필터링 구현
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7_

- [x] 6.2 StudySessionStore와 간격 반복 알고리즘 연동 (TDD)
  - **(TDD Red)** 실패하는 테스트: processAnswer 메서드에서 SM2Algorithm 호출하여 카드 상태 업데이트 테스트
  - **(TDD Green)** 최소 구현: SpacedRepetitionService 통합으로 실제 알고리즘 적용 및 데이터 저장
  - **(TDD Refactor)** 리팩터링: 의존성 주입 패턴으로 테스트 가능한 구조 및 에러 처리 개선
  - _Requirements: 4.1, 4.4_

- [x] 7. 덱 관리 UI 컴포넌트 구현
  - features/flashcard/components/DeckManager 폴더 구조 생성
  - 가장 단순한 덱 목록 표시부터 시작
  - _Requirements: 1.2, 1.3_

- [x] 7.1 DeckCard 기본 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱 이름과 설명을 표시하는 테스트
  - **(TDD Green)** 최소 구현: 덱 정보만 표시하는 단순한 카드 컴포넌트
  - **(TDD Refactor)** 리팩터링: 스타일링 분리 및 props 타입 정의
  - _Requirements: 1.2_

- [x] 7.2 DeckCard 통계 표시 기능 (TDD)
  - **(TDD Red)** 실패하는 테스트: 카드 수와 마지막 학습 날짜 표시 테스트
  - **(TDD Green)** 최소 구현: 기본 통계 정보 표시 기능 추가
  - **(TDD Refactor)** 리팩터링: 통계 포맷팅 유틸리티 함수 분리
  - _Requirements: 1.2_

- [x] 7.3 DeckList 기본 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱 배열을 받아 DeckCard 목록 렌더링 테스트
  - **(TDD Green)** 최소 구현: map을 사용한 단순한 목록 렌더링
  - **(TDD Refactor)** 리팩터링: 빈 상태 처리 및 로딩 상태 추가
  - _Requirements: 1.2_

- [x] 7.4 덱 선택 기능 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱 클릭 시 onDeckSelect 콜백 호출 테스트
  - **(TDD Green)** 최소 구현: 클릭 이벤트 핸들러만 추가
  - **(TDD Refactor)** 리팩터링: 선택된 덱 시각적 표시 및 키보드 네비게이션
  - _Requirements: 1.3_

- [x] 7.5 덱 삭제 버튼 (TDD)
  - **(TDD Red)** 실패하는 테스트: 삭제 버튼 클릭 시 확인 다이얼로그 표시 테스트
  - **(TDD Green)** 최소 구현: 삭제 버튼과 기본 확인 다이얼로그만 구현
  - **(TDD Refactor)** 리팩터링: 접근성 개선 및 에러 처리 추가
  - _Requirements: 1.5, 1.6_

- [x] 8. 덱 생성 모달 구현
  - 모달의 기본 구조부터 폼 기능까지 단계별 구현
  - 각 입력 필드와 검증을 개별적으로 TDD 구현
  - _Requirements: 1.1, 1.4_

- [x] 8.1 CreateDeckModal 기본 구조 (TDD)
  - **(TDD Red)** 실패하는 테스트: 모달 열기/닫기 상태 관리 테스트
  - **(TDD Green)** 최소 구현: 기본 모달 컴포넌트와 상태 관리만 구현
  - **(TDD Refactor)** 리팩터링: 모달 컴포넌트 재사용 가능하게 추상화
  - _Requirements: 1.1_

- [x] 8.2 덱 이름 입력 필드 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱 이름 입력 시 상태 업데이트 테스트
  - **(TDD Green)** 최소 구현: 기본 텍스트 입력 필드만 구현
  - **(TDD Refactor)** 리팩터링: 실시간 유효성 검사 및 에러 메시지 표시
  - _Requirements: 1.1, 1.6_

- [x] 8.3 덱 설명 입력 필드 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱 설명 입력 시 상태 업데이트 테스트
  - **(TDD Green)** 최소 구현: 기본 텍스트 영역 필드만 구현
  - **(TDD Refactor)** 리팩터링: 글자 수 제한 및 자동 크기 조정 기능
  - _Requirements: 1.1_

- [x] 8.4 덱 생성 제출 기능 (TDD)
  - **(TDD Red)** 실패하는 테스트: 폼 제출 시 createDeck 액션 호출 테스트
  - **(TDD Green)** 최소 구현: 기본 폼 제출 핸들러만 구현
  - **(TDD Refactor)** 리팩터링: 로딩 상태 표시 및 성공/실패 피드백 추가
  - _Requirements: 1.1, 1.4_

- [x] 8.5 중복 이름 검증 (TDD)
  - **(TDD Red)** 실패하는 테스트: 중복된 덱 이름 입력 시 에러 표시 테스트
  - **(TDD Green)** 최소 구현: 기본 중복 검사 로직만 구현
  - **(TDD Refactor)** 리팩터링: 실시간 검증 및 사용자 친화적 메시지 개선
  - _Requirements: 1.6_

- [x] 9. 카드 편집 기본 컴포넌트 구현
  - features/flashcard/components/CardEditor 폴더 구조 생성
  - 가장 단순한 카드 편집 폼부터 시작
  - _Requirements: 2.1, 2.2_

- [x] 9.1 CardForm 기본 구조 (TDD)
  - **(TDD Red)** 실패하는 테스트: 앞면/뒷면 입력 필드 렌더링 테스트
  - **(TDD Green)** 최소 구현: 두 개의 기본 텍스트 입력 필드만 구현
  - **(TDD Refactor)** 리팩터링: 폼 레이아웃 정리 및 라벨 접근성 개선
  - _Requirements: 2.1_

- [x] 9.2 카드 내용 상태 관리 (TDD)
  - **(TDD Red)** 실패하는 테스트: 입력 값 변경 시 상태 업데이트 테스트
  - **(TDD Green)** 최소 구현: useState를 사용한 기본 상태 관리만 구현
  - **(TDD Refactor)** 리팩터링: 커스텀 훅으로 폼 로직 분리
  - _Requirements: 2.1_

- [x] 9.3 카드 유효성 검사 (TDD)
  - **(TDD Red)** 실패하는 테스트: 빈 내용 입력 시 에러 메시지 표시 테스트
  - **(TDD Green)** 최소 구현: 기본 빈 값 검사만 구현
  - **(TDD Refactor)** 리팩터링: 유효성 검사 규칙 상수화 및 메시지 개선
  - _Requirements: 2.6_

- [x] 9.4 카드 저장 기능 (TDD)
  - **(TDD Red)** 실패하는 테스트: 폼 제출 시 CardService.create 호출 테스트
  - **(TDD Green)** 최소 구현: 기본 저장 기능만 구현
  - **(TDD Refactor)** 리팩터링: 로딩 상태 및 성공/실패 피드백 추가
  - _Requirements: 2.1_

- [x] 9.5 CardList 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 선택된 덱의 카드 목록 표시 테스트
  - **(TDD Green)** 최소 구현: 카드 목록을 받아 표시하는 기본 컴포넌트
  - **(TDD Refactor)** 리팩터링: 카드 정렬 및 필터링 기능 추가
  - _Requirements: 2.5_

- [x] 9.6 CardPreview 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 입력된 내용을 미리보기로 표시하는 테스트
  - **(TDD Green)** 최소 구현: 단순한 텍스트 표시만 구현
  - **(TDD Refactor)** 리팩터링: 카드 편집 및 삭제 버튼 추가
  - _Requirements: 2.2, 2.3_

- [ ] 10. 학습 세션 UI 컴포넌트 구현
  - features/flashcard/components/StudySession 폴더 구조 생성
  - 가장 단순한 카드 표시부터 시작
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 10.1 StudyInterface 메인 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 학습 세션 메인 인터페이스 렌더링 테스트
  - **(TDD Green)** 최소 구현: StudySessionStore와 연동된 기본 인터페이스
  - **(TDD Refactor)** 리팩터링: 카드 표시 및 답변 평가 워크플로우 구현
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10.2 CardDisplay 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 현재 학습 중인 카드의 앞면/뒷면 표시 테스트
  - **(TDD Green)** 최소 구현: 카드 앞면만 표시하는 단순한 컴포넌트
  - **(TDD Refactor)** 리팩터링: "답안 보기" 버튼 및 상태 관리 추가
  - _Requirements: 4.2_

- [ ] 10.3 AnswerButtons 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 4단계 평가 버튼 (Again, Hard, Good, Easy) 렌더링 테스트
  - **(TDD Green)** 최소 구현: 4개 버튼과 기본 클릭 핸들러
  - **(TDD Refactor)** 리팩터링: 각 버튼 클릭 시 간격 반복 알고리즘 적용
  - _Requirements: 4.3, 4.4_

- [ ] 10.4 StudyProgress 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 학습 진행률 표시 (현재/전체 카드 수) 테스트
  - **(TDD Green)** 최소 구현: 기본 진행률 표시만 구현
  - **(TDD Refactor)** 리팩터링: 세션 통계 정보 표시 추가
  - _Requirements: 4.5, 5.1_

- [ ] 11. 통계 및 진행률 추적 컴포넌트 구현
  - features/flashcard/components/Statistics 폴더 구조 생성
  - 가장 기본적인 통계부터 시작
  - _Requirements: 5.1, 5.2_

- [ ] 11.1 DeckStats 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱별 학습 통계 표시 테스트
  - **(TDD Green)** 최소 구현: 총 카드 수와 학습된 카드 수만 표시
  - **(TDD Refactor)** 리팩터링: 신규/학습중/완료 카드 수 구분 표시
  - _Requirements: 5.1, 5.2_

- [ ] 11.2 ProgressTracker 컴포넌트 (TDD)
  - **(TDD Red)** 실패하는 테스트: 카드별 상세 정보 표시 테스트
  - **(TDD Green)** 최소 구현: 반복 횟수, 용이도 인수, 다음 복습 날짜 표시
  - **(TDD Refactor)** 리팩터링: 학습 진행률 백분율 표시 추가
  - _Requirements: 5.4_

- [ ] 12. 메인 애플리케이션 통합 및 라우팅
  - features/flashcard 폴더 구조 완성
  - 컴포넌트들을 메인 애플리케이션에 통합
  - _Requirements: 전체_

- [ ] 12.1 features/flashcard 폴더 구조 생성 (구조적 변경)
  - 설계 문서에 따른 폴더 구조 생성
  - 컴포넌트들을 적절한 폴더로 구조화
  - _Requirements: 전체_

- [ ] 12.2 DeckManager 메인 페이지 통합 (TDD)
  - **(TDD Red)** 실패하는 테스트: DeckManager 컴포넌트 렌더링 테스트
  - **(TDD Green)** 최소 구현: DeckList, CreateDeckModal을 조합한 페이지
  - **(TDD Refactor)** 리팩터링: 레이아웃 정리 및 반응형 디자인 적용
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 12.3 CardEditor 페이지 통합 (TDD)
  - **(TDD Red)** 실패하는 테스트: 선택된 덱의 카드 편집 페이지 테스트
  - **(TDD Green)** 최소 구현: CardForm과 CardList를 조합한 페이지
  - **(TDD Refactor)** 리팩터링: 덱 선택 상태 관리 및 네비게이션 추가
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 12.4 App.tsx에 메인 라우팅 및 레이아웃 구현 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱 관리, 카드 편집, 학습 세션 간 네비게이션 테스트
  - **(TDD Green)** 최소 구현: 기본 라우팅과 네비게이션 구조
  - **(TDD Refactor)** 리팩터링: 전체 애플리케이션 레이아웃 구성
  - _Requirements: 전체_

- [ ] 13. 최종 통합 테스트 및 에러 처리
  - 전체 시스템의 통합 테스트 작성
  - 에러 처리 및 사용자 피드백 구현
  - _Requirements: 모든 요구사항 검증_

- [ ] 13.1 컴포넌트 통합 테스트 작성 (TDD)
  - **(TDD Red)** 실패하는 테스트: 덱 생성부터 학습 완료까지 전체 워크플로우 테스트
  - **(TDD Green)** 최소 구현: 사용자 시나리오 기반 통합 테스트
  - **(TDD Refactor)** 리팩터링: 에러 케이스 및 엣지 케이스 처리 추가
  - _Requirements: 전체_

- [ ] 13.2 에러 처리 및 사용자 피드백 구현 (TDD)
  - **(TDD Red)** 실패하는 테스트: 네트워크 오류, 데이터 무결성 오류 처리 테스트
  - **(TDD Green)** 최소 구현: 기본 에러 처리 및 사용자 알림
  - **(TDD Refactor)** 리팩터링: 사용자 친화적인 에러 메시지 표시
  - _Requirements: 1.6, 2.6, 4.6_