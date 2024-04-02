/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsFunction, JsImport, JsImportMatcher, JsToken } from '../interfaces.js'

/**
 * Identifies JsTokens or JsFunctions that have been imported as all imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsAllImportMatcher implements JsImportMatcher<JsToken | JsFunction> {
  /**
   * Determines if a given JsToken or JsFunction is an all(*) import
   * (.e.g: import * as something from 'package')
   * that matches the supplied list of import elements.
   *
   * @param jsElement - JsToken or JsFunction to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsImport element if token was imported as an all import,
   * undefined otherwise.
   */
  findMatch(jsElement: JsToken | JsFunction, imports: JsImport[]) {
    return jsElement.accessPath.length >= 2
      ? imports.find((i) => i.isAll && i.name === jsElement.accessPath[0])
      : undefined
  }
}
