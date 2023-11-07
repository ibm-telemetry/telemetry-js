/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { DEFAULT_ELEMENT_NAME, DEFAULT_IMPORT_KEY } from '../constants.js'
import { ImportClauseParser } from '../import-clause-parser.js'
import { type JsxImportElement } from '../interfaces.js'

/**
 * Identifies Import nodes that have been imported as default.
 */
export class DefaultImportParser extends ImportClauseParser {
  /**
   * Determines if a given ImportClause ts node contains default imports
   * (i.e. `import Something from 'the-library'`) and constructs and
   * returns the constructed elements (if any) inside an array.
   *
   * @param importNode - Node to evaluate.
   * @returns Array of JsxImportElement.
   */
  parse(importNode: ts.ImportClause) {
    const defaultImports: JsxImportElement[] = []

    if (importNode.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
      importNode.namedBindings.elements.forEach((element) => {
        if (element.propertyName?.escapedText === DEFAULT_IMPORT_KEY) {
          defaultImports.push({
            name: DEFAULT_ELEMENT_NAME,
            rename: element.name.escapedText.toString(),
            isDefault: true,
            isAll: false
          })
        }
      })
    }

    if (!importNode.namedBindings && importNode.name) {
      defaultImports.push({
        name: DEFAULT_ELEMENT_NAME,
        rename: importNode.name.escapedText.toString(),
        isDefault: true,
        isAll: false
      })
    }

    return defaultImports
  }
}
