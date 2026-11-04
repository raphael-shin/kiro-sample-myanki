# MyAnki

MyAnki는 SM-2 간격 반복 알고리즘으로 복습 일정을 잡는 플래시카드 학습 앱입니다. 서버 없이 브라우저에서만 동작하며, 모든 데이터는 브라우저 IndexedDB에 저장됩니다. 선택 기능인 AI 카드 생성만 네트워크(Amazon Bedrock)를 사용합니다.

## 기능

- **덱 관리**: 덱 생성·수정·삭제, 덱별 카드 수와 신규/학습 중/완료 분포 표시
- **카드 편집**: 표에서 바로 고치는 인라인 편집, 검색과 상태 필터, 정렬, 여러 장 선택 후 일괄 삭제, `Ctrl+Enter` 저장 / `Esc` 취소
- **학습 세션**: SM-2로 오늘 복습할 카드를 골라 보여 주고, Again / Hard / Good / Easy 4단계 평가로 다음 복습일을 계산
- **통계**: 덱·카드별 진행률, 학습 기록, 목표 추적 (Recharts 차트)
- **AI 카드 생성 (선택)**: 주제를 입력하면 Amazon Bedrock의 Claude 모델이 카드 초안을 만들고, 미리 본 뒤 덱에 추가
- **기타**: 다크/라이트 테마, 오프라인 상태 표시

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| UI | React 18, TypeScript 5 (strict), Tailwind CSS 3 |
| 빌드 | Vite 4 (`@vitejs/plugin-react-swc`) |
| 상태 | Zustand 4 |
| 저장소 | Dexie 3 (IndexedDB) |
| 차트 | Recharts 3 |
| AI | `@aws-sdk/client-bedrock-runtime` |
| 테스트 | Jest 29, ts-jest, React Testing Library, fake-indexeddb |

## 시작하기

Node.js 20 이상이 필요합니다(CI가 Node 20을 사용합니다).

```bash
git clone https://github.com/raphael-shin/kiro-sample-myanki.git
cd kiro-sample-myanki
npm install
npm run dev
```

개발 서버는 <http://localhost:3000>에서 열리고 브라우저가 자동으로 뜹니다. `vite.config.ts`에 `host: true`가 설정되어 있어 같은 네트워크의 다른 기기에서도 접속할 수 있습니다. 로컬에서만 쓰려면 `npm run dev -- --host 127.0.0.1`로 실행하세요.

### 명령어

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (포트 3000) |
| `npm run build` | `tsc` 타입 검사 후 `dist/`로 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm test` | Jest 전체 실행 (Jest라서 `--run` 옵션은 없습니다) |
| `npm test -- --testPathPattern=DeckService` | 특정 테스트만 실행 |
| `npm run test:watch` | 감시 모드 |
| `npm run lint` / `npm run lint:fix` | ESLint (아래 "현재 상태" 참고) |

### 데이터 초기화

데이터는 브라우저 IndexedDB의 `MyAnkiDB` 데이터베이스에 있습니다. 지우려면 개발자 도구의 Application 탭에서 IndexedDB를 삭제하세요. 앱이 `src/utils/resetDatabase.ts`를 불러오므로 개발자 도구 콘솔에서도 초기화할 수 있습니다.

## AI 카드 생성 설정

AI 카드 생성은 브라우저가 AWS 자격 증명으로 Bedrock `InvokeModel`을 직접 호출합니다. 카드 편집 화면의 AI 생성 모달에서 AWS 설정을 열어 Access Key, Secret Key, 리전(기본 `us-east-1`)을 입력합니다. 기본 모델은 `anthropic.claude-3-5-sonnet-20240620-v1:0`이며, 해당 리전에서 이 모델의 접근 권한이 활성화되어 있어야 합니다.

> **보안 주의**: 입력한 자격 증명은 암호화되지 않습니다. `src/utils/encryption.ts`는 base64 인코딩만 하므로, 같은 브라우저 프로필에 접근할 수 있는 사람이나 스크립트는 키를 읽을 수 있습니다. `bedrock:InvokeModel`만 허용한 최소 권한 IAM 사용자의 키를 쓰고, 공용 기기에는 입력하지 마세요.

## 프로젝트 구조

```
src/
├── App.tsx              # 화면 전환 (덱 관리 / 카드 편집 / 학습 / 통계)
├── algorithms/          # SM-2 구현 (spaced-repetition/SM2Algorithm.ts)
├── components/          # 공용 UI (ui/: Button·Card·Input 등, common/: 테마·로딩·오프라인 표시)
├── features/flashcard/  # 기능별 화면 컴포넌트
│   └── components/      # DeckManager, CardEditor, StudySession, Statistics, AICardGeneration, CreateDeckModal
├── services/            # 비즈니스 로직 (Deck, Card, Study, SpacedRepetition, Statistics, AI 생성, Bedrock 등)
├── store/               # Zustand 스토어 (Deck, StudySession, Statistics, AICardGeneration, app)
├── db/                  # Dexie 스키마 (MyAnkiDB.ts)
├── hooks/  types/  utils/
tests/                   # 서비스·스토어·통합 테스트 (일부 테스트는 src/**/__tests__/에 함께 있음)
.kiro/
└── steering/            # 제품 개요, 기술 스택, 프로젝트 구조
.github/workflows/       # CI
```

IndexedDB 테이블은 `settings`, `decks`, `cards`, `studySessions`, `spacedRepetitionData`, `offlineQueue`, `aiGenerationHistory`, `awsSettings`입니다(스키마 버전 4).

## CI

`.github/workflows/ci.yml`이 PR과 `main` 푸시에서 build, lint, typecheck, test를 돌립니다. 지금은 build만 필수이고 나머지는 `continue-on-error`입니다. 각 항목의 이슈가 해결되면 필수로 바꿉니다.

## 현재 상태

2026-11-04 `main` 기준입니다.

| 항목 | 상태 |
| --- | --- |
| `npm run build` / `tsc --noEmit` | 통과 |
| `npm test` | 755개 중 92개 실패 ([#4](https://github.com/raphael-shin/kiro-sample-myanki/issues/4), 수정 중: [PR #9](https://github.com/raphael-shin/kiro-sample-myanki/pull/9)) |
| `npm run lint` | ESLint 설정 파일이 없어 실행 안 됨 ([#2](https://github.com/raphael-shin/kiro-sample-myanki/issues/2)) |

## 기여하기

1. `main`에서 기능 브랜치를 만듭니다.
2. `AGENTS.md`의 규칙을 따릅니다. 테스트를 먼저 쓰는 TDD로 작업하고, 구조 변경과 동작 변경은 커밋을 나눕니다.
3. 커밋 메시지는 Conventional Commits 형식(`feat:`, `fix:`, `docs:` 등)으로 씁니다.
4. PR을 열면 CI가 자동으로 실행됩니다.

## 라이선스

MIT
