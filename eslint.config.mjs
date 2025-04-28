import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import path from 'node:path';

const __dirname = path.resolve();

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './spec/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
        Parse: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
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
  {
    ignores: ['dist/**/*', 'logs/**/*', 'public/**/*', 'release.config.js'],
  }
);
