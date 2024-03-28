/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { JsImport } from '../js/interfaces.js'

/**
 * Base class for all JS Accumulators.
 * Responsible for maintaining an aggregated state of imports and other elements.
 */
export abstract class JsAccumulator {
  public imports: JsImport[]

  constructor() {
    this.imports = []
  }
}
