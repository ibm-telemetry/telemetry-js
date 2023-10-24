/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type JsxImportElement, type Matcher, type PartialJsxElement } from '../../interfaces.js'

/**
 * Determines if a given JsxElement is an all(*) import
 * (.e.g: import * as something from 'package')
 * that matches the supplied list of import elements.
 *
 * @param element - JsxElement to evaluate.
 * @param extraData - Contains import elements to use for comparison.
 * @param extraData.imports - TODOASKJOE.
 */
export const AllImportMatcher: Matcher<PartialJsxElement> = {
  // TODOASKJOE
  isMatch: (element: PartialJsxElement, extraData: { imports: JsxImportElement[] }) => {
    return !!element.prefix && extraData.imports.some(i => i.isAll && i.name === element.prefix)
  }
}
