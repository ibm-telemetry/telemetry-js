/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsImport, JsImportMatcher, JsToken } from '../../interfaces.js'

/**
 * Identifies JsTokens that have been imported as renamed imports.
 */
export class JsTokenRenamedImportMatcher implements JsImportMatcher<JsToken> {
  /**
   * Determines if a given JsToken is a renamed import
   * (e.g.: `import {something as somethingElse} from 'package'`)
   * and returns an import element match (if any) or undefined otherwise.
   *
   * @param _token - JsToken to evaluate.
   * @param _imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if token was imported as a renamed import,
   * undefined otherwise.
   */
  findMatch(_token: JsToken, _imports: JsImport[]) {
    // TODO: implement
    return undefined
  }
}
