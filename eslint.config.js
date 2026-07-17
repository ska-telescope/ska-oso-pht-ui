import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';

export default [
  { settings: { react: { version: 'detect' } } },
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: globals.browser } },
  { ignores: ['node_modules', 'coverage', 'build', 'dist', 'src/env.js'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  { ...reactPlugin.configs.flat.recommended },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '_' }],
      // Pre-existing patterns — warn rather than block until codebase is cleaned up
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-case-declarations': 'warn',
      'no-empty': 'warn'
    }
  }
];
