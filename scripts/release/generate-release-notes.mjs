#!/usr/bin/env node
/**
 * generate-release-notes.mjs — ClinicOS release-notes generator
 * (Phase 10 · DevOps Platform · Part 4 + Part 6 + Part 10).
 *
 * Dependency-free. Reads the Conventional-Commit history since the previous
 * release tag, groups it into human-readable sections, infers the next semantic
 * version (major/minor/patch) from the commit types, writes the notes to
 * `.github/release-body.md` (consumed by `.github/workflows/release.yml`), and
 * prints them to stdout.
 *
 * Usage:
 *   node scripts/release/generate-release-notes.mjs [--version vX.Y.Z]
 *        [--since <tag>] [--out <path>] [--print]
 *
 * If --version is omitted it is inferred and printed as a SUGGESTION only
 * (the script never tags; tagging is an explicit step in complete-phase).
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const OUT = getArg('--out') ?? '.github/release-body.md';
const PRINT_ONLY = args.includes('--print');

const sh = (cmd, fallback = '') => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
};

const REPO = 'labbai-irfan/clinic-os';
const prevTag = getArg('--since') ?? sh('git describe --tags --abbrev=0', '');
const range = prevTag ? `${prevTag}..HEAD` : 'HEAD';

// type → { title, bump }. Order defines the section order in the notes.
const TYPES = [
  { key: 'feat', title: '🚀 Features', bump: 'minor' },
  { key: 'fix', title: '🐞 Fixes', bump: 'patch' },
  { key: 'perf', title: '⚡ Performance', bump: 'patch' },
  { key: 'a11y', title: '♿ Accessibility', bump: 'patch' },
  { key: 'i18n', title: '🌐 Localization', bump: 'patch' },
  { key: 'security', title: '🔒 Security', bump: 'patch' },
  { key: 'refactor', title: '🧹 Refactoring', bump: 'patch' },
  { key: 'docs', title: '📚 Documentation', bump: 'patch' },
  { key: 'test', title: '🧪 Tests', bump: 'patch' },
  { key: 'build', title: '📦 Build', bump: 'patch' },
  { key: 'ci', title: '🤖 CI/CD', bump: 'patch' },
  { key: 'chore', title: '🧰 Chores', bump: 'patch' },
];
const TYPE_KEYS = new Set(TYPES.map((t) => t.key));

const raw = sh(`git log ${range} --no-merges --pretty=format:%h%x09%s`, '');
const lines = raw ? raw.split('\n') : [];

const buckets = new Map();
let breaking = false;
let sawFeat = false;
const other = [];

for (const line of lines) {
  const [hash, ...rest] = line.split('\t');
  const subject = rest.join('\t');
  if (!subject) continue;
  // Conventional Commit: type(scope)!: description
  const m = subject.match(/^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/);
  if (m) {
    const type = m[1].toLowerCase();
    const scope = (m[2] || '').replace(/[()]/g, '');
    const bang = m[3] === '!';
    const desc = m[4];
    if (bang) breaking = true;
    if (type === 'feat') sawFeat = true;
    const key = TYPE_KEYS.has(type) ? type : 'chore';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ hash, scope, desc });
  } else {
    other.push({ hash, scope: '', desc: subject });
  }
}

// Infer next version from the previous tag + the strongest bump seen.
const inferVersion = () => {
  const explicit = getArg('--version');
  if (explicit) return explicit.replace(/^v/, '');
  const base = (prevTag || 'v0.0.0').replace(/^v/, '').split('-')[0];
  const [maj = 0, min = 0, pat = 0] = base.split('.').map((n) => parseInt(n, 10) || 0);
  if (breaking) return `${maj + 1}.0.0`;
  if (sawFeat) return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
};
const version = inferVersion();
const tag = `v${version}`;

let md = `## ClinicOS ${tag}\n\n`;
if (breaking) {
  md += `> ⚠️ **Breaking change** in this release — review the migration notes below.\n\n`;
}
let total = 0;
for (const t of TYPES) {
  const items = buckets.get(t.key);
  if (!items?.length) continue;
  md += `### ${t.title}\n\n`;
  for (const it of items) {
    const scope = it.scope ? `**${it.scope}:** ` : '';
    md += `- ${scope}${it.desc} (\`${it.hash}\`)\n`;
    total++;
  }
  md += `\n`;
}
if (other.length) {
  md += `### Other\n\n`;
  for (const it of other) md += `- ${it.desc} (\`${it.hash}\`)\n`;
  md += `\n`;
  total += other.length;
}
if (total === 0) md += `- No notable changes since ${prevTag || 'the initial commit'}.\n\n`;

md += `---\n`;
if (prevTag) {
  md += `**Full changelog:** https://github.com/${REPO}/compare/${prevTag}...${tag}\n`;
}
md += `Authoritative per-phase record: \`docs/brain/PROJECT_BRAIN.md\`.\n`;

console.log(md);
console.log(
  `\n[generate-release-notes] previous=${prevTag || '(none)'} · ${lines.length} commit(s) · ` +
    `suggested next=${tag}${breaking ? ' (MAJOR)' : sawFeat ? ' (minor)' : ' (patch)'}`,
);

if (!PRINT_ONLY) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, md);
  console.log(`[generate-release-notes] wrote ${OUT}`);
}
