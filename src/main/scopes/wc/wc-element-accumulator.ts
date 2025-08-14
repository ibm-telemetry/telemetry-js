/*
 * Copyright IBM Corp. 2025, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { JsxElement } from 'typescript'

import type { JsImport } from '../js/interfaces.js'
import { JsAccumulator } from '../js/js-accumulator.js'
import type { CdnImport, WcElement } from './interfaces.js'

/**
 * Responsible for maintaining an aggregated state of imports and elements.
 */
export class WcElementAccumulator extends JsAccumulator {
  public cdnImports: CdnImport[]
  public readonly elements: (WcElement | JsxElement)[]
  public readonly elementImports: Map<WcElement | JsxElement, JsImport | CdnImport>
  public readonly scriptSources: string[]

  constructor() {
    super()
    this.cdnImports = []
    this.elements = []
    this.elementImports = new Map()
    this.scriptSources = []
  }
}
