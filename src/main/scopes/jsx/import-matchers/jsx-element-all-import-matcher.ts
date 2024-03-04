/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { JsImport } from '../../js/interfaces.js'
import { type JsxElement, type JsxElementImportMatcher } from '../interfaces.js'

/**
 * Identifies JsxElements that have been imported as all imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class JsxElementAllImportMatcher implements JsxElementImportMatcher {
  /**
   * Determines if a given JsxElement is an all(*) import
   * (.e.g: import * as something from 'package')
   * that matches the supplied list of import elements.
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsxImportElement if element was imported as an all import,
   * undefined otherwise.
   */
  findMatch(element: JsxElement, imports: JsImport[]) {
    return element.prefix !== undefined
      ? imports.find((i) => i.isAll && i.name === element.prefix)
      : undefined
  }
}
