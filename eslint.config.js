export default [
  {
    files: ['**/*.js'], // Apply to JavaScript files.
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        Parse: 'readonly', // Define global variables here.
      },
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'space-in-parens': ['error', 'never'],
      'no-multiple-empty-lines': 'warn',
      'prefer-const': 'error',
      'space-infix-ops': 'error',
      'no-useless-escape': 'off',
      'require-atomic-updates': 'off',
      'no-var': 'warn',
      'no-await-in-loop': 'warn',
    },
  },
];
