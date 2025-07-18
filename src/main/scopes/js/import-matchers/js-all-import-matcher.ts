/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsFunction, JsImport, JsImportMatcher, JsToken } from '../interfaces.js'

/**
 * Import matcher for all (*) imports, such as import * as stuff from 'whatever'.
 */
export class JsAllImportMatcher implements JsImportMatcher<JsToken | JsFunction> {
  elementType: 'js' = 'js'
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
    // checking that accessPath length is at least two
    // since we'd expect the token/function to be accessed from within the import
    return jsElement.accessPath.length >= 2
      ? imports.find((i) => i.isAll && i.name === jsElement.accessPath[0])
      : undefined
  }
}
