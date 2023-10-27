/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { type JsxImportElementHandler } from '../../interfaces.js'

/**
 * Identifies Import nodes that have been imported as all and
 * converts into a JsxImportElement object.
 */
export class AllImportElementHandler implements JsxImportElementHandler<ts.NamedImportBindings> {
  /**
   * Determines if a given NamedImportBindings ts node is an all import
   * (i.e. Import * as Something from 'the-library')..
   *
   * @param element - Node to evaluate.
   * @returns True if supplied node is an all import, false otherwise.
   */
  isMatch(element: ts.NamedImportBindings) {
    if (element.kind === ts.SyntaxKind.NamespaceImport) {
      return true
    }
    return false
  }

  /**
   * Constructs a JsxImportElement object from a given NamedImportBindings node.
   *
   * @param element - Ts node.
   * @returns Constructed JsxImportElement object.
   */
  // TODOASKJOE
  getJsxImport(element: ts.NamedImportBindings) {
    return {
      name: (element as ts.NamespaceImport).name.escapedText,
      isDefault: false,
      isAll: true
    }
  }
}
