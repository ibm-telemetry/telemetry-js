/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type JsxImportElement, type Matcher, type PartialJsxElement } from '../../interfaces.js'

/**
 * Determines if a given JsxElement is a named import (e.g.: import {something} from 'package).
 *
 * @param element - JsxElement to evaluate.
 * @param extraData - Contains import elements to use for comparison.
 * @param extraData.imports - TODOASKJOE.
 */
export const NamedImportMatcher: Matcher<PartialJsxElement> = {
  // TODOASKJOE
  isMatch: (element: PartialJsxElement, extraData: { imports: JsxImportElement[] }) => {
    return !element.prefix && extraData.imports.some(i => !i.isDefault && i.name === element.name)
  }
}
