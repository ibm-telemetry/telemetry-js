/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { type JsxImportMatcher } from '../../interfaces.js'

/**
 * Determines if a given ImportSpecifier or ImportClause ts node is a named import
 * (i.e. Import Something from 'the-library')...................................
 *
 * @param element - Node to evaluate.
 */
// TODOASKJOE
export const DefaultImportElementMatcher: JsxImportMatcher<ts.ImportSpecifier | ts.ImportClause> = {
  isMatch: (element: ts.ImportSpecifier | ts.ImportClause) => {
    if (element.kind === ts.SyntaxKind.ImportSpecifier && element.propertyName && element.propertyName.escapedText === 'default') {
      return true
    }
    if (element.kind === ts.SyntaxKind.ImportClause && !element.namedBindings && element.name) {
      return true
    }
    return false
  },

  /**
   * Constructs a JsxImportElement object from a given ImportClause or ImportSpecifier node.
   *
   * @param element - Ts node.
   * @returns JsxImportElement object.
   */
  // TODOASKJOE
  getJsxImport: (element: ts.ImportSpecifier | ts.ImportClause) => {
    return {
      name: element.name?.escapedText,
      isDefault: true,
      isAll: false
    }
  }
}
