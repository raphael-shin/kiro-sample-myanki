# Requirements Document

## Introduction

MyAnki 플래시카드 학습 애플리케이션의 핵심 데이터 모델을 설계하고 기본적인 CRUD(Create, Read, Update, Delete) 기능을 구현합니다. 이 기능은 덱(Deck), 카드(Card), 학습 세션(StudySession) 등의 핵심 엔티티를 정의하고, IndexedDB를 통한 오프라인 데이터 저장을 지원합니다. Basic 타입 노트만을 지원하는 간단하면서도 견고한 데이터 구조를 구축합니다.

## Requirements

### Requirement 1

**User Story:** 개발자로서, 플래시카드 애플리케이션의 핵심 데이터 구조를 정의하여 덱, 카드, 학습 기록을 체계적으로 관리하고 싶습니다.

#### Acceptance Criteria

1. WHEN 데이터베이스 스키마를 정의할 때 THEN Deck, Card, StudySession 테이블이 적절한 관계와 함께 생성되어야 합니다
2. WHEN TypeScript 타입을 정의할 때 THEN 모든 데이터 모델에 대한 완전한 타입 안전성이 보장되어야 합니다
3. WHEN 데이터베이스를 초기화할 때 THEN Dexie.js를 통해 IndexedDB에 스키마가 정상적으로 생성되어야 합니다

### Requirement 2

**User Story:** 사용자로서, 플래시카드 덱을 생성하고 관리할 수 있어야 합니다.

#### Acceptance Criteria

1. WHEN 새로운 덱을 생성할 때 THEN 덱 이름, 설명, 생성일시가 저장되어야 합니다
2. WHEN 덱 목록을 조회할 때 THEN 모든 덱이 생성일시 순으로 정렬되어 반환되어야 합니다
3. WHEN 덱을 수정할 때 THEN 이름과 설명이 업데이트되고 수정일시가 자동으로 갱신되어야 합니다
4. WHEN 덱을 삭제할 때 THEN 해당 덱과 관련된 모든 카드와 학습 기록이 함께 삭제되어야 합니다

### Requirement 3

**User Story:** 사용자로서, 덱 내에 Basic 타입의 플래시카드를 생성하고 관리할 수 있어야 합니다.

#### Acceptance Criteria

1. WHEN 새로운 카드를 생성할 때 THEN 앞면(front), 뒷면(back) 내용과 소속 덱 정보가 저장되어야 합니다
2. WHEN 특정 덱의 카드 목록을 조회할 때 THEN 해당 덱에 속한 모든 카드가 생성일시 순으로 반환되어야 합니다
3. WHEN 카드를 수정할 때 THEN 앞면과 뒷면 내용이 업데이트되고 수정일시가 자동으로 갱신되어야 합니다
4. WHEN 카드를 삭제할 때 THEN 해당 카드와 관련된 모든 학습 기록이 함께 삭제되어야 합니다

### Requirement 4

**User Story:** 시스템으로서, 사용자의 학습 기록을 추적하여 간격 반복 알고리즘에 필요한 데이터를 저장해야 합니다.

#### Acceptance Criteria

1. WHEN 사용자가 카드를 학습할 때 THEN 학습 세션 정보(카드 ID, 학습 일시, 답변 품질, 소요 시간)가 저장되어야 합니다
2. WHEN 특정 카드의 학습 기록을 조회할 때 THEN 해당 카드의 모든 학습 세션이 시간순으로 반환되어야 합니다
3. WHEN 카드의 학습 통계를 계산할 때 THEN 학습 횟수, 정답률, 마지막 학습일이 정확히 계산되어야 합니다

### Requirement 5

**User Story:** 개발자로서, 데이터 무결성을 보장하고 성능을 최적화하기 위한 데이터베이스 제약조건과 인덱스를 설정하고 싶습니다.

#### Acceptance Criteria

1. WHEN 데이터베이스 스키마를 생성할 때 THEN 외래 키 관계가 적절히 설정되어야 합니다
2. WHEN 데이터를 조회할 때 THEN 자주 사용되는 쿼리에 대한 인덱스가 설정되어 성능이 최적화되어야 합니다
3. WHEN 잘못된 데이터가 입력될 때 THEN 적절한 유효성 검사가 수행되어야 합니다

### Requirement 6

**User Story:** 개발자로서, 데이터 모델에 대한 CRUD 작업을 수행하는 서비스 레이어를 구현하여 비즈니스 로직을 캡슐화하고 싶습니다.

#### Acceptance Criteria

1. WHEN 서비스 클래스를 구현할 때 THEN 각 데이터 모델(Deck, Card, StudySession)에 대한 전용 서비스가 생성되어야 합니다
2. WHEN CRUD 작업을 수행할 때 THEN 모든 작업이 타입 안전하고 적절한 에러 처리가 포함되어야 합니다
3. WHEN 복잡한 쿼리를 실행할 때 THEN 비즈니스 로직이 서비스 레이어에 캡슐화되어야 합니다

### Requirement 7

**User Story:** 개발자로서, 데이터 모델과 서비스의 정확성을 보장하기 위한 포괄적인 테스트를 작성하고 싶습니다.

#### Acceptance Criteria

1. WHEN 데이터베이스 테스트를 작성할 때 THEN 모든 CRUD 작업에 대한 단위 테스트가 포함되어야 합니다
2. WHEN 서비스 테스트를 작성할 때 THEN 비즈니스 로직과 에러 처리에 대한 테스트가 포함되어야 합니다
3. WHEN 통합 테스트를 작성할 때 THEN 실제 IndexedDB 환경에서의 동작이 검증되어야 합니다

### Requirement 8

**User Story:** 사용자로서, 애플리케이션이 오프라인 상태에서도 모든 데이터 작업이 정상적으로 동작해야 합니다.

#### Acceptance Criteria

1. WHEN 네트워크가 연결되지 않은 상태에서 THEN 모든 CRUD 작업이 로컬 IndexedDB에서 정상적으로 수행되어야 합니다
2. WHEN 브라우저를 재시작할 때 THEN 저장된 모든 데이터가 유지되어야 합니다
3. WHEN 대용량 데이터를 처리할 때 THEN 성능 저하 없이 작업이 수행되어야 합니다