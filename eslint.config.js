import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist', 'public', 'ppt', 'backups', 'data', 'node_modules',
    'append_sample_manager.cjs', 'apply_changes.js', 'compact_tabs.cjs',
    'extract*.cjs', 'find_pages.cjs', 'fix*.{js,cjs}', 'insert_bostik.cjs',
    'modify*.cjs', 'patch*.{js,cjs,py}', 'remove.cjs', 'temp*', 'dummy*',
    'test-css.js', 'test_upload.*', 'update_mapping.cjs'
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  {
    files: ['server.js', 'vite.config.js', 'test/**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
