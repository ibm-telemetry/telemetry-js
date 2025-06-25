/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import jsdoc from 'eslint-plugin-jsdoc'
import n from 'eslint-plugin-n'
import notice from 'eslint-plugin-notice'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import vitest from 'eslint-plugin-vitest'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

const noUnusedVarsOptions = { args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }

const files = ['**/*.{js,cjs,mjs,jsx,ts,tsx}']

const config = [
  {
    ignores: [
      '**/.history/*',
      '**/.vscode/*',
      '**/.test-coverage/*',
      '**/dist/*',
      'src/test/__fixtures/*',
      '.copyright.js'
    ]
  },
  ...tsEslint.configs.strict.map((config) => ({
    ...config,
    files,
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: 'tsconfig.eslint.json'
      }
    }
  })),
  {
    ...eslintComments.recommended,
    files
  },
  {
    ...jsdoc.configs['flat/recommended-typescript'],
    files
  },
  {
    ...n.configs['flat/recommended'],
    files
  },
  {
    //
    // Default config for all files
    //
    files: files,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2021,
        ...globals.node
      }
    },
    plugins: {
      notice,
      'simple-import-sort': simpleImportSort
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowWithDecorator: true
        }
      ],
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
      '@eslint-community/eslint-comments/require-description': 'warn',
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
      'notice/notice': ['error', { templateFile: './.copyright.js' }],
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn'
    }
  },
  {
    //
    // Special rules for config files
    //
    files: ['.*rc.{js,cjs}', '*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'n/no-unpublished-import': 'off'
    }
  },
  {
    //
    // Special rules for test files
    //
    ...vitest.configs.all,
    files: ['**/*.test.ts'],
    plugins: {
      vitest
    },
    rules: {
      'n/no-unpublished-import': 'off',
      'vitest/no-hooks': 'off',
      'vitest/prefer-expect-assertions': 'off'
    }
  }
]

export default config
