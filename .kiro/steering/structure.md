# Project Structure

## Directory Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives (Button, Card, Input)
│   └── common/         # Common app components (ThemeToggle, LoadingSpinner)
├── features/           # Feature-based modules
│   └── flashcard/      # Flashcard feature implementation
│       ├── components/ # Feature-specific components
│       │   ├── DeckManager/     # Deck management components
│       │   ├── CardEditor/      # Card editing components
│       │   ├── StudySession/    # Study session components
│       │   ├── Statistics/      # Statistics and progress components
│       │   └── CreateDeckModal/ # Deck creation modal
│       └── hooks/      # Feature-specific hooks
├── algorithms/         # Algorithm implementations
│   └── spaced-repetition/  # SM-2 algorithm implementation
├── services/           # Business logic services
├── store/              # Zustand state management
├── db/                 # Dexie.js database configuration
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles
├── App.tsx             # Main application component with routing
└── main.tsx            # Application entry point

tests/
├── __mocks__/          # Test mocks (MSW handlers, browser setup)
├── components/         # Component tests
│   ├── DeckManager/    # Deck management component tests
│   ├── CardEditor/     # Card editor component tests
│   ├── StudySession/   # Study session component tests
│   └── Statistics/     # Statistics component tests
├── db/                 # Database tests
├── hooks/              # Hook tests
├── integration/        # Integration tests
├── store/              # Store tests
├── services/           # Service layer tests
├── algorithms/         # Algorithm tests
└── utils/              # Utility tests and test helpers
```

## Architecture Patterns

### Component Organization
- **UI Components**: Basic, reusable primitives in `src/components/ui/`
- **Common Components**: App-specific shared components in `src/components/common/`
- **Feature Components**: Feature-specific components in `src/features/flashcard/components/`
- **Component Grouping**: Related components grouped by functionality (DeckManager, CardEditor, etc.)

### State Management
- **Global State**: Zustand stores in `src/store/`
  - `DeckStore`: Deck management state
  - `StudySessionStore`: Study session state
  - `appStore`: Application-wide state (theme, loading)
- **Selectors**: Export optimized selectors from store files
- **Local State**: Use React hooks for component-specific state

### Algorithm Layer
- **SM-2 Implementation**: Spaced repetition algorithm in `src/algorithms/spaced-repetition/`
- **Algorithm Types**: Type definitions for algorithm interfaces
- **Utility Functions**: Date calculations and validation utilities

### Service Layer
- **Business Logic**: Service classes for data operations
  - `DeckService`: Deck CRUD operations
  - `CardService`: Card management
  - `SpacedRepetitionService`: Algorithm integration
- **Database Integration**: Services handle database interactions
- **Error Handling**: Centralized error handling in services

### Database Layer
- **Schema**: Defined in `src/db/MyAnkiDB.ts`
- **Extended Schema**: Includes spaced repetition data tables
- **Types**: Database types in `src/types/`
- **Singleton**: Single database instance exported as `db`

### Type Definitions
- **Flashcard Types**: Core flashcard types in `src/types/flashcard.ts`
- **Database Types**: Database schema types in `src/types/database.ts`
- **Store Types**: State management types in `src/types/store.ts`
- **Algorithm Types**: Spaced repetition algorithm types

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (e.g., `DeckManager.tsx`, `StudyInterface.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSpacedRepetition.ts`)
- **Services**: PascalCase with `Service` suffix (e.g., `DeckService.ts`)
- **Algorithms**: PascalCase with `Algorithm` suffix (e.g., `SM2Algorithm.ts`)
- **Utils**: camelCase (e.g., `dateUtils.ts`, `validation.ts`)
- **Types**: camelCase (e.g., `flashcard.ts`, `database.ts`)

### Code Conventions
- **Components**: PascalCase with forwardRef for UI primitives
- **Hooks**: camelCase starting with `use`
- **Services**: PascalCase class names
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Import Patterns

### React Imports
- Use named imports: `import { useState, useEffect } from 'react'`
- Import React namespace only when needed: `import * as React from 'react'`

### Path Aliases
- Use `@/` prefix for absolute imports from src
- Prefer absolute imports over relative for better maintainability

### Component Exports
- Use named exports for components
- Include `displayName` for forwardRef components
- Export types alongside components when needed

## Testing Structure

### Test Organization
- Mirror source structure in `tests/` directory
- Use `.test.tsx` for component tests
- Use `.test.ts` for utility/service/algorithm tests
- Integration tests in dedicated `integration/` folder

### Test Categories
- **Unit Tests**: Individual component and function tests
- **Integration Tests**: Full workflow and error handling tests
- **Service Tests**: Business logic and database integration tests
- **Algorithm Tests**: Spaced repetition algorithm validation tests

### Test Utilities
- Shared test utilities in `tests/utils/`
- Mock data in `tests/utils/test-data.ts`
- Custom render functions in `tests/utils/test-utils.tsx`
- Database mocking with `fake-indexeddb`