/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { JsFunctionRenamedImportMatcher } from '../../../../../main/scopes/js/import-matchers/functions/js-function-renamed-import-matcher.js'
import type { JsFunction, JsImport } from '../../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../../main/scopes/jsx/constants.js'

describe('class: JsFunctionRenamedImportMatcher', () => {
  const renamedImportMatcher = new JsFunctionRenamedImportMatcher()
  const simpleJsFunction: JsFunction = {
    name: 'function',
    accessPath: ['function'],
    arguments: [],
    startPos: 0,
    endPos: 0
  }
  const nestedJsFunction: JsFunction = {
    name: 'function1',
    accessPath: ['function', 'function1'],
    arguments: [],
    startPos: 0,
    endPos: 0
  }
  const allImport: JsImport = {
    name: 'function',
    path: '@library/something',
    isAll: true,
    isDefault: false
  }
  const defaultImport: JsImport = {
    name: DEFAULT_ELEMENT_NAME,
    path: '@library/something',
    rename: 'function',
    isDefault: true,
    isAll: false
  }
  const namedImport: JsImport = {
    name: 'function',
    path: '@library/something',
    isDefault: false,
    isAll: false
  }
  const renamedImport: JsImport = {
    name: 'aFunction',
    path: '@library/something',
    rename: 'function',
    isDefault: false,
    isAll: false
  }
  const imports = [allImport, namedImport, renamedImport, defaultImport]
  it('correctly finds an import match with function name', () => {
    expect(renamedImportMatcher.findMatch(simpleJsFunction, imports)).toStrictEqual(renamedImport)
  })

  it('correctly finds an import match with nested function', () => {
    expect(renamedImportMatcher.findMatch(nestedJsFunction, imports)).toStrictEqual(renamedImport)
  })

  it('correctly finds an import match with default import', () => {
    expect(
      renamedImportMatcher.findMatch(simpleJsFunction, [allImport, namedImport, defaultImport])
    ).toStrictEqual(defaultImport)
  })

  it('returns undefined if no imports match function', () => {
    expect(
      renamedImportMatcher.findMatch(simpleJsFunction, [allImport, namedImport])
    ).toBeUndefined()
  })
})
