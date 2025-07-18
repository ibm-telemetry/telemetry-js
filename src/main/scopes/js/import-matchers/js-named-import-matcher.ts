/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsFunction, JsImport, JsImportMatcher, JsToken } from '../interfaces.js'

/**
 * Import matcher for all named imports, such as import { stuff } from 'whatever'.
 */
export class JsNamedImportMatcher implements JsImportMatcher<JsToken | JsFunction> {
  elementType: 'js' = 'js'
  /**
   * Determines if a given JsToken or JsFunction is a named import
   * (e.g.: `import {something} from 'package'`).
   *
   * @param jsElement - JsToken or JsFunction to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if token was imported as a name import,
   * undefined otherwise.
   */
  findMatch(jsElement: JsToken | JsFunction, imports: JsImport[]) {
    return imports.find(
      (i) =>
        !i.isDefault && !i.isAll && i.rename === undefined && i.name === jsElement.accessPath[0]
    )
  }
}
