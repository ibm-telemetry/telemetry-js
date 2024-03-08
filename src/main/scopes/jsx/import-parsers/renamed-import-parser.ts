/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { DEFAULT_IMPORT_KEY } from '../constants.js'
import { type JsxImport } from '../interfaces.js'
import { ImportParser } from './import-parser.js'

/**
 * Identifies Import nodes that have been imported as a rename.
 */
export class RenamedImportParser extends ImportParser {
  /**
   * Determines if a given ImportClause ts node contains renamed imports
   * i.e. `import {Something as SomethingElse} from 'the-library'` and constructs and
   * returns the constructed elements (if any) inside an array.
   *
   * @param importNode - Node to evaluate.
   * @param importPath - Module from which the import was imported.
   * @returns Array of JsxImportElement.
   */
  parse(importNode: ts.ImportClause, importPath: string) {
    const renamedImports: JsxImport[] = []

    if (importNode.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
      importNode.namedBindings.elements.forEach((element) => {
        if (element.propertyName && element.propertyName.escapedText !== DEFAULT_IMPORT_KEY) {
          renamedImports.push({
            name: element.propertyName.escapedText.toString(),
            path: importPath,
            rename: element.name.escapedText.toString(),
            isDefault: false,
            isAll: false
          })
        }
      })
    }

    return renamedImports
  }
}
