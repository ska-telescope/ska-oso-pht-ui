import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: globals.browser } },
  { ignores: ['node_modules', 'coverage', 'build', 'dist', 'src/env.js'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintReact.configs['recommended-typescript'],
  reactHooks.configs.flat.recommended,
  {
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@eslint-react/error-boundaries': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/set-state-in-render': 'off',
      '@eslint-react/static-components': 'off',
      '@eslint-react/unsupported-syntax': 'off',
      '@eslint-react/use-memo': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '_' }],
      // Pre-existing patterns — warn rather than block until codebase is cleaned up
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-case-declarations': 'warn',
      'no-empty': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/globals': 'warn'
    }
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@eslint-react/no-unnecessary-use-prefix': 'off'
    }
  }
];
