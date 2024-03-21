/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { JsTokenRenamedImportMatcher } from '../../../../../main/scopes/js/import-matchers/tokens/js-token-renamed-import-matcher.js'
import type { JsImport, JsToken } from '../../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../../main/scopes/jsx/constants.js'

describe('class: JsTokenRenamedImportMatcher', () => {
  const renamedImportMatcher = new JsTokenRenamedImportMatcher()
  const simpleJsToken: JsToken = {
    name: 'theToken',
    accessPath: ['theToken']
  }
  const nestedJsToken: JsToken = {
    name: 'theToken',
    accessPath: ['object', 'theToken']
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
    rename: 'theToken',
    isDefault: true,
    isAll: false
  }
  const namedImport: JsImport = {
    name: 'theToken',
    path: '@library/something',
    isDefault: false,
    isAll: false
  }
  const renamedImport: JsImport = {
    name: 'aToken',
    path: '@library/something',
    rename: 'theToken',
    isDefault: false,
    isAll: false
  }
  const imports = [allImport, namedImport, renamedImport, defaultImport]
  it('correctly finds an import match with token name', () => {
    expect(renamedImportMatcher.findMatch(simpleJsToken, imports)).toStrictEqual(renamedImport)
  })

  it('correctly finds an import match with nested token', () => {
    expect(renamedImportMatcher.findMatch(nestedJsToken, imports)).toStrictEqual(renamedImport)
  })

  it('correctly finds an import match with default import', () => {
    expect(
      renamedImportMatcher.findMatch(simpleJsToken, [allImport, namedImport, defaultImport])
    ).toStrictEqual(defaultImport)
  })

  it('returns undefined if no imports match token', () => {
    expect(renamedImportMatcher.findMatch(simpleJsToken, [allImport, namedImport])).toBeUndefined()
  })
})
