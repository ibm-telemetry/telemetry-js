/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JsFunction, JsImport, JsImportMatcher } from '../../interfaces.js'

/**
 * Identifies JsFunctions that have been imported as named imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsFunctionNamedImportMatcher implements JsImportMatcher<JsFunction> {
  /**
   * Determines if a given JsFunction is a named import (e.g.: `import {something} from 'package'`).
   *
   * @param _function - JsFunction to evaluate.
   * @param _imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if function was imported as a name import,
   * undefined otherwise.
   */
  findMatch(_function: JsFunction, _imports: JsImport[]) {
    // TODO: implement
    return undefined
  }
}
