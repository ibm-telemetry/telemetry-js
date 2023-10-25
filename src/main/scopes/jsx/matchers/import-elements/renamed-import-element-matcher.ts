/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { type JsxImportMatcher } from '../../interfaces.js'

/**
 * Determines if a given ImportSpecifier ts node is a named import
 * (I.e. import {Something} from 'the-library')...........................................
 *
 * @param element - node to evaluate.
 */
// TODOASKJOE
export const RenamedImportElementMatcher: JsxImportMatcher<ts.ImportSpecifier> = {
  isMatch: (element: ts.ImportSpecifier) => {
    if (element.propertyName && element.propertyName.escapedText !== 'default') {
      return true
    }
    return false
  },

  /**
   * Constructs a JsxImportElement object from a given ImportSpecifier node.
   *
   * @param element - Ts node.
   * @returns JsxImportElement object.
   */
  // TODOASKJOE
  getJsxImport: (element: ts.ImportSpecifier) => {
    return {
      name: element.propertyName?.escapedText,
      rename: element.name.escapedText,
      isDefault: false,
      isAll: false
    }
  }
}
