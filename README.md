# MyAnki

MyAnki는 간격 반복(Spaced Repetition) 알고리즘을 활용한 플래시카드 학습 앱입니다. 완전한 클라이언트 사이드 웹 애플리케이션으로 개발되어 브라우저 로컬 스토리지를 활용하여 오프라인에서도 동작합니다.

## 🚀 기술 스택

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Dexie.js (IndexedDB wrapper)
- **Testing**: Jest + React Testing Library + MSW

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
│   └── main.tsx           # 애플리케이션 진입점
├── tests/                 # 테스트 파일
└── ...설정 파일들
```

## 🎯 주요 특징

- **오프라인 지원**: IndexedDB를 통한 로컬 데이터 저장
- **반응형 디자인**: Tailwind CSS를 활용한 모바일 친화적 UI
- **타입 안전성**: TypeScript를 통한 컴파일 타임 오류 방지
- **빠른 개발**: Vite의 HMR을 통한 즉시 피드백
- **테스트 커버리지**: 포괄적인 단위 및 통합 테스트

## 📝 개발 가이드

### 컴포넌트 개발
- 모든 컴포넌트는 TypeScript로 작성
- Tailwind CSS를 사용한 스타일링
- React Testing Library를 사용한 테스트 작성

### 상태 관리
- Zustand를 사용한 전역 상태 관리
- 타입 안전한 상태 업데이트

### 데이터베이스
- Dexie.js를 통한 IndexedDB 추상화
- 타입 안전한 데이터베이스 스키마

## 🤝 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.