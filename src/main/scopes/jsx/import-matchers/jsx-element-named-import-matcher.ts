/*
 * Copyright IBM Corp. 2023, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JsImport, JsImportMatcher } from '../../js/interfaces.js'
import { type JsxElement } from '../interfaces.js'

/**
 * Identifies JsxElements that have been imported as named imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsxElementNamedImportMatcher implements JsImportMatcher<JsxElement> {
  /**
   * Determines if a given JsxElement is a named import (e.g.: `import {something} from 'package'`).
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsImport if element was imported as a name import,
   * undefined otherwise.
   */
  findMatch(element: JsxElement, imports: JsImport[]) {
    if (element.prefix !== undefined) {
      return imports.find((i) => !i.isDefault && !i.isAll && i.name === element.prefix)
    } else {
      return imports.find((i) => !i.isDefault && !i.isAll && i.name === element.name)
    }
  }
}
