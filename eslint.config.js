// ESLint : les erreurs de logique et la complexité, pas le style (le formatage
// relève de Prettier). Les seuils sont ceux de la checklist du site, appliqués
// par la CI ; une règle que le code ne tient pas encore est en `warn`, avec la raison.
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/', '.astro/', '.cache/', 'node_modules/', 'public/media/', 'private/', 'migration/', '.remember/',
      // Le contenu du prototype, repris tel quel par le faux Directus : pas du code du site.
      'test/faux-directus/prototype/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      // Les seuils de la checklist : une fonction qui les dépasse se découpe (un paramètre en trop
      // devient un objet, une branche qui a son nom devient une fonction).
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-params': ['error', 3],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // Les objets du CMS sont typés `any` dans les composants, faute de type généré : à resserrer
      // quand les collections en fourniront un.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    // Le faux Directus des tests : un serveur de fabrication qui reproduit le filtrage du vrai, pas
    // du code du site. Ses seuils restent visibles sans arrêter la CI.
    files: ['test/faux-directus/**'],
    rules: { complexity: ['warn', 10], 'max-depth': ['warn', 3], 'max-params': ['warn', 3] },
  },
  {
    // Des commandes : leur sortie est le message pour la personne qui les lance.
    files: ['scripts/**', 'test/**'],
    rules: { 'no-console': 'off' },
  },
  {
    // Les espaces insécables (et fines) sont justement ce que ces fichiers fabriquent et vérifient.
    files: ['src/lib/typo.js', 'test/typo.test.js'],
    rules: { 'no-irregular-whitespace': 'off' },
  },
];
