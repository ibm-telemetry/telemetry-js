/*
 * Copyright IBM Corp. 2024, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsFunction, JsImport, JsImportMatcher } from '../../interfaces.js'

/**
 * Identifies JsFunctions that have been imported as named imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsFunctionNamedImportMatcher implements JsImportMatcher<JsFunction> {
  /**
   * Determines if a given JsFunction is a named import (e.g.: `import {something} from 'package'`).
   *
   * @param jsFunction - JsFunction to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if function was imported as a name import,
   * undefined otherwise.
   */
  // TODOASKJOE: matching strategy: for a function, are we only matching the "beginning"
  // (the object it comes from, or the function itself)
  findMatch(jsFunction: JsFunction, imports: JsImport[]) {
    return imports.find((i) => !i.isDefault && !i.isAll && i.name === jsFunction.accessPath[0])
  }
}
