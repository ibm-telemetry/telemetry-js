/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'
import { AllImportMatcher } from '../../../../main/scopes/jsx/import-matchers/all-import-matcher.js'
import { type JsxElement, type JsxImport } from '../../../../main/scopes/jsx/interfaces.js'

describe('class: AllImportMatcher', () => {
  const allImportMatcher = new AllImportMatcher()
  const element: JsxElement = {
    name: 'theElement',
    prefix: 'prefix',
    attributes: []
  }
  const allImport: JsxImport = {
    name: 'prefix',
    path: '@library/something',
    isAll: true,
    isDefault: false
  }
  const defaultImport: JsxImport = {
    name: DEFAULT_ELEMENT_NAME,
    path: '@library/something',
    rename: 'theElement',
    isDefault: true,
    isAll: false
  }
  const namedImport: JsxImport = {
    name: 'theElement',
    path: '@library/something',
    isDefault: false,
    isAll: false
  }
  const renamedImport: JsxImport = {
    name: 'Button',
    path: '@library/something',
    rename: 'theElement',
    isDefault: false,
    isAll: false
  }
  const imports = [allImport, namedImport, renamedImport, defaultImport]
  it('correctly finds an import match', () => {
    expect(allImportMatcher.findMatch(element, imports)).toStrictEqual(allImport)
  })

  it('returns undefined if no imports match element', () => {
    expect(
      allImportMatcher.findMatch(element, [namedImport, renamedImport, defaultImport])
    ).toBeUndefined()
  })

  it('returns undefined if element prefix is undefined', () => {
    const elementWithoutPrefix = { ...element, prefix: undefined }
    expect(allImportMatcher.findMatch(elementWithoutPrefix, imports)).toBeUndefined()
  })
})
