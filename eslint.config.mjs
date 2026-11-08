// ─── [ NEURAL DECK v5.1 $ AI::GENERATED ] ───
import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'web-build/**',
      '.expo/**',
      'docs/.vitepress/dist/**',
      'docs/.vitepress/cache/**',
      'docs/public/**',
      'babel.config.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'App.tsx', 'index.ts'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': 'off', // Enforced accurately for TS + JSX by tsc (noUnusedLocals & noUnusedParameters)
      'no-undef': 'off', // Enforced strictly by TypeScript 7 (tsc --noEmit)
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
];
