/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
const path = require('path')

const noUnusedVarsOptions = { args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }

module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard-with-typescript',
    'plugin:@typescript-eslint/strict',
    'plugin:eslint-comments/recommended',
    'plugin:n/recommended'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.*rc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.eslint.json'
  },
  plugins: ['notice', 'simple-import-sort'],
  root: true,
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', noUnusedVarsOptions],
    '@typescript-eslint/space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    'eslint-comments/require-description': 'error',
    indent: [
      'error',
      2,
      {
        ignoredNodes: [
          'PropertyDefinition[decorators]',
          'VariableDeclaration[declarations.length=0]'
        ],
        SwitchCase: 1
      }
    ],
    'max-len': [
      'error',
      {
        code: 150, // Effectively disable this rule and allow Prettier to handle it
        comments: 100
      }
    ],
    'n/shebang': 'off',
    'notice/notice': [
      'error',
      {
        templateFile: path.join(__dirname, '.copyright.js')
      }
    ],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error'
  }
}
