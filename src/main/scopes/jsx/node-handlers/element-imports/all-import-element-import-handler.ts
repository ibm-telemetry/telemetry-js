/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  type JsxElementImportHandler,
  type JsxImportElement,
  type PartialJsxElement
} from '../../interfaces.js'

/**
 * Identifies JsxElements that have been imported as all imports.
 */
export class AllImportElementImportHandler implements JsxElementImportHandler {
  /**
   * Determines if a given JsxElement is an all(*) import
   * (.e.g: import * as something from 'package')
   * that matches the supplied list of import elements.
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns True if element was imported as all, false otherwise.
   */
  isMatch(element: PartialJsxElement, imports: JsxImportElement[]) {
    return element.prefix !== undefined && imports.some((i) => i.isAll && i.name === element.prefix)
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
