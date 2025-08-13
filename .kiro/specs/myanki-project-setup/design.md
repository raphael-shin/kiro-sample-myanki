# Design Document

## Overview

MyAnki 프로젝트의 초기 구조는 현대적인 웹 개발 모범 사례를 따르며, 확장 가능하고 유지보수가 용이한 아키텍처를 제공합니다. 완전한 클라이언트 사이드 애플리케이션으로서 오프라인 기능을 지원하며, 개발자 경험을 최적화한 도구 체인을 구성합니다.

## Architecture

### 프로젝트 구조
```
myanki/
├── public/                 # 정적 자산
│   ├── favicon.ico
│   └── index.html
├── src/                    # 소스 코드
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/            # 기본 UI 컴포넌트
│   │   └── common/        # 공통 컴포넌트
│   ├── features/          # 기능별 모듈
│   ├── hooks/             # 커스텀 React 훅
│   ├── store/             # Zustand 상태 관리
│   ├── db/                # Dexie.js 데이터베이스 설정
│   ├── utils/             # 유틸리티 함수
│   ├── types/             # TypeScript 타입 정의
│   ├── styles/            # 글로벌 스타일
│   ├── App.tsx            # 메인 App 컴포넌트
│   ├── main.tsx           # 애플리케이션 진입점
│   └── vite-env.d.ts      # Vite 타입 정의
├── tests/                 # 테스트 파일
│   ├── __mocks__/         # 모킹 파일
│   ├── setup.ts           # 테스트 설정
│   └── utils/             # 테스트 유틸리티
├── .gitignore
├── package.json
├── tsconfig.json          # TypeScript 설정
├── tsconfig.node.json     # Node.js용 TypeScript 설정
├── vite.config.ts         # Vite 설정
├── tailwind.config.js     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
├── jest.config.js         # Jest 설정
└── README.md
```

### 기술 스택 통합 아키텍처

1. **빌드 시스템**: Vite가 중심이 되어 모든 도구들을 통합
2. **타입 시스템**: TypeScript가 전체 프로젝트의 타입 안정성 보장
3. **스타일링**: Tailwind CSS + PostCSS 파이프라인
4. **상태 관리**: Zustand를 통한 클라이언트 상태 관리
5. **데이터 저장**: Dexie.js를 통한 IndexedDB 추상화
6. **테스팅**: Jest + React Testing Library + MSW 통합

## Components and Interfaces

### 1. 빌드 도구 설정 (Vite)

**vite.config.ts 구성요소:**
- React 플러그인 설정
- TypeScript 지원
- Tailwind CSS 통합
- 개발 서버 설정
- 빌드 최적화 옵션

**주요 플러그인:**
- `@vitejs/plugin-react`: React 지원
- `@vitejs/plugin-react-swc`: 빠른 컴파일을 위한 SWC 사용

### 2. TypeScript 설정

**tsconfig.json 구성:**
- 엄격한 타입 검사 활성화
- 모던 ES 기능 지원
- React JSX 설정
- 절대 경로 임포트 설정

**tsconfig.node.json:**
- Vite 설정 파일용 별도 TypeScript 설정

### 3. 스타일링 시스템

**Tailwind CSS 설정:**
- 커스텀 테마 설정
- 플러그인 구성
- 퍼지(purge) 설정으로 번들 크기 최적화

**PostCSS 설정:**
- Tailwind CSS 처리
- Autoprefixer 적용

### 4. 상태 관리 (Zustand)

**스토어 구조:**
```typescript
interface AppState {
  // 애플리케이션 전역 상태
  theme: 'light' | 'dark';
  isLoading: boolean;
  // 상태 업데이트 액션들
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}
```

**타입 안전성:**
- TypeScript와 완전 통합
- 상태와 액션의 타입 정의
- 개발 도구 지원

### 5. 데이터베이스 (Dexie.js)

**데이터베이스 스키마:**
```typescript
class MyAnkiDB extends Dexie {
  constructor() {
    super('MyAnkiDB');
    this.version(1).stores({
      // 초기 스키마 정의는 향후 확장 예정
      settings: '++id, key, value'
    });
  }
}
```

**타입 정의:**
- 각 테이블에 대한 TypeScript 인터페이스
- CRUD 작업을 위한 타입 안전한 메서드

### 6. 테스팅 환경

**Jest 설정:**
- TypeScript 지원
- React Testing Library 통합
- MSW 설정

**테스트 유틸리티:**
- 커스텀 렌더 함수
- 모킹 헬퍼
- 테스트 데이터 팩토리

## Data Models

### 설정 파일 모델

**package.json 구조:**
```json
{
  "name": "myanki",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "dexie": "^3.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.0",
    "msw": "^1.3.0"
  }
}
```

### 기본 App 컴포넌트 구조

```typescript
interface AppProps {}

const App: React.FC<AppProps> = () => {
  // Zustand 상태 사용
  // Tailwind CSS 스타일링
  // 기본 레이아웃 구성
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 기본 앱 구조 */}
    </div>
  );
};
```

## Error Handling

### 빌드 시 오류 처리

1. **TypeScript 컴파일 오류**: 엄격한 타입 검사로 런타임 오류 방지
2. **Vite 빌드 오류**: 명확한 오류 메시지와 해결 방법 제시
3. **의존성 충돌**: package.json에서 호환 가능한 버전 명시

### 런타임 오류 처리

1. **React Error Boundary**: 컴포넌트 오류 격리
2. **데이터베이스 오류**: Dexie.js 오류 처리 패턴
3. **상태 관리 오류**: Zustand 상태 업데이트 실패 처리

### 개발 환경 오류 처리

1. **HMR 실패**: 자동 페이지 새로고침 폴백
2. **테스트 실패**: 명확한 실패 원인 표시
3. **린팅 오류**: 개발 시 즉시 피드백

## Testing Strategy

### 단위 테스트

1. **컴포넌트 테스트**: React Testing Library 사용
2. **유틸리티 함수 테스트**: Jest 단위 테스트
3. **상태 관리 테스트**: Zustand 스토어 테스트

### 통합 테스트

1. **데이터베이스 통합**: Dexie.js와 컴포넌트 연동 테스트
2. **상태-UI 통합**: 상태 변경에 따른 UI 업데이트 테스트

### 테스트 환경 설정

1. **Jest 설정**: TypeScript, React 지원
2. **MSW 설정**: API 모킹 (향후 확장용)
3. **테스트 유틸리티**: 공통 테스트 헬퍼 함수

### 테스트 실행 전략

1. **개발 중**: Watch 모드로 실시간 테스트
2. **빌드 전**: 전체 테스트 스위트 실행
3. **CI/CD**: 자동화된 테스트 실행 (향후 설정)

## Implementation Considerations

### 성능 최적화

1. **번들 크기**: Tailwind CSS 퍼지, Tree shaking
2. **개발 속도**: Vite HMR, SWC 컴파일러
3. **타입 검사**: 증분 컴파일, 병렬 처리

### 확장성

1. **모듈화**: 기능별 폴더 구조
2. **타입 안전성**: 엄격한 TypeScript 설정
3. **테스트 커버리지**: 포괄적인 테스트 전략

### 개발자 경험

1. **자동 완성**: TypeScript 지원
2. **즉시 피드백**: HMR, 실시간 오류 표시
3. **일관된 코드**: 설정 파일을 통한 표준화