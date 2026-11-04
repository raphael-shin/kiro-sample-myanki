# AGENTS.md

이 저장소에서 작업하는 코딩 에이전트용 안내입니다. 사람용 소개는 `README.md`를 보세요. 답변, 커밋 메시지, PR 설명은 한국어로 씁니다.

## 프로젝트 요약

MyAnki는 SM-2 간격 반복 플래시카드 앱입니다. React 18, TypeScript(strict), Vite 4, Zustand, Dexie(IndexedDB)로 만들었고 백엔드가 없습니다. 네트워크를 쓰는 곳은 AI 카드 생성(브라우저에서 Amazon Bedrock 직접 호출) 하나뿐입니다.

## 명령어

```bash
npm install                                  # 의존성 설치 (CI는 npm ci, Node 20)
npm run dev                                  # 개발 서버, 포트 3000 (5173 아님)
npm run build                                # tsc 타입 검사 + vite build
npx tsc --noEmit                             # 타입 검사만
npm test                                     # Jest 전체
npm test -- --testPathPattern=<이름>          # 일부만 실행
```

- 테스트 러너는 **Jest**입니다. `--run`은 Vitest 옵션이라 Jest에서는 에러가 납니다.
- `npm run lint`는 ESLint 설정 파일이 없어서 지금은 실행되지 않습니다(#2). 린트 통과를 완료 조건으로 삼지 마세요. 설정을 추가하는 작업이라면 예외입니다.

## 완료 기준과 현재 기준선

변경을 마치기 전에 `npx tsc --noEmit`, `npm run build`, `npm test`를 실행합니다.

- build와 typecheck는 `main`에서 통과합니다. 이 둘을 깨뜨리면 안 됩니다.
- 테스트는 `main`에서 이미 92개가 실패합니다(#4, PR #9에서 수정 중). 실패 수가 **늘지 않았는지** 비교하세요. 작업 전에 한 번 돌려 기준선을 기록하고, 작업 후 새로 생긴 실패가 없는지 확인합니다.
- CI(`.github/workflows/ci.yml`)에서 필수 체크는 build뿐이고 lint·typecheck·test는 `continue-on-error`입니다.

## 코드 구조

| 경로 | 역할 |
| --- | --- |
| `src/App.tsx` | 라우터 없이 `AppView` 상태(`deck-management`, `card-editor`, `study-session`, `card-stats`)로 화면 전환 |
| `src/features/flashcard/components/` | 화면 단위 컴포넌트: `DeckManager`, `CardEditor`, `StudySession`, `Statistics`, `AICardGeneration`, `CreateDeckModal` |
| `src/components/ui/`, `src/components/common/` | 공용 UI 기본 요소와 앱 공통 컴포넌트 |
| `src/services/` | 비즈니스 로직. DB를 생성자로 주입받는 클래스(`new DeckService(db)`) |
| `src/store/` | Zustand 스토어. 컴포넌트는 서비스를 직접 부르지 말고 스토어를 거칩니다 |
| `src/db/MyAnkiDB.ts` | Dexie 스키마와 `db` 싱글턴, 생성·수정 시각 자동 기록 훅 |
| `src/algorithms/spaced-repetition/SM2Algorithm.ts` | SM-2 본체. `src/algorithms/sm2-algorithm.ts`의 `calculateEaseFactor`를 씁니다 |
| `src/types/` | 도메인 타입, `errors.ts`의 `MyAnkiError`/`ErrorCode` |
| `.kiro/steering/` | `product.md`(제품 개요), `tech.md`(기술 스택), `structure.md`(디렉터리 구조) |

## 규칙

### 작업 방식

- TDD로 작업합니다. 실패하는 테스트 하나를 먼저 쓰고, 통과할 만큼만 구현한 뒤 리팩터링합니다.
- 구조 변경(이름 변경, 추출, 이동)과 동작 변경은 커밋을 나누고, 구조 변경을 먼저 합니다.
- 커밋은 Conventional Commits 형식(`feat:`, `fix:`, `refactor:`, `test:`, `docs:` 등)으로 씁니다.
- `.kiro/steering/` 문서와 코드가 다르면 코드를 따릅니다. 예를 들어 `tech.md`에는 포트가 5173으로 적혀 있지만 실제 포트는 `vite.config.ts`의 3000입니다.

### TypeScript / React

- `jsx: react-jsx` 설정이라 `import React from 'react'`를 쓰지 않습니다. 필요한 것만 named import 합니다. `forwardRef`처럼 네임스페이스가 필요할 때만 `import * as React from 'react'`를 씁니다.
- `noUnusedLocals`와 `noUnusedParameters`가 켜져 있습니다. 쓰지 않는 import와 변수는 지우고, 시그니처상 필요한 매개변수에는 `_`를 붙입니다.
- import는 `@/` 별칭(`@/services/...`, `@/types/...`)을 씁니다. `tsconfig.json`의 `paths`와 `jest.config.mjs`의 `moduleNameMapper`가 함께 맞춰져 있어야 합니다.
- 스타일은 Tailwind를 쓰고, 클래스 병합은 `src/utils/cn.ts`로 합니다.

### 데이터베이스 (Dexie)

- 스키마를 바꿀 때는 기존 `this.version(n)` 블록을 수정하지 말고 `this.version(n + 1)`을 새로 추가합니다. 현재 최신 버전은 4입니다. 기존 사용자 브라우저의 데이터를 이전해야 하기 때문입니다.
- 여러 테이블을 함께 바꾸는 작업은 `db.transaction('rw', [...], async (tx) => ...)`로 묶고, 콜백 안에서는 `this.db`가 아니라 `tx.<table>`을 씁니다. 테스트 목이 `tx`에 걸려 있습니다.
- 서비스에서 에러를 던질 때는 `MyAnkiError(ErrorCode.X, message, details)`를 씁니다. 테스트가 에러 메시지 문자열을 검사하는 곳이 많으니, 메시지를 바꾸면 해당 테스트도 같이 고칩니다.

### 테스트

- 테스트는 두 곳에 있습니다. `src/**/__tests__/`에는 컴포넌트·스토어·알고리즘 테스트가 함께 있고, `tests/`에는 서비스·통합 테스트와 공용 유틸이 있습니다. Jest는 두 루트를 모두 읽습니다. 새 테스트는 대상 코드 근처의 기존 위치를 따라 둡니다.
- IndexedDB는 `fake-indexeddb`로 대체합니다(`src/setupTests.ts`). 공용 목과 테스트 데이터는 `tests/__mocks__/`, `tests/utils/test-data.ts`, `tests/utils/test-utils.tsx`에 있습니다.
- Dexie 메서드 체인을 목으로 만들 때는 실제로 호출하는 체인 전체(`where().equals().delete()` 등)를 구현합니다.

## 보안

- AI 카드 생성용 AWS 자격 증명은 `awsSettings` 테이블에 저장되는데, `src/utils/encryption.ts`는 base64 인코딩만 합니다. 이 함수를 "암호화"로 설명하거나 더 안전하다고 가정하지 마세요. 자격 증명 저장 방식을 바꾸는 작업은 사람의 확인을 받습니다.
- 실제 AWS 키나 토큰을 코드, 테스트 픽스처, 로그, 커밋에 넣지 않습니다. `BedrockClient`는 요청 본문을 `console.log`로 남기므로 자격 증명이 로그에 섞이지 않게 합니다.
- 개발 서버는 `host: true`로 모든 인터페이스에서 받습니다. 에이전트가 서버를 띄울 때는 `npm run dev -- --host 127.0.0.1`로 로컬에만 바인딩합니다.

## 브랜치와 PR

- `main`에 직접 push하지 않습니다. 기능 브랜치에서 PR을 엽니다.
