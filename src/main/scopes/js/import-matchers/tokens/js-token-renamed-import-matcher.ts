/*
 * Copyright IBM Corp. 2024, 2024
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
   * @param jsToken - JsToken to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if token was imported as a renamed import,
   * undefined otherwise.
   */
  findMatch(jsToken: JsToken, imports: JsImport[]) {
    // TODOASKJOE: matching strategy: if beginning or token name belongs to import
    // but if it's only the token name, should we ignore (remove) the accesspath?
    // ^^ should we take only the token name and no access path?
    return imports.find((i) => i.rename === jsToken.accessPath[0] || i.rename === jsToken.name)
  }
}
