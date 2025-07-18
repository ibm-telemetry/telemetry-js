/*
 * Copyright IBM Corp. 2024, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsFunction, JsImport, JsImportMatcher, JsToken } from '../interfaces.js'

/**
 * Import matcher for all renamed imports, such as import { stuff as renamedStuff } from 'whatever'.
 */
export class JsRenamedImportMatcher implements JsImportMatcher<JsToken | JsFunction> {
  elementType: 'js' = 'js'
  /**
   * Determines if a given JsToken or JsFunction is a renamed import
   * (e.g.: `import {something as somethingElse} from 'package'`)
   * and returns an import element match (if any) or undefined otherwise.
   *
   * @param jsElement - JsToken or JsFunction to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if token was imported as a renamed import,
   * undefined otherwise.
   */
  findMatch(jsElement: JsToken | JsFunction, imports: JsImport[]) {
    return imports.find((i) => i.rename !== undefined && i.rename === jsElement.accessPath[0])
  }
}
