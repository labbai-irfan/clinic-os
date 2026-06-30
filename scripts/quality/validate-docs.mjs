#!/usr/bin/env node
/**
 * validate-docs.mjs — documentation-canon validator
 * (Phase 10 · DevOps Platform · Part 3 "Documentation Validation" + Part 6).
 *
 * Dependency-free. Guards the documentation contract so the canon can never
 * silently rot:
 *   1. every REQUIRED canon doc exists and is non-empty;
 *   2. the DevOps canon (the folder this phase owns) links only to files that
 *      exist (relative-link integrity). Links inside code spans / fenced blocks
 *      are ignored — a doc *about* links legitimately shows example links;
 *   3. no tracked markdown doc under docs/ is empty (size 0).
 *
 * Blocking on (1), (2), and (3). Exit 0 = pass, 1 = fail.
 * Governed by docs/devops/DocumentationAutomation.md.
 */
import { existsSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

import { read, reporter, walk } from './_lib.mjs';

const report = reporter('docs-validation');

// 1) Required canon — the load-bearing documents an agent/dev must be able to find.
const REQUIRED = [
  'docs/Brain.md',
  'docs/Frontend-Bible.md',
  'docs/brain/PROJECT_BRAIN.md',
  'docs/architecture/README.md',
  'docs/architecture/AI_RULES.md',
  'docs/design-system/DesignSystem.md',
  'docs/theme-engine/README.md',
  'docs/assets/README.md',
  'docs/engineering/README.md',
  'docs/devops/README.md',
  'CHANGELOG.md',
  'README.md',
];
for (const f of REQUIRED) {
  if (!existsSync(f)) report.error(`missing required doc: ${f}`);
  else if (statSync(f).size === 0) report.error(`required doc is empty: ${f}`);
}

// 2) Relative-link integrity for the folder this phase governs. Strip fenced
// code blocks and inline code first so documented EXAMPLE links don't count.
const stripCode = (s) =>
  s
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`]*`/g, '');
const SCOPED = ['docs/devops'];
let checkedLinks = 0;
const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
for (const dir of SCOPED) {
  for (const file of walk(dir, ['.md'])) {
    const body = stripCode(read(file));
    let m;
    while ((m = linkRe.exec(body))) {
      let target = m[1].trim();
      if (/^(https?:|mailto:|#)/.test(target)) continue; // external / anchor-only
      target = target.split('#')[0].split('?')[0]; // drop anchor/query
      if (!target) continue;
      const resolved = normalize(join(dirname(file), target));
      checkedLinks++;
      if (!existsSync(resolved)) {
        report.error(`broken link in ${file.split(/[\\/]/).slice(-2).join('/')} → ${m[1]}`);
      }
    }
  }
}

// 3) No empty markdown anywhere in docs/.
for (const file of walk('docs', ['.md'])) {
  if (statSync(file).size === 0) report.error(`empty markdown: ${file}`);
}

report.done(`${REQUIRED.length} required docs present · ${checkedLinks} scoped links resolve.`);
