/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsImport, JsImportMatcher, JsToken } from '../../interfaces.js'

/**
 * Identifies JsTokens that have been imported as named imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsTokenNamedImportMatcher implements JsImportMatcher<JsToken> {
  /**
   * Determines if a given JsToken is a named import (e.g.: `import {something} from 'package'`).
   *
   * @param _token - JsToken to evaluate.
   * @param _imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if token was imported as a name import,
   * undefined otherwise.
   */
  findMatch(_token: JsToken, _imports: JsImport[]) {
    // TODO: implement
    return undefined
  }
}
