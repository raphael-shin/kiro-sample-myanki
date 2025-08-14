# Project Structure

## Directory Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives (Button, Card, Input)
│   └── common/         # Common app components (ThemeToggle, LoadingSpinner)
├── features/           # Feature-based modules (empty, ready for expansion)
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── db/                 # Dexie.js database configuration
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles (currently empty)
├── App.tsx             # Main application component
└── main.tsx            # Application entry point

tests/
├── __mocks__/          # Test mocks (MSW handlers, browser setup)
├── components/         # Component tests
├── db/                 # Database tests
├── hooks/              # Hook tests
├── integration/        # Integration tests
├── store/              # Store tests
└── utils/              # Utility tests and test helpers
```

## Architecture Patterns

### Component Organization
- **UI Components**: Basic, reusable primitives in `src/components/ui/`
- **Common Components**: App-specific shared components in `src/components/common/`
- **Feature Components**: Feature-specific components should go in `src/features/[feature]/components/`

### State Management
- **Global State**: Zustand store in `src/store/`
- **Selectors**: Export optimized selectors from store files
- **Local State**: Use React hooks for component-specific state

### Database Layer
- **Schema**: Defined in `src/db/MyAnkiDB.ts`
- **Types**: Database types in `src/types/database.ts`
- **Singleton**: Single database instance exported as `db`

### Type Definitions
- **Common**: Shared types in `src/types/common.ts`
- **Components**: Component prop types in `src/types/components.ts`
- **Database**: Database schema types in `src/types/database.ts`
- **Store**: State management types in `src/types/store.ts`

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (e.g., `Button.tsx`, `ThemeToggle.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useToggle.ts`)
- **Utils**: camelCase (e.g., `format.ts`, `validation.ts`)
- **Types**: camelCase (e.g., `database.ts`, `store.ts`)

### Code Conventions
- **Components**: PascalCase with forwardRef for UI primitives
- **Hooks**: camelCase starting with `use`
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
- Use `.test.ts` for utility/hook tests
- Integration tests in dedicated `integration/` folder

### Test Utilities
- Shared test utilities in `tests/utils/`
- Mock data in `tests/utils/test-data.ts`
- Custom render functions in `tests/utils/test-utils.tsx`