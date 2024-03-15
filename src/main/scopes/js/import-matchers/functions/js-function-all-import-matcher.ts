/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsFunction, JsImport, JsImportMatcher } from '../../interfaces.js'

/**
 * Identifies JsFunctions that have been imported as all imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsFunctionAllImportMatcher implements JsImportMatcher<JsFunction> {
  /**
   * Determines if a given JsFunction is an all(*) import
   * (.e.g: import * as something from 'package')
   * that matches the supplied list of import elements.
   *
   * @param _function - JsFunction to evaluate.
   * @param _imports - Import elements to use for comparison.
   * @returns Corresponding JsImport element if function was imported as an all import,
   * undefined otherwise.
   */
  findMatch(_function: JsFunction, _imports: JsImport[]) {
    // TODO: implement
    return undefined
  }
}
