import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

// Regles de couches (voir docs/TECHNICAL.md section 3). Un import interdit = erreur de lint.
const ban = (groups, message) => ({
  'no-restricted-imports': ['error', { patterns: [{ group: groups, message }] }],
});
const REACT_LIKE = ['react', 'react-dom', 'next', 'next/*', 'three', 'three/*', '@react-three/*'];
const ALL_LAYERS = ['**/ui/**', '**/three/**', '**/audio/**', '**/judge/**', '**/progress/**', '**/data/**', '**/content/**'];

export default tseslint.config(
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts', 'design/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks, '@next/next': nextPlugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      ...nextPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // engine : TypeScript pur, deterministe, aucune dependance aux autres couches
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      ...ban([...REACT_LIKE, ...ALL_LAYERS], 'engine/ ne depend que de engine/ (pas de React, DOM, autres couches).'),
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'sessionStorage', 'Date', 'performance'],
      'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Utiliser rng.ts (mulberry32).' }],
    },
  },
  { files: ['src/content/**/*.ts'], rules: ban([...REACT_LIKE, '**/ui/**', '**/three/**', '**/audio/**', '**/judge/**', '**/progress/**', '**/data/**'], 'content/ importe seulement engine/types.') },
  { files: ['src/progress/**/*.ts'], rules: ban([...REACT_LIKE, '**/ui/**', '**/three/**', '**/audio/**', '**/judge/**', '**/data/**'], 'progress/ importe engine/types et content/badges.') },
  { files: ['src/data/**/*.ts'], rules: ban([...REACT_LIKE, '**/ui/**', '**/three/**', '**/audio/**', '**/judge/**', '**/progress/**', '**/content/**'], 'data/ importe seulement engine/types.') },
  { files: ['src/three/**/*.{ts,tsx}', 'src/audio/**/*.ts'], rules: ban(['**/ui/**', '**/judge/**', '**/progress/**', '**/data/**'], 'three/ et audio/ ne dependent pas de ui/, progress/, data/.') },
  { files: ['scripts/**/*.ts', 'tests/**/*.ts'], rules: { 'no-console': 'off' } },
);
