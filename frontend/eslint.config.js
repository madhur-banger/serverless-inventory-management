import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  // Base JS rules
  js.configs.recommended,

  // Global browser environment
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // TypeScript support
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,

         // Fix TS DOM types (important)
      RequestInit: 'readonly',
      HeadersInit: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },

  // React + Hooks
  {
    files: ['**/*.tsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      globals: {
        React: 'readonly', // fixes "React is not defined"
        ...globals.browser,
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // React 17+
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },


  {
    ignores: [
      'dist',
      'node_modules',
      '*.config.js',
      'vite.config.ts',
    ],
  },
];
