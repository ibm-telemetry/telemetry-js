/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { type JsxImportMatcher } from '../../interfaces.js'

/**
 * Determines if a given NamedImportBindings ts node is an all import
 * (i.e. Import * as Something from 'the-library')..
 *
 * @param element - Node to evaluate.
 */
export const AllImportElementMatcher: JsxImportMatcher<ts.NamedImportBindings> = {
  isMatch: (element: ts.NamedImportBindings) => {
    if (element.kind === ts.SyntaxKind.NamespaceImport) {
      return true
    }
    return false
  },

  /**
   * Constructs a JsxImportElement object from a given NamedImportBindings node.
   *
   * @param element - Ts node.
   * @returns JsxImportElement object.
   */
  // TODOASKJOE
  getJsxImport: (element: ts.NamedImportBindings) => {
    return {
      name: (element as ts.NamespaceImport).name.escapedText,
      isDefault: false,
      isAll: true
    }
  }
}
