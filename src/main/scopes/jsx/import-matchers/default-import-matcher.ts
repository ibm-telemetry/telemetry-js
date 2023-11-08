/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type JsxElement, type JsxElementImportMatcher, type JsxImport } from '../interfaces.js'

/**
 * Identifies JsxElements that have been imported as default imports.
 */
export class DefaultImportMatcher implements JsxElementImportMatcher {
  /**
   * Determines if a given JsxElement is a default import (e.g.: `import something from 'package'`)
   * and returns an import element match (if any) or undefined otherwise.
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsxImport if element was imported as a default,
   * undefined otherwise.
   */
  findMatch(element: JsxElement, imports: JsxImport[]) {
    return element.prefix !== undefined
      ? imports.find((i) => i.isDefault && (i.name === element.prefix || i.name === element.name))
      : undefined
  }
}
