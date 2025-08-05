/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsImport, JsImportMatcher } from '../../js/interfaces.js'
import { type WcElement } from '../interfaces.js'

/**
 * Finds a matching import for a WcElement from side-effect imports.
 *
 * @param element - The WcElement to find an import for.
 * @param imports - The list of JsImport objects collected from the file.
 * @returns A JsImport if matched, otherwise undefined.
 */
export class WcElementSideEffectImportMatcher implements JsImportMatcher<WcElement> {
  elementType: 'wc' = 'wc'
  /**
   * Determines if a given WcElement is a named import (e.g.: `import {something} from 'package'`).
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if element was imported as a name import,
   * undefined otherwise.
   */
  findMatch(element: WcElement, imports: JsImport[]) {
    return imports.find(
      (i) =>
        !i.isDefault &&
        !i.isAll &&
        i.isSideEffect &&
        (i.name === element.name || `${i.prefix}-${i.name}` === element.name)
    )
  }
}
