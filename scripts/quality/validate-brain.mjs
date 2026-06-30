#!/usr/bin/env node
/**
 * validate-brain.mjs — PROJECT_BRAIN integrity validator
 * (Phase 10 · DevOps Platform · Part 3 "Brain Validation" + Part 5).
 *
 * Dependency-free. The Brain is the permanent memory; if it drifts, every agent
 * and human inherits the drift. This gate asserts the Brain stays internally
 * consistent and complete:
 *   1. the required structural sections still exist;
 *   2. the ADR "append below ADR-NNNN" marker matches the highest ADR present
 *      (so a new ADR can't be added without advancing the marker);
 *   3. the footer carries a Foundation version + an ISO update date;
 *   4. the DevOps platform is registered in the Brain (Part 13);
 *   5. CHANGELOG.md points back at the Brain.
 *
 * Exit 0 = pass, 1 = fail. Governed by docs/architecture/BrainRules.md.
 */
import { existsSync } from 'node:fs';

import { read, reporter } from './_lib.mjs';

const report = reporter('brain-validation');
const BRAIN = 'docs/brain/PROJECT_BRAIN.md';

if (!existsSync(BRAIN)) {
  report.error(`missing ${BRAIN}`);
  report.done('—');
}

const brain = read(BRAIN);

// 1) Required sections (load-bearing headings).
const REQUIRED_SECTIONS = [
  '## 35. Architectural Decisions',
  '## 39. Completed Phases',
  '## 40. Pending Phases',
  '## 41. Changelog',
];
for (const s of REQUIRED_SECTIONS) {
  if (!brain.includes(s)) report.error(`Brain is missing required section: "${s}"`);
}

// 2) ADR marker consistency: highest ADR-NNNN present must equal the marker.
const adrNums = [...brain.matchAll(/ADR-(\d{4})/g)].map((m) => parseInt(m[1], 10));
const maxAdr = adrNums.length ? Math.max(...adrNums) : 0;
const markerMatch = brain.match(/append below ADR-(\d{4})/);
if (!markerMatch) {
  report.error('Brain is missing the "Future ADRs append below ADR-NNNN" marker.');
} else {
  const marker = parseInt(markerMatch[1], 10);
  if (marker !== maxAdr) {
    report.error(
      `ADR marker out of sync: marker says ADR-${String(marker).padStart(4, '0')} but the ` +
        `highest ADR present is ADR-${String(maxAdr).padStart(4, '0')}. Advance the marker.`,
    );
  }
}

// 3) Footer: Foundation version + ISO date.
if (!/Foundation v\d+/.test(brain)) {
  report.error('Brain footer is missing a "Foundation vN" version stamp.');
}
if (!/\b\d{4}-\d{2}-\d{2}\b/.test(brain)) {
  report.error('Brain has no ISO (YYYY-MM-DD) date stamp.');
}

// 4) DevOps platform registered in the Brain (Phase 10 · Part 13).
if (!brain.includes('docs/devops')) {
  report.warn('Brain does not reference docs/devops — register the DevOps platform (Part 13).');
}

// 5) CHANGELOG points back at the Brain.
const changelog = read('CHANGELOG.md');
if (!changelog) report.error('missing CHANGELOG.md');
else if (!changelog.includes('PROJECT_BRAIN')) {
  report.warn('CHANGELOG.md does not reference PROJECT_BRAIN as the authoritative record.');
}

report.done(
  `sections present · ADR marker = ADR-${String(maxAdr).padStart(4, '0')} (highest present) · footer + dates ok.`,
);
