/**
 * eslint.config.js — ClinicOS flat ESLint config (ESLint 9).
 *
 * Purpose: the single, machine-checkable enforcement of the ClinicOS engineering
 * laws. It composes JS + TypeScript (type-checked) + React + a11y + import-hygiene
 * + architecture-boundary rules into one flat config.
 *
 * Governed by:
 *   - docs/architecture/DependencyRules.md  (Part 6 — the import matrix & boundaries)
 *   - docs/Naming-Convention.md             (file/symbol conventions)
 *   - docs/Coding-Standards.md              (style)
 *
 * Layer order (downward-only): app → processes → modules → entities → shared.
 * A layer/element may be imported ONLY via its public `index.ts` entry point.
 *
 * Notes:
 *   - `eslint-config-prettier` is composed LAST so formatting never fights the linter.
 *   - `eslint-plugin-i18next` (no-literal-string) runs on `src/**` TSX only and is
 *     disabled for tests / config / stories / constants, where literals are expected.
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import boundaries from 'eslint-plugin-boundaries';
import i18next from 'eslint-plugin-i18next';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // ---------------------------------------------------------------------------
  // 0) Global ignores — never lint build output, vendored, or generated files.
  // ---------------------------------------------------------------------------
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '**/*.config.*',
      'stats.html',
      'playwright-report/**',
      'test-results/**',
      '.husky/**',
      'scripts/**',
      'plopfile.js',
      '.storybook/**',
      'storybook-static/**',
      'e2e/**',
      'playwright-report/**',
    ],
  },

  // ---------------------------------------------------------------------------
  // 1) Base JS + TypeScript (type-checked) recommended rule sets.
  // ---------------------------------------------------------------------------
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // ---------------------------------------------------------------------------
  // 2) Language options + TS project service (type-aware linting for src).
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...globals.es2023 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
      // Map custom form controls to their native element so jsx-a11y rules
      // (label association, etc.) recognise them as controls.
      'jsx-a11y': {
        components: {
          Checkbox: 'input',
          Switch: 'input',
          Radio: 'input',
          Input: 'input',
          Textarea: 'textarea',
          Select: 'select',
          IconButton: 'button',
        },
      },
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: true,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // 3) React + hooks + a11y (recommended) for components.
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // New JSX transform — no need to import React in scope.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // ---------------------------------------------------------------------------
  // 4) Import hygiene + deterministic, grouped import sorting.
  //    Order: side-effects → node/external → @app/@processes/@modules/
  //    @entities/@shared aliases → other internal aliases → relative → styles.
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side-effect imports (e.g. `import './global.css'`).
            ['^\\u0000'],
            // 2. Node builtins + external packages.
            ['^node:', '^@?\\w'],
            // 3. ClinicOS layer aliases, top → bottom (downward-only mental model).
            ['^@app(/.*|$)'],
            ['^@processes(/.*|$)'],
            ['^@modules(/.*|$)'],
            ['^@entities(/.*|$)'],
            ['^@shared(/.*|$)'],
            // 4. Remaining internal aliases.
            [
              '^@(/.*|$)',
              '^@assets(/.*|$)',
              '^@testing(/.*|$)',
              '^@mock(/.*|$)',
              '^@locales(/.*|$)',
            ],
            // 5. Relative imports (parent then sibling).
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // 6. Style imports last.
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-self-import': 'error',
      // Cycles break tree-shaking, lazy-loading & reasoning (DependencyRules §4 F12).
      'import/no-cycle': ['error', { maxDepth: 1, ignoreExternal: true }],
    },
  },

  // ---------------------------------------------------------------------------
  // 5) Architecture boundaries — both dependency axes (DependencyRules §5).
  //    Element types are mapped by path; rules enforce downward-only edges and
  //    public-API-only access (a layer is entered via its index.ts).
  // ---------------------------------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        // Top-level layers (Axis A).
        { type: 'app', pattern: 'src/app/**' },
        { type: 'processes', pattern: 'src/processes/**' },
        { type: 'module', pattern: 'src/modules/*', mode: 'folder', capture: ['module'] },
        { type: 'entities', pattern: 'src/entities/*', mode: 'folder', capture: ['entity'] },
        { type: 'shared', pattern: 'src/shared/**' },
        // Cross-cutting leaves that are not domain layers.
        { type: 'assets', pattern: 'src/assets/**' },
        { type: 'testing', pattern: 'src/testing/**' },
        { type: 'mock', pattern: 'src/mock/**' },
        { type: 'locales', pattern: 'src/locales/**' },
      ],
    },
    rules: {
      // Axis A — who-may-import-whom across layers (downward-only).
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // app: composition root → may reach anything below it.
            {
              from: ['app'],
              allow: [
                'app',
                'processes',
                'module',
                'entities',
                'shared',
                'assets',
                'mock',
                'locales',
              ],
            },
            // processes: orchestrate modules; never reach up to app.
            {
              from: ['processes'],
              allow: ['processes', 'module', 'entities', 'shared', 'locales'],
            },
            // a module → other modules (public index) + entities/shared, never up.
            { from: ['module'], allow: ['module', 'entities', 'shared', 'assets', 'locales'] },
            // entities → other entities + shared only (no modules, no up).
            { from: ['entities'], allow: ['entities', 'shared'] },
            // shared → only shared (no domain, no up).
            { from: ['shared'], allow: ['shared', 'assets'] },
            // Tooling leaves may use shared/testing/mock freely.
            {
              from: ['testing'],
              allow: ['app', 'module', 'entities', 'shared', 'mock', 'testing', 'locales'],
            },
            { from: ['mock'], allow: ['shared', 'entities', 'mock'] },
          ],
        },
      ],
      // Public-API-only — a layer/element is entered through its index only.
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Modules & entities: ONLY their public index.ts is importable from outside.
            { target: ['module'], allow: ['index.ts', 'index.tsx'] },
            { target: ['entities'], allow: ['index.ts', 'index.tsx'] },
            // shared is structured by capability sub-barrels; allow index of any depth.
            { target: ['shared'], allow: ['**/index.ts', '**/index.tsx', '**/*.css'] },
            // app/processes are not imported externally but allow internal index access.
            { target: ['app'], allow: ['**'] },
            { target: ['processes'], allow: ['**/index.ts', '**/index.tsx'] },
            { target: ['assets'], allow: ['**'] },
            { target: ['locales'], allow: ['**'] },
            { target: ['testing'], allow: ['**'] },
            { target: ['mock'], allow: ['**'] },
          ],
        },
      ],
      // Friendlier path-level backstop for the two most common slips.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@modules/*/*', '@modules/*/**', '@/modules/*/*', '@/modules/*/**'],
              message:
                'Deep module import forbidden. Import a module ONLY via its public index: ' +
                "import { X } from '@modules/<module>'. (DependencyRules §4 F1/F2)",
            },
            {
              group: ['../../../*', '**/../../../*'],
              message:
                "Do not climb past a slice with ../../.. — use the '@' alias + public index. (§4 F11)",
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 6) DTO-in-UI guard — stricter no-restricted-imports for Presentation files.
  //    UI (pages/components) must never see api/repositories/mappers/DTOs.
  // ---------------------------------------------------------------------------
  {
    files: ['src/modules/*/pages/**/*.{ts,tsx}', 'src/modules/*/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@modules/*/*', '@modules/*/**', '@/modules/*/*', '@/modules/*/**'],
              message: 'Deep module import forbidden (§4 F1/F2).',
            },
            {
              group: ['**/api', '**/api/**'],
              message: 'UI must not import api/. Use a query/mutation hook or a service. (§4 F3)',
            },
            {
              group: ['**/repositories', '**/repositories/**'],
              message: 'UI must not import repositories/. Call a service via a hook. (§4 F4)',
            },
            {
              group: ['**/mappers', '**/mappers/**'],
              message: 'UI must not import mappers/. The UI only ever sees domain Models. (§4 F5)',
            },
            {
              group: ['**/*.dto', '**/dto/**', '**/*Dto', '**/*DTO'],
              message: 'UI must not import DTOs. Use Model types + form schemas only. (§4 F6)',
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 7) i18n — no hardcoded user-facing strings in app/feature TSX (FF10).
  //    Disabled for tests/config/stories/constants where literals are expected.
  // ---------------------------------------------------------------------------
  {
    files: ['src/**/*.tsx'],
    ignores: [
      'src/**/*.test.tsx',
      'src/**/*.spec.tsx',
      'src/**/*.stories.tsx',
      'src/**/*.config.*',
      'src/**/*.constants.*',
      'src/testing/**',
      'src/mock/**',
    ],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'warn',
        {
          markupOnly: true,
          'jsx-attributes': {
            include: ['alt', 'aria-label', 'title', 'placeholder', 'label'],
          },
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // 8) Relaxations for tests, mocks, testing utils & locale/config code.
  // ---------------------------------------------------------------------------
  {
    files: [
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'src/**/*.stories.{ts,tsx}',
      'src/testing/**/*.{ts,tsx}',
      'src/mock/**/*.{ts,tsx}',
      'e2e/**/*.{ts,tsx}',
    ],
    rules: {
      'i18next/no-literal-string': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'boundaries/element-types': 'off',
      'boundaries/entry-point': 'off',
    },
  },

  // ---------------------------------------------------------------------------
  // 9) Prettier LAST — turn off all stylistic rules Prettier owns.
  // ---------------------------------------------------------------------------
  prettier,
);
