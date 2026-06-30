#!/usr/bin/env node
/**
 * complete-phase.mjs — ClinicOS Phase-Completion Pipeline
 * (Phase 10 · DevOps Platform · Part 5 + Part 14).
 *
 * The single, deterministic command that closes a development phase. It runs the
 * full quality gate, asserts the phase's paperwork exists (report, Brain update,
 * changelog, release notes), regenerates the release notes, and then EITHER
 * prints the exact release commands (default — a safe dry run) or executes the
 * commit/tag/push for you (`--execute`).
 *
 * It never force-pushes, never amends, and refuses to tag if the gate is red or
 * the paperwork is missing — so "phase complete" always means the same thing.
 *
 * Usage:
 *   node scripts/phase/complete-phase.mjs --phase 10 --version 0.10.0
 *        [--quick] [--execute] [--message "feat: ..."]
 *
 *   pnpm phase:complete -- --phase 10 --version 0.10.0
 *
 * Steps (Part 5):
 *   gate → validate Brain/docs → release notes → verify report → commit/tag/push.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const getArg = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (n) => args.includes(n);

const phase = getArg('--phase');
const versionRaw = getArg('--version');
const QUICK = has('--quick');
const EXECUTE = has('--execute');

if (!phase || !versionRaw) {
  console.error('Usage: complete-phase.mjs --phase <N> --version <X.Y.Z> [--quick] [--execute]');
  process.exit(2);
}
const version = versionRaw.replace(/^v/, '');
const tag = `v${version}`;
const phasePad = String(phase).padStart(3, '0');
const reportPath = `docs/reports/phase-${phasePad}-report.md`;
const message = getArg('--message') ?? `chore(release): phase ${phase} — ${tag}`;

// PATH-independent runners (mirrors scripts/quality/quality-gate.mjs).
const NODE = process.execPath;
const PM_CLI = process.env.npm_execpath;
const q = (p) => `"${p}"`;
const pm = (script) => (PM_CLI ? `${q(NODE)} ${q(PM_CLI)} run ${script}` : `pnpm run ${script}`);

const run = (cmd, { capture = false } = {}) =>
  execSync(cmd, { stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' });

const step = (n, label) => console.log(`\n[${n}] ${label}\n${'─'.repeat(52)}`);
let failed = false;
const fail = (m) => {
  console.error(`✗ ${m}`);
  failed = true;
};

console.log(`\nClinicOS — Phase ${phase} completion → ${tag}\n${'='.repeat(52)}`);

// 1) Quality gate -------------------------------------------------------------
step(1, `Quality gate${QUICK ? ' (quick)' : ''}`);
try {
  run(QUICK ? pm('quality:quick') : pm('verify'));
  console.log('✓ gate green');
} catch {
  fail('quality gate failed — fix before completing the phase.');
}

// 2) Paperwork ----------------------------------------------------------------
step(2, 'Phase paperwork');
if (existsSync(reportPath)) console.log(`✓ report: ${reportPath}`);
else fail(`missing phase report: ${reportPath}`);

for (const [label, cmd] of [
  ['Brain', pm('validate:brain')],
  ['Docs', pm('validate:docs')],
]) {
  try {
    run(cmd, { capture: true });
    console.log(`✓ ${label} validation`);
  } catch (e) {
    fail(`${label} validation failed:\n${(e.stdout || e.stderr || '').toString().trim()}`);
  }
}

// 3) Release notes ------------------------------------------------------------
step(3, 'Release notes');
try {
  run(`${q(NODE)} scripts/release/generate-release-notes.mjs --version ${tag}`);
} catch {
  fail('release-notes generation failed.');
}

// 4) Release commands ---------------------------------------------------------
step(4, EXECUTE ? 'Commit · tag · push (executing)' : 'Commit · tag · push (dry run)');
const commands = [
  `git add -A`,
  `git commit -m ${JSON.stringify(message)}`,
  `git tag -a ${tag} -m ${JSON.stringify(`ClinicOS ${tag} — phase ${phase}`)}`,
  `git push origin HEAD`,
  `git push origin ${tag}`,
];

if (failed) {
  console.error(`\n✗ Phase ${phase} NOT complete — resolve the failures above, then re-run.`);
  console.error('  (No git commands were executed.)');
  process.exit(1);
}

if (EXECUTE) {
  for (const c of commands) {
    console.log(`$ ${c}`);
    run(c);
  }
  console.log(
    `\n✓ Phase ${phase} complete. Tag ${tag} pushed → release.yml will publish the GitHub Release.`,
  );
} else {
  console.log('Gate + paperwork GREEN. Run these to publish (or re-run with --execute):\n');
  for (const c of commands) console.log(`  ${c}`);
  console.log(
    `\nPushing ${tag} triggers .github/workflows/release.yml → builds + publishes the GitHub Release.`,
  );
}
