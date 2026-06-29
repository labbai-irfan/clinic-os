/**
 * commitlint.config.cjs — Conventional Commits enforcement for ClinicOS.
 *
 * Governed by docs/Naming-Convention.md §13 (Git naming): commits are
 * `type(scope): subject`, where scope maps onto the FSD slice / entity / layer.
 *
 * `.cjs` because the project is ESM (`"type": "module"`) and commitlint loads
 * the config with `require()`.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed Conventional-Commit types (Naming-Convention §13.2).
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'chore',
        'refactor',
        'test',
        'perf',
        'build',
        'ci',
        'style',
        'revert',
      ],
    ],
    // Scope is OPTIONAL, but when present should reference a slice / entity /
    // shared segment. Casing is not constrained to allow `shared/ui` style scopes.
    'scope-empty': [0],
    'scope-case': [0],
    // Keep subjects readable and history greppable.
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
};
