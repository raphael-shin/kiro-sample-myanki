module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'coverage', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Matches tsc's noUnusedParameters: a leading underscore marks a parameter
    // that the signature requires but the body does not use (see AGENTS.md).
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['tests/**/*.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}', 'src/setupTests.ts'],
      env: { jest: true, node: true },
      rules: {
        // Test files are never served through Vite's fast refresh.
        'react-refresh/only-export-components': 'off',
        // jest.mock() factories are hoisted above imports, so they can only load
        // the shared mock modules with require().
        '@typescript-eslint/no-var-requires': ['error', { allow: ['/__mocks__/'] }],
      },
    },
  ],
};
