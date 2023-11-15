/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { AllImportParser } from '../../import-parsers/all-import-parser.js'
import { DefaultImportParser } from '../../import-parsers/default-import-parser.js'
import { NamedImportParser } from '../../import-parsers/named-import-parser.js'
import { RenamedImportParser } from '../../import-parsers/renamed-import-parser.js'
import { type JsxImport } from '../../interfaces.js'
import { type JsxElementAccumulator } from '../../jsx-element-accumulator.js'
import { ElementNodeHandler } from './element-node-handler.js'

/**
 * Holds logic to construct a JsxImport object given an ImportDeclaration node.
 *
 */
export class ImportNodeHandler extends ElementNodeHandler<JsxImport[]> {
  /**
   * Processes an ImportDeclaration node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated imports state.
   */
  handle(node: ts.ImportDeclaration, accumulator: JsxElementAccumulator) {
    accumulator.imports.push(...this.getData(node))
  }

  /**
   * Constructs a JsxImport object from a given ImportDeclaration type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxImport object.
   */
  getData(node: ts.ImportDeclaration): JsxImport[] {
    const importParsers = [
      new AllImportParser(),
      new DefaultImportParser(),
      new NamedImportParser(),
      new RenamedImportParser()
    ]

    const results: JsxImport[] = []

    const importClause = node.importClause
    // This has quotes on it which need to be removed
    const importPath = node.moduleSpecifier.getText(this.sourceFile).slice(1, -1)

    if (importClause) {
      importParsers.forEach((parser) => results.push(...parser.parse(importClause, importPath)))
    }

    return results
  }
}
