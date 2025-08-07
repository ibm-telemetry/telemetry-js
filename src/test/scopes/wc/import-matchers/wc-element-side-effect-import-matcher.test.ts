/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import type { JsImport } from '../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'
import { WcElementSideEffectImportMatcher } from '../../../../main/scopes/wc/import-matchers/wc-element-side-effect-import-matcher.js'
import { type WcElement } from '../../../../main/scopes/wc/interfaces.js'

describe('class: WcElementSideEffectImportMatcher', () => {
  const wcElementSideEffectImportMatcher = new WcElementSideEffectImportMatcher()
  const element: WcElement = {
    name: 'theElement',
    attributes: []
  }
  const allImport: JsImport = {
    name: 'prefix',
    path: '@library/something',
    isAll: true,
    isDefault: false,
    isSideEffect: true
  }
  const defaultImport: JsImport = {
    name: DEFAULT_ELEMENT_NAME,
    path: '@library/something',
    rename: 'theElement',
    isDefault: true,
    isAll: false,
    isSideEffect: true
  }
  const namedImport: JsImport = {
    name: 'theElement',
    path: '@library/something',
    isDefault: false,
    isAll: false,
    isSideEffect: true
  }
  const renamedImport: JsImport = {
    name: 'Button',
    path: '@library/something',
    rename: 'theElement',
    isDefault: false,
    isAll: false,
    isSideEffect: true
  }
  const notSideEffect: JsImport = {
    name: 'theElement',
    path: '@library/something',
    isDefault: false,
    isAll: false,
    isSideEffect: false
  }
  const notMatching: JsImport = {
    name: 'otherElement',
    path: '@library/something',
    isDefault: false,
    isAll: false,
    isSideEffect: true
  }
  it('correctly finds an import match with element name', () => {
    const imports = [
      allImport,
      renamedImport,
      defaultImport,
      notSideEffect,
      notMatching,
      namedImport
    ]
    expect(wcElementSideEffectImportMatcher.findMatch(element, imports)).toStrictEqual(namedImport)
  })

  it('returns undefined if no imports match element', () => {
    const imports = [allImport, renamedImport, defaultImport, notSideEffect, notMatching]
    expect(wcElementSideEffectImportMatcher.findMatch(element, imports)).toBeUndefined()
  })
})
