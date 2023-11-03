/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { ImportClauseParser } from '../import-clause-parser.js'
import { type JsxImportElement } from '../interfaces.js'

/**
 * Identifies Import nodes that have been imported as all.
 */
export class AllImportParser extends ImportClauseParser {
  /**
   * Determines if a given ImportClause ts node contains an all import
   * (i.e. `import * as Something from 'the-library'`) and constructs and
   * returns the constructed element (if any) inside an array.
   *
   * @param importNode - Node to evaluate.
   * @returns Array of JsxImportElement.
   */
  parse(importNode: ts.ImportClause) {
    const allImports: JsxImportElement[] = []

    if (importNode.namedBindings?.kind === ts.SyntaxKind.NamespaceImport) {
      allImports.push({
        name: importNode.namedBindings.name.escapedText.toString(),
        isDefault: false,
        isAll: true
      })
    }

    return allImports
  }
}
