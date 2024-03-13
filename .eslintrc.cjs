/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
const path = require('node:path')

const noUnusedVarsOptions = { args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }

module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:@typescript-eslint/strict',
    'plugin:eslint-comments/recommended',
    'plugin:jsdoc/recommended-typescript',
    'plugin:n/recommended'
  ],
  overrides: [
    // Special rules for config files
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
    },
    // Special rules for test files
    {
      files: ['**/*.test.ts'],
      plugins: ['vitest'],
      extends: ['plugin:vitest/all'],
      rules: {
        'vitest/no-hooks': 'off',
        'vitest/prefer-expect-assertions': 'off'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.eslint.json'
  },
  plugins: ['@typescript-eslint', 'jsdoc', 'notice', 'simple-import-sort'],
  root: true,
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', noUnusedVarsOptions],
    '@typescript-eslint/space-before-function-paren': [
      'warn',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      'warn',
      {
        allowString: false,
        allowNumber: false,
        allowNullableObject: true,
        allowNullableBoolean: true,
        allowNullableString: false,
        allowNullableNumber: false,
        allowNullableEnum: false,
        allowAny: false
      }
    ],
    'eslint-comments/require-description': 'warn',
    indent: [
      'warn',
      2,
      {
        ignoredNodes: [
          'PropertyDefinition[decorators]',
          'VariableDeclaration[declarations.length=0]'
        ],
        SwitchCase: 1
      }
    ],
    'jsdoc/check-tag-names': 'off', // To support JSON schema file generation based on TypeScript
    'jsdoc/require-description': [
      'warn',
      {
        contexts: [
          'ClassDeclaration',
          'FunctionDeclaration',
          'MethodDefinition',
          'PropertyDefinition',
          'TSAbstractMethodDefinition'
        ]
      }
    ],
    'jsdoc/require-description-complete-sentence': 'warn',
    'jsdoc/require-hyphen-before-param-description': 'warn',
    'jsdoc/require-jsdoc': [
      'warn',
      {
        // publicOnly: true,
        require: {
          //   ArrowFunctionExpression: true,
          // ClassDeclaration: true,
          //   ClassExpression: false,
          FunctionDeclaration: false
          //   FunctionExpression: false,
          //   MethodDefinition: true
        },
        contexts: [
          'ClassDeclaration',
          'ExportNamedDeclaration > FunctionDeclaration',
          'MethodDefinition[accessibility="protected"][override=false]',
          'MethodDefinition[accessibility="public"][override=false]',
          'TSAbstractMethodDefinition[accessibility="public"]',
          'TSAbstractMethodDefinition[accessibility="protected"]'
        ]
      }
    ],
    'jsdoc/require-param-description': 'warn',
    'jsdoc/require-throws': 'warn',
    'jsdoc/tag-lines': [
      'warn',
      'any',
      {
        startLines: 1,
        endLines: 0,
        tags: { param: { lines: 'never' }, returns: { lines: 'never' } }
      }
    ],
    'max-len': [
      'warn',
      {
        code: 150, // Effectively disable this rule and allow Prettier to handle it
        comments: 100
      }
    ],
    'n/no-unpublished-import': ['error', { allowModules: ['vitest'] }],
    'n/shebang': 'off',
    'notice/notice': [
      'warn',
      {
        templateFile: path.join(__dirname, '.copyright.js')
      }
    ],
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn'
  }
}
