/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { JsNamedImportMatcher } from '../../../../main/scopes/js/import-matchers/js-named-import-matcher.js'
import type { JsFunction, JsImport, JsToken } from '../../../../main/scopes/js/interfaces.js'
import { DEFAULT_ELEMENT_NAME } from '../../../../main/scopes/jsx/constants.js'

describe('class: JsNamedImportMatcher', () => {
  describe('tokens', () => {
    const namedImportMatcher = new JsNamedImportMatcher()
    const simpleJsToken: JsToken = {
      name: 'object',
      accessPath: ['object'],
      startPos: 0,
      endPos: 0
    }
    const nestedJsToken: JsToken = {
      name: 'object.theToken',
      accessPath: ['object', 'theToken'],
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
      rename: 'theToken',
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
      name: 'aToken',
      path: '@library/something',
      rename: 'theToken',
      isDefault: false,
      isAll: false
    }
    const imports = [allImport, namedImport, renamedImport, defaultImport]
    it('correctly finds an import match with token name', () => {
      expect(namedImportMatcher.findMatch(simpleJsToken, imports)).toStrictEqual(namedImport)
    })

    it('correctly finds an import match with token nesting', () => {
      expect(namedImportMatcher.findMatch(nestedJsToken, imports)).toStrictEqual(namedImport)
    })

    it('returns undefined if no imports match token', () => {
      expect(
        namedImportMatcher.findMatch(simpleJsToken, [allImport, renamedImport, defaultImport])
      ).toBeUndefined()
    })
  })
  describe('functions', () => {
    const namedImportMatcher = new JsNamedImportMatcher()
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
})
