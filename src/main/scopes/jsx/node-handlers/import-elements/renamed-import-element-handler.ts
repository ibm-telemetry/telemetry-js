/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type * as ts from 'typescript'

import { type JsxImportElementHandler } from '../../interfaces.js'

/**
 * Identifies Import nodes that have been imported as a rename and
 * converts into a JsxImportElement object.
 */
export class RenamedImportElementHandler implements JsxImportElementHandler<ts.ImportSpecifier> {
  // TODOASKJOE - linter
  /**
   * Determines if a given ImportSpecifier ts node is a named import
   * (i.e. import {Something} from 'the-library')............................................
   *
   * @param element - node to evaluate.
   * @returns true if supplied node is an a named import, false otherwise.
   */
  isMatch(element: ts.ImportSpecifier) {
    if (element.propertyName && element.propertyName.escapedText !== 'default') {
      return true
    }
    return false
  }

  /**
   * Constructs a JsxImportElement object from a given ImportSpecifier node.
   *
   * @param element - Ts node.
   * @returns JsxImportElement object.
   */
  // TODOASKJOE
  getJsxImport(element: ts.ImportSpecifier) {
    return {
      name: element.propertyName?.escapedText,
      rename: element.name.escapedText,
      isDefault: false,
      isAll: false
    }
  }
}
