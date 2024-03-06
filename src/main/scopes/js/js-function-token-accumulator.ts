/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { JsFunction, JsImport, JsToken } from '../js/interfaces.js'
import { JsAccumulator } from '../js/js-accumulator.js'

/**
 * Responsible for maintaining an aggregated state of imports, functions and tokens.
 */
export class JsFunctionTokenAccumulator extends JsAccumulator {
  public readonly tokens: JsToken[]
  public readonly functions: JsFunction[]
  public readonly functionImports: Map<JsFunction, JsImport>
  public readonly tokenImports: Map<JsToken, JsImport>

  constructor() {
    super()
    this.tokens = []
    this.functions = []
    this.functionImports = new Map()
    this.tokenImports = new Map()
  }
}
