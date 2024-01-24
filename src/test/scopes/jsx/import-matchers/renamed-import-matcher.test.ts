/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'
import { RenamedImportMatcher } from '../../../../main/scopes/jsx/import-matchers/renamed-import-matcher.js'
import { type JsxElement, type JsxImport } from '../../../../main/scopes/jsx/interfaces.js'

describe('class: RenamedImportMatcher', () => {
  const renamedImportMatcher = new RenamedImportMatcher()
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
  it('correctly finds an import match with element name', () => {
    const elementWithoutPrefix = { ...element, prefix: undefined }
    expect(renamedImportMatcher.findMatch(elementWithoutPrefix, imports)).toStrictEqual(
      renamedImport
    )
  })

  it('correctly finds an import match with element prefix', () => {
    const elementWithMatchingPrefix = { ...element, name: 'throwaway', prefix: 'theElement' }
    expect(renamedImportMatcher.findMatch(elementWithMatchingPrefix, imports)).toStrictEqual(
      renamedImport
    )
  })

  it('returns undefined if no imports match element', () => {
    expect(
      renamedImportMatcher.findMatch(element, [allImport, namedImport, defaultImport])
    ).toBeUndefined()
  })
})
