# Implementation Plan

- [x] 1-1 플래시카드 기본 타입 정의 (구조적 변경)
  - src/types/flashcard.ts 파일 생성
  - Deck, Card, StudySession, StudyQuality 인터페이스 정의
  - 기본 타입 검증을 위한 간단한 테스트 작성
  - _Requirements: 1.2_

- [x] 1-2 서비스 인터페이스 정의 (구조적 변경)
  - src/services/ 디렉토리 생성
  - CRUDService 제네릭 인터페이스 정의
  - 각 서비스별 특화 인터페이스 정의 (IDeckService, ICardService, IStudyService)
  - 타입 안전성 검증을 위한 컴파일 테스트 작성
  - _Requirements: 6.1_

- [x] 1-3 에러 타입 시스템 정의 (구조적 변경)
  - src/types/errors.ts 파일 생성
  - MyAnkiError 클래스 및 ErrorCode enum 정의
  - 에러 타입별 생성자 테스트 작성
  - 에러 메시지 포맷 검증 테스트 작성
  - _Requirements: 5.3_

- [x] 2-1 데이터베이스 타입 확장 (구조적 변경)
  - src/types/database.ts에 Deck, Card, StudySession 타입 추가
  - DatabaseTables 인터페이스 확장
  - DATABASE_VERSION을 2로 업데이트
  - _Requirements: 1.1, 1.2_

- [x] 2-2 데이터베이스 스키마 확장 실패 테스트 작성 (TDD Red)
  - MyAnkiDB 클래스 확장을 위한 실패 테스트 작성
  - decks, cards, studySessions 테이블 생성 실패 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 1.1, 1.3_

- [x] 2-3 데이터베이스 스키마 확장 구현 (TDD Green)
  - MyAnkiDB에 decks, cards, studySessions 테이블 추가
  - 적절한 인덱스 설정 (name, deckId, cardId, studiedAt)
  - 자동 타임스탬프 훅 설정
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 1.1, 5.1_

- [x] 2-4 데이터베이스 스키마 리팩터링 (TDD Refactor)
  - 중복된 훅 설정 코드 제거
  - 스키마 정의 메서드 추출
  - 모든 테스트 통과 확인
  - _Requirements: 5.2_

- [x] 3-1 DeckService 생성 실패 테스트 작성 (TDD Red)
  - DeckService.create() 메서드 실패 테스트 작성
  - 유효하지 않은 데이터 입력 시 에러 발생 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 2.1, 6.2_

- [x] 3-2 DeckService 생성 기능 구현 (TDD Green)
  - DeckService 클래스 생성 및 create() 메서드 구현
  - 자동 타임스탬프 설정 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 2.1, 6.2_

- [x] 3-3 DeckService 조회 실패 테스트 작성 (TDD Red)
  - getById() 메서드 실패 테스트 작성 (존재하지 않는 ID)
  - getAll() 메서드 빈 결과 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 2.2, 6.2_

- [x] 3-4 DeckService 조회 기능 구현 (TDD Green)
  - getById() 메서드 구현
  - getAll() 메서드 구현 (생성일시 순 정렬)
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 2.2, 6.2_

- [x] 3-5 DeckService 수정 실패 테스트 작성 (TDD Red)
  - update() 메서드 실패 테스트 작성 (존재하지 않는 ID)
  - 유효하지 않은 데이터 수정 시 에러 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 2.3, 6.2_

- [x] 3-6 DeckService 수정 기능 구현 (TDD Green)
  - update() 메서드 구현
  - 자동 updatedAt 갱신 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 2.3, 6.2_

- [x] 3-7 DeckService 삭제 실패 테스트 작성 (TDD Red)
  - delete() 메서드 실패 테스트 작성 (존재하지 않는 ID)
  - 연관 데이터 삭제 실패 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 2.4, 6.2_

- [x] 3-8 DeckService 삭제 기능 구현 (TDD Green)
  - delete() 메서드 구현
  - 연관 카드 및 학습 기록 삭제 로직 구현 (트랜잭션 사용)
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 2.4, 6.2_

- [x] 3-9 DeckService 기본 CRUD 리팩터링 (TDD Refactor)
  - 중복된 유효성 검사 로직 추출
  - 에러 처리 로직 통합
  - 모든 테스트 통과 확인
  - _Requirements: 6.2_

- [x] 4-1 CardService 생성 실패 테스트 작성 (TDD Red)
  - CardService.create() 메서드 실패 테스트 작성
  - 존재하지 않는 deckId 참조 시 에러 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 3.1, 6.2_

- [x] 4-2 CardService 생성 기능 구현 (TDD Green)
  - CardService 클래스 생성 및 create() 메서드 구현
  - deckId 유효성 검사 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 3.1, 6.2_

- [x] 4-3 CardService 조회 실패 테스트 작성 (TDD Red)
  - getById() 메서드 실패 테스트 작성
  - getAll() 메서드 빈 결과 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 3.2, 6.2_

- [x] 4-4 CardService 조회 기능 구현 (TDD Green)
  - getById() 메서드 구현
  - getAll() 메서드 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 3.2, 6.2_

- [x] 4-5 CardService 덱별 조회 실패 테스트 작성 (TDD Red)
  - getCardsByDeck() 메서드 실패 테스트 작성
  - 존재하지 않는 deckId 조회 시 빈 배열 반환 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 3.2, 6.3_

- [x] 4-6 CardService 덱별 조회 기능 구현 (TDD Green)
  - getCardsByDeck() 메서드 구현 (생성일시 순 정렬)
  - deckId 인덱스를 활용한 효율적 쿼리 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 3.2, 6.3_

- [x] 4-7 CardService 수정 실패 테스트 작성 (TDD Red)
  - update() 메서드 실패 테스트 작성
  - 유효하지 않은 데이터 수정 시 에러 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 3.3, 6.2_

- [x] 4-8 CardService 수정 기능 구현 (TDD Green)
  - update() 메서드 구현
  - 자동 updatedAt 갱신 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 3.3, 6.2_

- [x] 4-9 CardService 삭제 실패 테스트 작성 (TDD Red)
  - delete() 메서드 실패 테스트 작성
  - 연관 학습 기록 삭제 실패 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 3.4, 6.2_

- [x] 4-10 CardService 삭제 기능 구현 (TDD Green)
  - delete() 메서드 구현
  - 연관 학습 기록 삭제 로직 구현 (트랜잭션 사용)
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 3.4, 6.2_

- [x] 4-11 CardService 리팩터링 (TDD Refactor)
  - 중복된 유효성 검사 로직 추출
  - 쿼리 최적화 및 인덱스 활용 개선
  - 모든 테스트 통과 확인
  - _Requirements: 5.2, 6.2_

- [x] 5-1 StudyService 생성 실패 테스트 작성 (TDD Red)
  - StudyService.create() 메서드 실패 테스트 작성
  - 존재하지 않는 cardId 참조 시 에러 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 4.1, 6.2_

- [x] 5-2 StudyService 생성 기능 구현 (TDD Green)
  - StudyService 클래스 생성 및 create() 메서드 구현
  - cardId 유효성 검사 및 StudyQuality 검증 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 4.1, 6.2_

- [x] 5-3 StudyService 조회 실패 테스트 작성 (TDD Red)
  - getById() 메서드 실패 테스트 작성
  - getAll() 메서드 빈 결과 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 4.2, 6.2_

- [x] 5-4 StudyService 조회 기능 구현 (TDD Green)
  - getById() 메서드 구현
  - getAll() 메서드 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 4.2, 6.2_

- [x] 5-5 StudyService 카드별 학습 기록 조회 실패 테스트 작성 (TDD Red)
  - getStudyHistory() 메서드 실패 테스트 작성
  - 존재하지 않는 cardId 조회 시 빈 배열 반환 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 4.2, 6.3_

- [x] 5-6 StudyService 카드별 학습 기록 조회 구현 (TDD Green)
  - getStudyHistory() 메서드 구현 (시간순 정렬)
  - cardId 인덱스를 활용한 효율적 쿼리 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 4.2, 6.3_

- [x] 5-7 StudyService 학습 통계 계산 실패 테스트 작성 (TDD Red)
  - getStudyStats() 메서드 실패 테스트 작성
  - 학습 기록이 없는 카드의 통계 계산 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 4.3, 6.3_

- [x] 5-8 StudyService 학습 통계 계산 구현 (TDD Green)
  - getStudyStats() 메서드 구현
  - 학습 횟수, 정답률, 평균 응답 시간 계산 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 4.3, 6.3_

- [x] 5-9 StudyService 학습 세션 기록 실패 테스트 작성 (TDD Red)
  - recordStudySession() 메서드 실패 테스트 작성
  - 유효하지 않은 quality 값 입력 시 에러 테스트
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 4.1, 6.3_

- [x] 5-10 StudyService 학습 세션 기록 구현 (TDD Green)
  - recordStudySession() 메서드 구현
  - 자동 studiedAt 타임스탬프 설정 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 4.1, 6.3_

- [x] 5-11 StudyService 리팩터링 (TDD Refactor)
  - 통계 계산 로직 별도 유틸리티 함수로 추출
  - 중복된 유효성 검사 로직 통합
  - 모든 테스트 통과 확인
  - _Requirements: 6.2_

- [x] 6-1 Deck 유효성 검사 실패 테스트 작성 (TDD Red)
  - validateDeck() 함수 실패 테스트 작성
  - 이름 길이, 중복 검사 실패 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 5.3_

- [x] 6-2 Deck 유효성 검사 구현 (TDD Green)
  - src/utils/validation.ts에 validateDeck() 함수 추가
  - 이름 필수 검사, 길이 제한, 중복 검사 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 5.3_

- [x] 6-3 Card 유효성 검사 실패 테스트 작성 (TDD Red)
  - validateCard() 함수 실패 테스트 작성
  - front/back 내용 길이 검사 실패 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 5.3_

- [x] 6-4 Card 유효성 검사 구현 (TDD Green)
  - validateCard() 함수 구현
  - front/back 필수 검사, 길이 제한 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 5.3_

- [x] 6-5 StudySession 유효성 검사 실패 테스트 작성 (TDD Red)
  - validateStudySession() 함수 실패 테스트 작성
  - quality 범위 검사, responseTime 양수 검사 실패 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 5.3_

- [x] 6-6 StudySession 유효성 검사 구현 (TDD Green)
  - validateStudySession() 함수 구현
  - quality 범위 검사, responseTime 양수 검사 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 5.3_

- [x] 6-7 유효성 검사 리팩터링 (TDD Refactor)
  - 공통 유효성 검사 로직 추출
  - 에러 메시지 표준화
  - 모든 테스트 통과 확인
  - _Requirements: 5.3_

- [x] 7-1 트랜잭션 롤백 실패 테스트 작성 (TDD Red)
  - 덱 삭제 시 연관 데이터 삭제 실패 테스트 작성
  - 트랜잭션 중간 실패 시 롤백 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 6.2_

- [x] 7-2 트랜잭션 롤백 메커니즘 구현 (TDD Green)
  - Dexie 트랜잭션을 활용한 롤백 로직 구현
  - 연관 데이터 삭제 시 원자성 보장 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 6.2_

- [x] 8-1 서비스 간 상호작용 실패 테스트 작성 (TDD Red)
  - DeckService와 CardService 연동 실패 테스트 작성
  - CardService와 StudyService 연동 실패 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 7.3_

- [x] 8-2 서비스 간 상호작용 구현 (TDD Green)
  - 서비스 간 의존성 주입 패턴 구현
  - 연관 데이터 조회 시 서비스 간 협력 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 7.3_

- [x] 8-3 실제 IndexedDB 환경 테스트 작성 (TDD Red)
  - fake-indexeddb 없이 실제 브라우저 환경 테스트 작성
  - 대용량 데이터 처리 성능 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 7.3, 8.3_

- [x] 8-4 실제 IndexedDB 환경 최적화 구현 (TDD Green)
  - 인덱스 활용 쿼리 최적화 구현
  - 배치 처리 및 페이지네이션 로직 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 8.3_

- [x] 9-1 서비스 통합 index 파일 생성 (구조적 변경)
  - src/services/index.ts 파일 생성
  - 모든 서비스 export 및 팩토리 함수 구현
  - 타입 안전한 서비스 인스턴스 생성 로직 구현
  - _Requirements: 8.1_

- [x] 9-2 오프라인 동작 검증 테스트 작성 (TDD Red)
  - 네트워크 연결 없이 모든 CRUD 작업 테스트 작성
  - 브라우저 재시작 후 데이터 지속성 테스트 작성
  - 테스트 실행하여 Red 상태 확인
  - _Requirements: 8.1, 8.2_

- [x] 9-3 오프라인 동작 보장 구현 (TDD Green)
  - 완전한 클라이언트 사이드 동작 확인
  - 데이터 지속성 메커니즘 구현
  - 테스트 통과 확인 (Green 상태)
  - _Requirements: 8.1, 8.2_

- [x] 10-1 전체 시스템 리팩터링 (TDD Refactor)
  - 모든 서비스의 중복 코드 제거
  - 공통 인터페이스 및 유틸리티 함수 통합
  - 타입 안전성 강화 및 성능 최적화 적용
  - 모든 테스트 통과 확인
  - _Requirements: 5.2, 8.3_

- [x] 10-2 최종 통합 테스트 실행 및 검증
  - 전체 테스트 스위트 실행
  - 코드 커버리지 확인 (최소 90% 목표)
  - 성능 벤치마크 테스트 실행
  - _Requirements: 7.1, 7.2, 7.3_