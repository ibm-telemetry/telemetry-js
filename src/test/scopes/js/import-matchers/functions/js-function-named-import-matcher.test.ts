/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { JsFunctionNamedImportMatcher } from '../../../../../main/scopes/js/import-matchers/functions/js-function-named-import-matcher.js'
import type { JsFunction, JsImport } from '../../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../../main/scopes/jsx/constants.js'

describe('class: JsFunctionNamedImportMatcher', () => {
  const namedImportMatcher = new JsFunctionNamedImportMatcher()
  const simpleJsFunction: JsFunction = {
    name: 'function1',
    accessPath: ['function1'],
    arguments: [],
    startPos: 0,
    endPos: 0
  }
  const nestedJsFunction: JsFunction = {
    name: 'function2',
    accessPath: ['function1', 'function2'],
    arguments: [],
    startPos: 0,
    endPos: 0
  }
  const allImport: JsImport = {
    name: 'function1',
    path: '@library/something',
    isAll: true,
    isDefault: false
  }
  const defaultImport: JsImport = {
    name: DEFAULT_ELEMENT_NAME,
    path: '@library/something',
    rename: 'function2',
    isDefault: true,
    isAll: false
  }
  const namedImport: JsImport = {
    name: 'function1',
    path: '@library/something',
    isDefault: false,
    isAll: false
  }
  const renamedImport: JsImport = {
    name: 'aFunction',
    path: '@library/something',
    rename: 'function2',
    isDefault: false,
    isAll: false
  }
  const imports = [allImport, namedImport, renamedImport, defaultImport]
  it('correctly finds an import match with function name', () => {
    expect(namedImportMatcher.findMatch(simpleJsFunction, imports)).toStrictEqual(namedImport)
  })

  it('correctly finds an import match with function nesting', () => {
    expect(namedImportMatcher.findMatch(nestedJsFunction, imports)).toStrictEqual(namedImport)
  })

  it('returns undefined if no imports match function', () => {
    expect(
      namedImportMatcher.findMatch(simpleJsFunction, [allImport, renamedImport, defaultImport])
    ).toBeUndefined()
  })
})
