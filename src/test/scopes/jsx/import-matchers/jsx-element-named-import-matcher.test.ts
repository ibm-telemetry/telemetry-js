/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import type { JsImport } from '../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'
import { JsxElementNamedImportMatcher } from '../../../../main/scopes/jsx/import-matchers/jsx-element-named-import-matcher.js'
import { type JsxElement } from '../../../../main/scopes/jsx/interfaces.js'

describe('class: NamedImportMatcher', () => {
  const namedImportMatcher = new JsxElementNamedImportMatcher()
  const element: JsxElement = {
    name: 'theElement',
    prefix: 'prefix',
    attributes: []
  }
  const allImport: JsImport = {
    name: 'prefix',
    path: '@library/something',
    isAll: true,
    isDefault: false
  }
  const defaultImport: JsImport = {
    name: DEFAULT_ELEMENT_NAME,
    path: '@library/something',
    rename: 'theElement',
    isDefault: true,
    isAll: false
  }
  const namedImport: JsImport = {
    name: 'theElement',
    path: '@library/something',
    isDefault: false,
    isAll: false
  }
  const renamedImport: JsImport = {
    name: 'Button',
    path: '@library/something',
    rename: 'theElement',
    isDefault: false,
    isAll: false
  }
  const imports = [allImport, namedImport, renamedImport, defaultImport]
  it('correctly finds an import match with element name', () => {
    const elementWithoutPrefix = { ...element, prefix: undefined }
    expect(namedImportMatcher.findMatch(elementWithoutPrefix, imports)).toStrictEqual(namedImport)
  })

  it('correctly finds an import match with element prefix', () => {
    const elementWithMatchingPrefix = { ...element, name: 'throwaway', prefix: 'theElement' }
    expect(namedImportMatcher.findMatch(elementWithMatchingPrefix, imports)).toStrictEqual(
      namedImport
    )
  })

  it('returns undefined if no imports match element', () => {
    expect(
      namedImportMatcher.findMatch(element, [allImport, renamedImport, defaultImport])
    ).toBeUndefined()
  })
})
