/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  type JsxElementImportMatcher,
  type JsxImportElement,
  type PartialJsxElement
} from '../interfaces.js'

/**
 * Identifies JsxElements that have been imported as renamed imports.
 */
export class RenamedImportMatcher implements JsxElementImportMatcher {
  /**
   * Determines if a given JsxElement is a renamed import
   * (e.g.: import {something as somethingElse} from 'package).
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns True if element was imported a named import, false otherwise.
   */
  isMatch(element: PartialJsxElement, imports: JsxImportElement[]) {
    return element.prefix !== undefined && imports.some((i) => i.rename === element.prefix)
  }

  /**
   * Sanitizes the contents of a given JsxElement.
   *
   * @param element - JsxElement to sanitize.
   * @returns Sanitized version of element (in this case, the element itself).
   */
  getSanitizedElement(element: PartialJsxElement) {
    return element
  }
}
