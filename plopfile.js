/**
 * plopfile.js — ClinicOS scaffolding generators (`pnpm generate`).
 *
 * Governed by:
 *   - docs/architecture/FeatureArchitecture.md (the canonical 18-folder + 5-root-file
 *     module template — reproduced byte-for-byte by the "module" generator)
 *   - docs/Naming-Convention.md (folders kebab-case, components PascalCase)
 *
 * Generators:
 *   - module    → scaffolds src/modules/<kebab-name>/ from the canonical template.
 *   - component → scaffolds a shared/design-system component (PascalCase.tsx).
 *
 * Templates live in scripts/templates/. ESM module (the project is `"type":"module"`).
 */

const TEMPLATES = 'scripts/templates';

// The canonical module template — all 18 folders. Empty folders get a `.gitkeep`
// so the structure is committed before the files exist (FeatureArchitecture §8.2).
const MODULE_FOLDERS = [
  'pages',
  'components',
  'hooks',
  'services',
  'repositories',
  'api',
  'mappers',
  'adapters',
  'types',
  'schemas',
  'validators',
  'constants',
  'utils',
  'store',
  'config',
  'tests',
];

/** @param {import('plop').NodePlopAPI} plop */
export default function (plop) {
  // ---------------------------------------------------------------------------
  // module — scaffold a new bounded context from the canonical template.
  // ---------------------------------------------------------------------------
  plop.setGenerator('module', {
    description: 'Scaffold a new module (bounded context) from the canonical template',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name (a bounded context, e.g. appointments):',
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test((value || '').trim())
            ? true
            : 'Use a lower-case, kebab-case name (e.g. follow-up).',
      },
    ],
    actions: () => {
      const base = 'src/modules/{{kebabCase name}}';
      const actions = [];

      // Root files (real, from templates).
      actions.push(
        {
          type: 'add',
          path: `${base}/index.ts`,
          templateFile: `${TEMPLATES}/module/index.ts.hbs`,
        },
        {
          type: 'add',
          path: `${base}/README.md`,
          templateFile: `${TEMPLATES}/module/README.md.hbs`,
        },
        {
          type: 'add',
          path: `${base}/BRAIN.md`,
          templateFile: `${TEMPLATES}/module/BRAIN.md.hbs`,
        },
        {
          type: 'add',
          path: `${base}/routes.tsx`,
          template:
            '/** {{pascalCase name}} route subtree (lazy-loaded). See FeatureArchitecture §3. */\n' +
            "import type { RouteObject } from 'react-router-dom';\n\n" +
            'export const {{camelCase name}}Routes: RouteObject[] = [];\n',
        },
        {
          type: 'add',
          path: `${base}/permissions.ts`,
          template:
            '/** {{pascalCase name}} RBAC permission definitions. See FeatureArchitecture §3. */\n' +
            'export const {{constantCase name}}_PERMISSIONS = {} as const;\n\n' +
            'export type {{pascalCase name}}Permission =\n' +
            '  (typeof {{constantCase name}}_PERMISSIONS)[keyof typeof {{constantCase name}}_PERMISSIONS];\n',
        },
      );

      // The 18 template folders, each seeded with a `.gitkeep` until filled.
      for (const folder of MODULE_FOLDERS) {
        actions.push({
          type: 'add',
          path: `${base}/${folder}/.gitkeep`,
          template: '',
        });
      }

      return actions;
    },
  });

  // ---------------------------------------------------------------------------
  // component — scaffold a shared/design-system component.
  // ---------------------------------------------------------------------------
  plop.setGenerator('component', {
    description: 'Scaffold a shared/design-system component (PascalCase.tsx)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g. Button, VitalsCard):',
        validate: (value) =>
          (value || '').trim().length > 0 ? true : 'A component name is required.',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/shared/design-system/{{pascalCase name}}/{{pascalCase name}}.tsx',
        templateFile: `${TEMPLATES}/component/Component.tsx.hbs`,
      },
      {
        type: 'add',
        path: 'src/shared/design-system/{{pascalCase name}}/index.ts',
        template:
          "export { {{pascalCase name}}, type {{pascalCase name}}Props } from './{{pascalCase name}}';\n",
      },
    ],
  });
}
