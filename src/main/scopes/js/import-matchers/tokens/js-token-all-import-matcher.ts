/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsImport, JsImportMatcher, JsToken } from '../../interfaces.js'

/**
 * Identifies JsTokens that have been imported as all imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsTokenAllImportMatcher implements JsImportMatcher<JsToken> {
  /**
   * Determines if a given JsToken is an all(*) import
   * (.e.g: import * as something from 'package')
   * that matches the supplied list of import elements.
   *
   * @param _token - JsToken to evaluate.
   * @param _imports - Import elements to use for comparison.
   * @returns Corresponding JsImport element if token was imported as an all import,
   * undefined otherwise.
   */
  findMatch(_token: JsToken, _imports: JsImport[]) {
    // TODO: implement
    return undefined
  }
}
