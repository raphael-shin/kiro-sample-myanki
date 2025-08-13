---
inclusion: always
---

# Development Best Practices

이 문서는 개발 과정에서 반복되는 실수를 방지하고 효율적인 개발을 위한 가이드라인입니다.

## React & TypeScript 개발

### React Import 패턴
- **항상 먼저 확인:** `tsconfig.json`의 `jsx` 설정
- **React 17+ (jsx: "react-jsx"):** React 직접 import 불필요
  ```typescript
  // ✅ 올바른 방식
  import { useState, useEffect } from 'react';
  
  // ❌ 불필요한 방식
  import React from 'react';
  ```
- **forwardRef 사용 시:** React 객체가 필요한 경우만 import
  ```typescript
  import * as React from 'react';
  ```

### TypeScript 오류 처리
- **사용하지 않는 매개변수:** `_` prefix 사용
  ```typescript
  // ✅ 올바른 방식
  function callback(_unused, data, _trans) { ... }
  ```
- **사용하지 않는 import:** 즉시 제거하여 빌드 오류 방지
  ```typescript
  // ❌ 잘못된 방식 - 사용하지 않는 import
  import { execSync } from 'child_process';
  import { useState } from 'react';
  
  // ✅ 올바른 방식 - 실제 사용하는 import만
  import { useState } from 'react';
  ```
- **사용하지 않는 변수/함수:** 완전히 제거하거나 `_` prefix 사용
  ```typescript
  // ❌ 잘못된 방식
  const unusedFunction = () => { ... };
  
  // ✅ 올바른 방식 1 - 완전 제거
  // (함수 자체를 삭제)
  
  // ✅ 올바른 방식 2 - prefix 사용 (나중에 사용 예정인 경우)
  const _unusedFunction = () => { ... };
  ```
- **타입 단언:** 구체적인 타입 사용, `as any` 최소화
- **프로젝트 시작 전:** `tsconfig.json` 설정 확인 필수

## 개발 순서

### 컴포넌트 개발 시
1. **의존성 먼저 설치**
2. **기본 유틸리티 함수 생성**
3. **타입 정의 작성**
4. **컴포넌트 구현**
5. **테스트 작성**
6. **빌드 및 통합 테스트**

### 파일 수정 시
- **큰 변경사항:** 한 번에 완전히 수정
- **JSX 구조 변경:** 전체 태그 매칭 확인
- **부분 수정 후:** 즉시 빌드 테스트

## 코드 품질

### 일관성 유지
- **기존 코드 패턴 확인** 후 동일한 스타일 적용
- **import 순서:** 라이브러리 → 상대경로 순
- **네이밍:** 프로젝트 컨벤션 따르기

### 오류 예방
- **작업 전 체크리스트:**
  - tsconfig.json 설정 확인
  - package.json React 버전 확인
  - 기존 컴포넌트 import 패턴 확인
  - 필요한 의존성 사전 설치

## 테스트 작성

### 테스트 파일 생성 시
- **React import:** 테스트에서도 프로젝트 설정에 맞게
- **경고 메시지:** 기능에 영향 없으면 무시 가능
- **모든 주요 기능:** 테스트 커버리지 확보

### Jest vs Vitest CLI 옵션 주의사항
- **Jest:** `--run` 옵션 없음. 단일 실행이 기본값
  ```bash
  # ✅ 올바른 방식
  npm test -- --testPathPattern=integration
  npm test -- --watchAll=false
  
  # ❌ 잘못된 방식
  npm test -- --run  # Jest에는 --run 옵션이 없음
  ```
- **Vitest:** `--run` 옵션으로 watch 모드 비활성화
  ```bash
  # Vitest에서만 사용 가능
  npm test -- --run
  ```
- **프로젝트 테스트 도구 확인:** `package.json`의 test 스크립트와 설정 파일 확인 필수

### Mock 작성 시 주의사항
- **ESM 모듈 Mock:** Dexie.js 같은 ESM 모듈은 Jest에서 직접 import 시 오류 발생
  ```typescript
  // ✅ 올바른 방식 - jest.mock으로 모듈 전체 모킹
  jest.mock('dexie', () => ({
    __esModule: true,
    default: class MockDexie { /* mock implementation */ }
  }));
  
  // ❌ 잘못된 방식 - 직접 import 후 모킹 시도
  import Dexie from 'dexie';
  jest.mock(Dexie);
  ```
- **Mock 객체 완성도:** 실제 사용되는 모든 메서드와 속성 포함 필수
  ```typescript
  // ✅ 완전한 Mock - 모든 필요한 메서드 포함
  this.settings = {
    add: jest.fn(),
    get: jest.fn(),
    hook: jest.fn().mockReturnThis(), // 체이닝 지원
    // ... 기타 필요한 메서드들
  };
  
  // ❌ 불완전한 Mock - 누락된 메서드로 인한 오류
  this.settings = {
    add: jest.fn(),
    // hook 메서드 누락으로 "Cannot read properties of undefined" 오류
  };
  ```
- **Mock 생성자 패턴:** 클래스 Mock 시 생성자에서 모든 속성 초기화
- **transformIgnorePatterns:** Jest 설정에서 ESM 모듈 변환 패턴 올바르게 설정

이 가이드라인을 따라 일관되고 효율적인 개발을 진행하세요.