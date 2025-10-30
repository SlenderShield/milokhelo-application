// eslint.config.js
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default [
  // Base recommended rules
  js.configs.recommended,

  // ----- Prettier integration -----
  prettierConfig, // turns off all ESLint styling rules that conflict with Prettier
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', // treat Prettier issues as ESLint errors
    },
  },

  // ----- Import plugin (optional but very useful) -----
  {
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      'import/order': 'warn',
      'import/no-unresolved': 'error',
    },
  },

  // ----- Your project files -----
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Add globals if you don’t use environments below
        // e.g. node: true, browser: true, es2021: true
      },
    },
    rules: {
      // Your custom rules go here
      eqeqeq: 'warn',
      'no-console': 'warn',
    },
  },

  // ----- TypeScript (optional) -----
  ...compat.extends('plugin:@typescript-eslint/recommended').map(config => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),

  // ----- React (optional) -----
  ...compat.extends('plugin:react/recommended', 'plugin:react-hooks/recommended').map(config => ({
    ...config,
    files: ['**/*.{jsx,tsx}'],
    settings: { react: { version: 'detect' } },
  })),
];
