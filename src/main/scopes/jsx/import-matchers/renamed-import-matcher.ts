/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  type JsxElementImportMatcher,
  type JsxImportMatch,
  type PartialJsxElement
} from '../interfaces.js'

/**
 * Identifies JsxElements that have been imported as renamed imports.
 */
export class RenamedImportMatcher implements JsxElementImportMatcher {
  /**
   * Determines if a given JsxElement is a renamed import
   * (e.g.: `import {something as somethingElse} from 'package'`)
   * and returns an import element match (if any) or undefined otherwise.
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsxImportElement if element was imported as a renamed import,
   * undefined otherwise.
   */
  findMatch(element: PartialJsxElement, imports: JsxImportMatch[]) {
    if (element.prefix !== undefined) {
      return imports.find((i) => i.rename === element.prefix)
    } else {
      return imports.find((i) => i.rename === element.name)
    }
  }
}
