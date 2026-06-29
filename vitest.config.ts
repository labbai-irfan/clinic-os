/**
 * Vitest test runner configuration for ClinicOS.
 *
 * Purpose: run the suite in a jsdom environment with global test APIs, the
 * shared setup file (jest-dom + axe matchers), CSS processing on, and v8
 * coverage with sensible foundation thresholds. Aliases resolve via
 * `vite-tsconfig-paths`, so tests use the same import surface as the app.
 *
 * Governed by: Phase 3 BUILD SPEC, docs/Coding-Standards.md §16 (testing gate),
 * docs/architecture/FolderStructure.md (`src/testing/`).
 */
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // `react()` gives tests the automatic JSX runtime (matches the app build);
  // `tsconfigPaths` resolves the @-aliases from the project that declares them.
  plugins: [react(), tsconfigPaths({ projects: ['./tsconfig.app.json'] })],
  test: {
    globals: true,
    passWithNoTests: true,
    environment: 'jsdom',
    css: true,
    setupFiles: ['./src/testing/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e/**', '**/*.e2e.spec.ts'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      all: false,
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'src/testing/**',
        'src/mock/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/index.ts',
        'src/vite-env.d.ts',
        '**/*.config.{ts,js}',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
});
