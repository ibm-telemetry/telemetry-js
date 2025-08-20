/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { describe, expect, it } from 'vitest'

import { WcElementCdnImportMatcher } from '../../../../main/scopes/wc/import-matchers/wc-element-cdn-import-matcher.js'
import type { CdnImport } from '../../../../main/scopes/wc/interfaces.js'
import { type WcElement } from '../../../../main/scopes/wc/interfaces.js'

describe('class: WcElementCdnImportMatcher', () => {
  const wcElementCdnImportMatcher = new WcElementCdnImportMatcher()
  const element: WcElement = {
    name: 'prefix-elementName',
    attributes: []
  }
  const matching: CdnImport = {
    name: 'elementName',
    path: 'https://cdn.domain.com/library/something/version/someVersion/elementName.min.js',
    prefix: 'prefix',
    package: '@library/something',
    version: 'someVersion'
  }
  const notMatching: CdnImport = {
    name: 'elementName',
    path: 'https://cdn.domain.com/otherLibrary/something/version/someVersion/elementName.min.js',
    prefix: 'otherPrefix',
    package: '@otherLibrary/something',
    version: 'someVersion'
  }
  it('correctly finds an import match with element name', () => {
    const imports = [notMatching, matching]
    expect(wcElementCdnImportMatcher.findMatch(element, imports)).toStrictEqual(matching)
  })

  it('returns undefined if no imports match element', () => {
    const imports = [notMatching]
    expect(wcElementCdnImportMatcher.findMatch(element, imports)).toBeUndefined()
  })
})
