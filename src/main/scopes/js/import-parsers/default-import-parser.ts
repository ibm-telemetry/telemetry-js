/*
 * Copyright IBM Corp. 2023, 2024
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ts from 'typescript'

import { DEFAULT_ELEMENT_NAME, DEFAULT_IMPORT_KEY } from '../../jsx/constants.js'
import type { JsImport } from '../interfaces.js'
import { ImportParser } from './import-parser.js'

/**
 * Identifies Import nodes that have been imported as default.
 */
export class DefaultImportParser extends ImportParser {
  /**
   * Determines if a given ImportClause ts node contains default imports
   * (i.e. `import Something from 'the-library'`) and constructs and
   * returns the constructed elements (if any) inside an array.
   *
   * @param importNode - Node to evaluate.
   * @param importPath - Module from which the import was imported.
   * @returns Array of JsxImportElement.
   */
  parse(importNode: ts.ImportClause, importPath: string) {
    const defaultImports: JsImport[] = []

    if (importNode.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
      importNode.namedBindings.elements.forEach((element) => {
        if (element.propertyName?.escapedText === DEFAULT_IMPORT_KEY) {
          defaultImports.push({
            name: DEFAULT_ELEMENT_NAME,
            path: importPath,
            rename: element.name.escapedText.toString(),
            isDefault: true,
            isAll: false
          })
        }
      })
    }

    if (importNode.name) {
      defaultImports.push({
        name: DEFAULT_ELEMENT_NAME,
        path: importPath,
        rename: importNode.name.escapedText.toString(),
        isDefault: true,
        isAll: false
      })
    }

    return defaultImports
  }
}
