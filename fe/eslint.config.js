import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import tsPlugin from '@typescript-eslint/eslint-plugin'; // Plugin cho TypeScript ESLint
import tsParser from '@typescript-eslint/parser'; // Parser cho TypeScript

export default [
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser, // Sử dụng parser cho TypeScript
      ecmaVersion: 2020,
      globals: globals.browser,
      sourceType: 'module',
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/recommended', // Khuyến nghị cho TypeScript ESLint
      'plugin:prettier/recommended', // Khuyến nghị cho Prettier
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': [
        'warn',
        {
          bracketSpacing: true,
          singleQuote: true,
          printWidth: 80,
          trailingComma: 'es5',
          semi: true,
          tabWidth: 2,
          arrowParens: 'avoid',
          jsxSingleQuote: false,
          plugins: ['prettier-plugin-tailwindcss'],
        },
      ],
    },
  },
];
