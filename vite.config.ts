/**
 * Vite build configuration for ClinicOS.
 *
 * Purpose: wire React, resolve the canonical path aliases from tsconfig (so the
 * alias map has ONE source of truth), inject the build version as `__APP_VERSION__`,
 * split vendors into stable cacheable chunks, and emit a bundle report in
 * `analyze` mode only.
 *
 * Governed by: Phase 3 BUILD SPEC (build/config ownership),
 * docs/Coding-Standards.md §11 (route-level code splitting / performance),
 * docs/architecture/FolderStructure.md (alias map).
 */
import { createRequire } from 'node:module';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Read the package version without importing JSON (keeps strict ESM config clean).
const require = createRequire(import.meta.url);
const pkg = require('./package.json') as { version: string };

/**
 * Vendor chunk strategy: keep large, independently-versioned libraries in their
 * own long-lived chunks so a change in app code does not bust the vendor cache.
 */
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'vendor-react';
  if (/[\\/]node_modules[\\/]react-router/.test(id)) return 'vendor-router';
  if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) return 'vendor-query';
  if (/[\\/]node_modules[\\/](i18next|react-i18next)/.test(id)) return 'vendor-i18n';
  if (/[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/.test(id)) return 'vendor-forms';
  if (/[\\/]node_modules[\\/]framer-motion/.test(id)) return 'vendor-motion';
  return 'vendor';
}

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';

  const plugins: PluginOption[] = [react(), tsconfigPaths()];
  if (isAnalyze) {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }) as PluginOption,
    );
  }

  return {
    plugins,
    define: {
      // Compile-time constant; typed in src/vite-env.d.ts. Never put secrets here.
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    preview: {
      port: 4173,
    },
    build: {
      // `analyze` mode is a production build under the hood.
      target: 'es2022',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  };
});
