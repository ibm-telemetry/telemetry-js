/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { JsImport } from '../js/interfaces.js'
import { JsAccumulator } from '../js/js-accumulator.js'
import { type JsxElement } from './interfaces.js'

/**
 * Responsible for maintaining an aggregated state of imports and elements.
 */
export class JsxElementAccumulator extends JsAccumulator {
  public readonly elements: JsxElement[]
  public readonly elementImports: Map<JsxElement, JsImport>

  constructor() {
    super()
    this.elements = []
    this.elementImports = new Map()
  }
}
