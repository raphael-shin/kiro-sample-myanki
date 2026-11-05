# MyAnki

MyAnki is a flashcard study app that schedules reviews using the SM-2 spaced repetition algorithm. It runs entirely in the browser without a server, and all data is stored in the browser's IndexedDB. Only the optional AI card generation feature uses the network (Amazon Bedrock).

## Features

- **Deck management**: Create, edit, and delete decks, and display the card count per deck along with the new / learning / completed distribution
- **Card editing**: Inline editing directly in the table, search and status filters, sorting, bulk deletion after selecting multiple cards, and `Ctrl+Enter` to save / `Esc` to cancel
- **Study sessions**: SM-2 selects and shows the cards due for review today, and the 4-level rating of Again / Hard / Good / Easy calculates the next review date
- **Statistics**: Progress per deck and card, study history, and goal tracking (Recharts charts)
- **AI card generation (optional)**: Enter a topic and Amazon Bedrock's Claude model drafts cards, which you can preview before adding them to a deck
- **Other**: Dark/light theme and offline status indicator

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 18, TypeScript 5 (strict), Tailwind CSS 3 |
| Build | Vite 4 (`@vitejs/plugin-react-swc`) |
| State | Zustand 4 |
| Storage | Dexie 3 (IndexedDB) |
| Charts | Recharts 3 |
| AI | `@aws-sdk/client-bedrock-runtime` |
| Testing | Jest 29, ts-jest, React Testing Library, fake-indexeddb |

## Getting Started

Node.js 20 or higher is required (CI uses Node 20).

```bash
git clone https://github.com/raphael-shin/kiro-sample-myanki.git
cd kiro-sample-myanki
npm install
npm run dev
```

The dev server opens at <http://localhost:3000> and the browser launches automatically. Since `host: true` is set in `vite.config.ts`, you can also connect from other devices on the same network. To use it locally only, run `npm run dev -- --host 127.0.0.1`.

### Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Type-check with `tsc`, then build for production into `dist/` |
| `npm run preview` | Preview the build output |
| `npm test` | Run the full Jest suite (since it's Jest, there's no `--run` option) |
| `npm test -- --testPathPattern=DeckService` | Run only a specific test |
| `npm run test:watch` | Watch mode |
| `npm run lint` / `npm run lint:fix` | ESLint (see "Current Status" below) |

### Resetting Data

The data lives in the browser's IndexedDB database `MyAnkiDB`. To clear it, delete the IndexedDB from the Application tab of the developer tools. Since the app loads `src/utils/resetDatabase.ts`, you can also reset it from the developer tools console.

## AI Card Generation Setup

AI card generation has the browser call Bedrock `InvokeModel` directly with AWS credentials. In the AI generation modal on the card editing screen, open the AWS settings and enter your Access Key, Secret Key, and region (default `us-east-1`). The default model is `anthropic.claude-3-5-sonnet-20240620-v1:0`, and access to this model must be enabled in that region.

> **Security note**: The credentials you enter are not encrypted. Since `src/utils/encryption.ts` only does base64 encoding, anyone or any script with access to the same browser profile can read the keys. Use the keys of a least-privilege IAM user that only allows `bedrock:InvokeModel`, and do not enter them on shared devices.

## Project Structure

```
src/
├── App.tsx              # Screen switching (deck management / card editing / study / statistics)
├── algorithms/          # SM-2 implementation (spaced-repetition/SM2Algorithm.ts)
├── components/          # Shared UI (ui/: Button, Card, Input, etc., common/: theme, loading, offline indicator)
├── features/flashcard/  # Feature-specific screen components
│   └── components/      # DeckManager, CardEditor, StudySession, Statistics, AICardGeneration, CreateDeckModal
├── services/            # Business logic (Deck, Card, Study, SpacedRepetition, Statistics, AI generation, Bedrock, etc.)
├── store/               # Zustand stores (Deck, StudySession, Statistics, AICardGeneration, app)
├── db/                  # Dexie schema (MyAnkiDB.ts)
├── hooks/  types/  utils/
tests/                   # Service, store, and integration tests (some tests live alongside code in src/**/__tests__/)
.kiro/
└── steering/            # Product overview, tech stack, project structure
.github/workflows/       # CI
```

The IndexedDB tables are `settings`, `decks`, `cards`, `studySessions`, `spacedRepetitionData`, `offlineQueue`, `aiGenerationHistory`, and `awsSettings` (schema version 4).

## CI

`.github/workflows/ci.yml` runs build, lint, typecheck, and test on PRs and pushes to `main`. For now only build is required and the rest use `continue-on-error`. Each item will become required once its issue is resolved.

## Current Status

As of `main` on 2026-11-04.

| Item | Status |
| --- | --- |
| `npm run build` / `tsc --noEmit` | Passing |
| `npm test` | 92 of 755 failing ([#4](https://github.com/raphael-shin/kiro-sample-myanki/issues/4), being fixed in: [PR #9](https://github.com/raphael-shin/kiro-sample-myanki/pull/9)) |
| `npm run lint` | Does not run because the ESLint config file is missing ([#2](https://github.com/raphael-shin/kiro-sample-myanki/issues/2)) |

## Contributing

1. Create a feature branch from `main`.
2. Follow the rules in `AGENTS.md`. Work test-first with TDD, and split structural changes and behavioral changes into separate commits.
3. Write commit messages in the Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.).
4. When you open a PR, CI runs automatically.

## License

MIT
