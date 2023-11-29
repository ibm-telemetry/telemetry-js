/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { type JsxImport } from '../interfaces.js'
import { ImportParser } from './import-parser.js'

/**
 * Identifies Import nodes that have been imported as a named import.
 */
export class NamedImportParser extends ImportParser {
  /**
   * Determines if a given ImportClause ts node contains named imports
   * i.e. `import {Something} from 'the-library'` and constructs and
   * returns the constructed elements (if any) inside an array.
   *
   * @param importNode - Node to evaluate.
   * @param importPath - Module from which the import was imported.
   * @returns Array of JsxImportElement.
   */
  parse(importNode: ts.ImportClause, importPath: string) {
    const namedImports: JsxImport[] = []

    if (importNode.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
      importNode.namedBindings.elements.forEach((element) => {
        if (!element.propertyName) {
          namedImports.push({
            name: element.name.escapedText.toString(),
            path: importPath,
            isDefault: false,
            isAll: false
          })
        }
      })
    }

    return namedImports
  }
}
