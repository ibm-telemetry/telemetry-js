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
 * Identifies Import nodes that have been imported as a named import.
 */
export class NamedImportParser extends ImportClauseParser {
  /**
   * Determines if a given ImportClause ts node contains named imports
   * i.e. `import {Something} from 'the-library'` and constructs and
   * returns the constructed elements (if any) inside an array.
   *
   * @param importNode - Node to evaluate.
   * @returns Array of JsxImportElement.
   */
  parse(importNode: ts.ImportClause) {
    const namedImports: JsxImportElement[] = []

    if (importNode.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
      importNode.namedBindings.elements.forEach((element) => {
        if (!element.propertyName) {
          namedImports.push({
            name: element.name.escapedText.toString(),
            isDefault: false,
            isAll: false
          })
        }
      })
    }

    return namedImports
  }
}
