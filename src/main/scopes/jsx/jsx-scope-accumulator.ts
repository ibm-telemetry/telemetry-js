/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type JsxElement, type JsxImport } from './interfaces.js'

/**
 * Responsible for maintaining an aggregated state of imports and elements.
 *
 */
export class JsxScopeAccumulator {
  public readonly imports: JsxImport[]
  public readonly elements: JsxElement[]

  constructor() {
    this.imports = []
    this.elements = []
  }

  /**
   * Adds an import object ot the imports state.
   *
   * @param importData - Import object to add to the state.
   */
  public storeImport(importData: JsxImport) {
    this.imports.push(importData)
  }

  /**
   * Adds an element object to the elements state.
   *
   * @param element - JsxElement object to add to the state.
   */
  public storeElement(element: JsxElement) {
    this.elements.push(element)
  }
}
