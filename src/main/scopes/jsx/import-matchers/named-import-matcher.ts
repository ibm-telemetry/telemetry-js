/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type JsxElement, type JsxElementImportMatcher, type JsxImport } from '../interfaces.js'

/**
 * Identifies JsxElements that have been imported as named imports,
 * and returns an import element match (if any) or undefined otherwise.
 */
export class NamedImportMatcher implements JsxElementImportMatcher {
  /**
   * Determines if a given JsxElement is a named import (e.g.: `import {something} from 'package'`).
   *
   * @param element - JsxElement to evaluate.
   * @param imports - Import elements to use for comparison.
   * @returns Corresponding JsxImport if element was imported as a name import,
   * undefined otherwise.
   */
  findMatch(element: JsxElement, imports: JsxImport[]) {
    return element.prefix === undefined
      ? imports.find((i) => !i.isDefault && !i.isAll && i.name === element.name)
      : undefined
  }
}
