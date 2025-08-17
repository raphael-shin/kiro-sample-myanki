# MyAnki

MyAnki는 SM-2 간격 반복(Spaced Repetition) 알고리즘을 활용한 플래시카드 학습 앱입니다. 완전한 클라이언트 사이드 웹 애플리케이션으로 개발되어 브라우저 IndexedDB를 활용하여 완전히 오프라인에서도 동작합니다.

## ✨ 주요 특징

- **🔄 SM-2 간격 반복 알고리즘**: 과학적으로 검증된 학습 최적화
- **📱 오프라인 우선**: IndexedDB를 통한 완전한 로컬 데이터 저장
- **🎨 반응형 디자인**: 다크/라이트 테마 지원 및 모바일 친화적 UI
- **⚡ 실시간 피드백**: 4단계 평가 시스템 (Again, Hard, Good, Easy)
- **📊 상세한 통계**: 학습 진행률 추적 및 성과 분석
- **🔒 타입 안전성**: 전체 TypeScript 구현으로 런타임 오류 방지

## 🚀 기술 스택

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite 4+ with SWC
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Dexie.js (IndexedDB wrapper)
- **Testing**: Jest + React Testing Library + fake-indexeddb
- **Algorithm**: SM-2 Spaced Repetition

## 📋 요구사항

- Node.js 16+ 
- npm 또는 yarn

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd myanki

# 의존성 설치
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:5173`으로 접속할 수 있습니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 4. 빌드 미리보기

```bash
npm run preview
```

## 🧪 테스트

### 전체 테스트 실행

```bash
npm test
```

### 테스트 Watch 모드

```bash
npm run test:watch
```

## 📁 프로젝트 구조

```
myanki/
├── public/                 # 정적 자산
├── src/                    # 소스 코드
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/            # 기본 UI 컴포넌트 (Button, Card, Input)
│   │   └── common/        # 공통 컴포넌트 (ThemeToggle, LoadingSpinner)
│   ├── features/          # 기능별 모듈
│   │   └── flashcard/     # 플래시카드 기능
│   │       └── components/ # 기능별 컴포넌트
│   │           ├── DeckManager/     # 덱 관리
│   │           ├── CardEditor/      # 카드 편집
│   │           ├── StudySession/    # 학습 세션
│   │           ├── Statistics/      # 통계 및 진행률
│   │           └── CreateDeckModal/ # 덱 생성 모달
│   ├── algorithms/        # 알고리즘 구현
│   │   └── spaced-repetition/ # SM-2 알고리즘
│   ├── services/          # 비즈니스 로직 서비스
│   ├── hooks/             # 커스텀 React 훅
│   ├── store/             # Zustand 상태 관리
│   ├── db/                # Dexie.js 데이터베이스 설정
│   ├── utils/             # 유틸리티 함수
│   ├── types/             # TypeScript 타입 정의
│   ├── App.tsx            # 메인 App 컴포넌트
│   └── main.tsx           # 애플리케이션 진입점
├── tests/                 # 테스트 파일
│   ├── __mocks__/         # 테스트 모킹
│   ├── components/        # 컴포넌트 테스트
│   ├── services/          # 서비스 테스트
│   ├── integration/       # 통합 테스트
│   └── utils/             # 테스트 유틸리티
└── ...설정 파일들
```

## 🎯 구현된 기능

### 📚 덱 관리 시스템
- 플래시카드 덱 생성, 편집, 삭제
- 덱별 통계 정보 (총 카드 수, 학습 진행률)
- 덱 선택 및 다중 작업 지원

### 📝 카드 편집 시스템
- Basic 타입 노트 지원 (앞면/뒷면)
- 실시간 카드 미리보기
- 카드 유효성 검사 및 에러 처리
- 카드 목록 관리 및 필터링

### 🎓 학습 세션 관리
- SM-2 알고리즘 기반 학습 스케줄링
- 4단계 답변 평가 시스템
- 실시간 학습 진행률 표시
- 세션 통계 및 성과 분석

### 📊 통계 및 진행률 추적
- 덱별 상세 학습 통계
- 카드별 학습 진행률 (반복 횟수, 용이도 인수)
- 시각적 진행률 바 및 백분율 표시
- 학습 기록 및 히스토리

### 🎨 사용자 인터페이스
- 다크/라이트 테마 자동 전환
- 오프라인 상태 표시
- 반응형 레이아웃 (모바일/데스크톱)
- 직관적인 네비게이션

## 🔧 기술적 특징

- **완전한 오프라인 지원**: IndexedDB를 통한 로컬 데이터 저장
- **성능 최적화**: Vite HMR 및 React 18+ 최적화
- **타입 안전성**: 엄격한 TypeScript 설정
- **테스트 커버리지**: 포괄적인 단위 및 통합 테스트
- **상태 관리**: Zustand를 활용한 효율적인 전역 상태 관리

## 📝 개발 가이드

### 아키텍처 패턴
- **Feature-based 구조**: 기능별로 컴포넌트 그룹화
- **Service Layer**: 비즈니스 로직과 데이터 액세스 분리
- **Custom Hooks**: 재사용 가능한 로직 추상화

### 컴포넌트 개발
- 모든 컴포넌트는 TypeScript로 작성
- Tailwind CSS를 사용한 스타일링
- React Testing Library를 사용한 테스트 작성
- forwardRef를 활용한 UI 컴포넌트 구현

### 상태 관리
- Zustand를 사용한 전역 상태 관리
- 선택자 패턴으로 최적화된 리렌더링
- 타입 안전한 상태 업데이트

### 데이터베이스
- Dexie.js를 통한 IndexedDB 추상화
- 자동 타임스탬프 및 트랜잭션 지원
- 타입 안전한 데이터베이스 스키마

### 테스트 전략
- **단위 테스트**: 개별 컴포넌트 및 함수
- **통합 테스트**: 전체 워크플로우 검증
- **서비스 테스트**: 비즈니스 로직 및 데이터베이스 통합
- **알고리즘 테스트**: SM-2 알고리즘 검증

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.