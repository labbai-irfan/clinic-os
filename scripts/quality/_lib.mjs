#!/usr/bin/env node
/**
 * _lib.mjs — shared, dependency-free helpers for the ClinicOS quality gates
 * (Phase 9 · Engineering Quality Platform).
 *
 * Every gate under `scripts/quality/` is a standalone Node ESM script with NO
 * third-party dependencies (so it is safe to run in CI and pre-commit). This
 * module factors out the parts they all share: filesystem walking, source
 * collection, and a consistent reporter (✓ / ⚠ / ✗ + exit codes).
 *
 * Contract for a gate:
 *   - exit 0  → gate passed (warnings allowed; printed but non-fatal)
 *   - exit 1  → gate FAILED (a hard rule was violated) — blocks the PR
 *   - exit 2  → gate could not run (misconfig / missing input)
 *
 * Governed by docs/engineering/QualityGates.md.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

export const ROOT = process.cwd();
export const SRC = 'src';

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  '.turbo',
  'storybook-static',
  'playwright-report',
  'test-results',
]);

/**
 * Recursively walk a directory and return absolute-ish (repo-relative) file
 * paths whose extension is in `exts` (all files if `exts` is empty).
 * Returns [] if the directory does not exist.
 */
export function walk(dir, exts = []) {
  const out = [];
  if (!existsSync(dir)) return out;
  const want = new Set(exts.map((e) => (e.startsWith('.') ? e : `.${e}`)));
  const recurse = (d) => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.gitkeep') {
        // skip dotfiles/dotdirs except keep markers
        if (entry.isDirectory()) continue;
      }
      const full = join(d, entry.name);
      if (entry.isDirectory()) {
        if (DEFAULT_IGNORE_DIRS.has(entry.name)) continue;
        recurse(full);
      } else if (want.size === 0 || want.has(extname(entry.name).toLowerCase())) {
        out.push(full);
      }
    }
  };
  recurse(dir);
  return out;
}

/** Read a file as UTF-8; returns '' on any error (never throws). */
export function read(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

/** Repo-relative path with forward slashes (stable across OSes). */
export function rel(file) {
  return relative(ROOT, file).split(sep).join('/');
}

/** True if a repo-relative path matches any of the given substrings/globs-ish. */
export function matchesAny(relPath, patterns) {
  return patterns.some((p) => {
    if (p.includes('*')) {
      const re = new RegExp(
        '^' +
          p
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*\*/g, '§')
            .replace(/\*/g, '[^/]*')
            .replace(/§/g, '.*') +
          '$',
      );
      return re.test(relPath);
    }
    return relPath.includes(p);
  });
}

export function fileSize(file) {
  try {
    return statSync(file).size;
  } catch {
    return 0;
  }
}

export const KB = (bytes) => Math.round((bytes / 1024) * 100) / 100;

// --- Reporter -------------------------------------------------------------

/** Create a reporter for a single gate. */
export function reporter(name) {
  const errors = [];
  const warnings = [];
  return {
    error: (msg) => errors.push(msg),
    warn: (msg) => warnings.push(msg),
    /** Print the summary and exit with the right code. Returns nothing. */
    done: (okMessage) => {
      if (warnings.length) {
        console.warn(`\n⚠ ${name}: ${warnings.length} warning(s):`);
        for (const w of warnings) console.warn(`   - ${w}`);
      }
      if (errors.length) {
        console.error(`\n✗ ${name}: ${errors.length} error(s):`);
        for (const e of errors) console.error(`   - ${e}`);
        process.exit(1);
      }
      console.log(`✓ ${name}: ${okMessage}`);
      process.exit(0);
    },
    counts: () => ({
      errors: errors.length,
      warnings: warnings.length,
      errorList: errors,
      warnList: warnings,
    }),
  };
}

/**
 * Run a gate's logic and return a structured result WITHOUT exiting — used by
 * the orchestrator (`quality-gate.mjs`) to aggregate. `fn(report)` pushes into
 * report.error/report.warn.
 */
export function collect(name, fn) {
  const errors = [];
  const warnings = [];
  const report = { error: (m) => errors.push(m), warn: (m) => warnings.push(m) };
  let ok = true;
  let detail = '';
  try {
    detail = fn(report) ?? '';
  } catch (e) {
    ok = false;
    errors.push(`gate crashed: ${e?.message ?? e}`);
  }
  return { name, ok: ok && errors.length === 0, errors, warnings, detail };
}
