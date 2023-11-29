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
 * Identifies Import nodes that have been imported as all.
 */
export class AllImportParser extends ImportParser {
  /**
   * Determines if a given ImportClause ts node contains an all import
   * (i.e. `import * as Something from 'the-library'`) and constructs and
   * returns the constructed element (if any) inside an array.
   *
   * @param importNode - Node to evaluate.
   * @param importPath - Module from which the import was imported.
   * @returns Array of JsxImport.
   */
  parse(importNode: ts.ImportClause, importPath: string) {
    const allImports: JsxImport[] = []

    if (importNode.namedBindings?.kind === ts.SyntaxKind.NamespaceImport) {
      allImports.push({
        name: importNode.namedBindings.name.escapedText.toString(),
        path: importPath,
        isDefault: false,
        isAll: true
      })
    }

    return allImports
  }
}
