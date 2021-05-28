module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'standard-with-typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['sort-imports-es6-autofix'],
  rules: {
    'comma-dangle': 'off',
    "import/no-unassigned-import": [
      "warn"
    ],
    "import/order": [
      "warn"
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    __server_import: 'readonly',
  },
}
