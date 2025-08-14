# 기술 스택

## 핵심 기술

- **프론트엔드 프레임워크**: React 18+ (TypeScript 포함)
- **빌드 도구**: Vite 4+ (빠른 컴파일을 위한 SWC 사용)
- **스타일링**: Tailwind CSS (커스텀 디자인 시스템 포함)
- **상태 관리**: Zustand (전역 상태 관리)
- **데이터베이스**: Dexie.js (IndexedDB 래퍼, 오프라인 데이터 영속성)
- **테스팅**: Jest + React Testing Library + MSW (API 모킹)

## 개발 도구

- **패키지 관리자**: npm
- **린팅**: ESLint (TypeScript 규칙 포함)
- **타입 검사**: TypeScript 5+ (엄격 모드)
- **CSS 처리**: PostCSS (Autoprefixer 포함)

## 주요 라이브러리

- **UI 유틸리티**: clsx + tailwind-merge (클래스 관리)
- **테스팅 유틸리티**: fake-indexeddb (데이터베이스 테스팅)
- **개발**: Vite 플러그인 (React 및 SWC용)

## 일반적인 명령어

### 개발
```bash
npm run dev          # 개발 서버 시작 (포트 3000)
npm run build        # 프로덕션 빌드
npm run preview      # 프로덕션 빌드 미리보기
```

### 테스팅
```bash
npm test             # 모든 테스트 실행 (Jest)
npm run test:watch   # 테스트를 감시 모드로 실행
```

### 코드 품질
```bash
npm run lint         # ESLint 실행
npm run lint:fix     # ESLint 문제 자동 수정
```

## 빌드 구성

- **타겟**: ES2020 (최신 브라우저 지원)
- **모듈 시스템**: ESNext (번들러 해석 포함)
- **JSX**: react-jsx (React import 불필요)
- **소스 맵**: 디버깅을 위해 활성화됨
- **코드 분할**: React, Zustand, Dexie용 벤더 청크

## 경로 별칭

프로젝트는 @ 접두사를 사용한 절대 경로 가져오기를 사용합니다:
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/store/*` → `src/store/*`
- `@/db/*` → `src/db/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`