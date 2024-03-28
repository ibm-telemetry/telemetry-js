/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { JsFunctionAllImportMatcher } from '../../../../../main/scopes/js/import-matchers/functions/js-function-all-import-matcher.js'
import type { JsFunction, JsImport } from '../../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../../main/scopes/jsx/constants.js'

describe('class: JsFunctionAllImportMatcher', () => {
  const allImportMatcher = new JsFunctionAllImportMatcher()
  const simpleJsFunction: JsFunction = {
    name: 'theFunction',
    accessPath: ['theFunction'],
    arguments: [],
    startPos: 0,
    endPos: 0
  }
  const nestedJsFunction: JsFunction = {
    name: 'theFunction',
    accessPath: ['object', 'theFunction'],
    arguments: [],
    startPos: 0,
    endPos: 0
  }
  const allImport: JsImport = {
    name: 'object',
    path: '@library/something',
    isAll: true,
    isDefault: false
  }
  const defaultImport: JsImport = {
    name: DEFAULT_ELEMENT_NAME,
    path: '@library/something',
    rename: 'theFunction',
    isDefault: true,
    isAll: false
  }
  const namedImport: JsImport = {
    name: 'object',
    path: '@library/something',
    isDefault: false,
    isAll: false
  }
  const renamedImport: JsImport = {
    name: 'aFunction',
    path: '@library/something',
    rename: 'theFunction',
    isDefault: false,
    isAll: false
  }
  const imports = [allImport, namedImport, renamedImport, defaultImport]
  it('correctly finds an import match', () => {
    expect(allImportMatcher.findMatch(nestedJsFunction, imports)).toStrictEqual(allImport)
  })

  it('returns undefined if no imports match function', () => {
    expect(
      allImportMatcher.findMatch(nestedJsFunction, [namedImport, renamedImport, defaultImport])
    ).toBeUndefined()
  })

  it('returns undefined if function is not nested', () => {
    expect(allImportMatcher.findMatch(simpleJsFunction, imports)).toBeUndefined()
  })
})
