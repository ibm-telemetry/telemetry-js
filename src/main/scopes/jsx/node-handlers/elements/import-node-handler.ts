/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { match } from 'assert'
import * as ts from 'typescript'

import { type ASTNodeHandler, type JsxImport } from '../../interfaces.js'
import { type JsxScopeAccumulator } from '../../jsx-scope-accumulator.js'
import { AllImportElementHandler } from '../import-elements/all-import-element-handler.js'
import { DefaultImportElementHandler } from '../import-elements/default-import-element-handler.js'
import { NamedImportElementHandler } from '../import-elements/named-import-element-handler.js'
import { RenamedImportElementHandler } from '../import-elements/renamed-import-element-handler.js'

/**
 * Holds logic to construct a JsxImport object given an ImportDeclaration node.
 *
 */
export class ImportNodeHandler implements ASTNodeHandler<ts.SyntaxKind.ImportDeclaration> {
  /**
   * Processes an ImportDeclaration node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated imports state.
   */
  public handle(node: ts.Node, accumulator: JsxScopeAccumulator) {
    accumulator.storeImport(this.getData(node))
  }

  /**
   * Constructs a JsxImport object from a given ImportDeclaration type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxImport object.
   */
  getData(node: ts.Node): JsxImport {
    const defaultHandler = new DefaultImportElementHandler()
    const allHandler = new AllImportElementHandler()
    const ImportSpecifierHandlers = [
      defaultHandler,
      new NamedImportElementHandler(),
      new RenamedImportElementHandler()
    ]

    const nodeAsImport = node as ts.ImportDeclaration
    const jsxImport: JsxImport = {
      importPath: (nodeAsImport.moduleSpecifier as ts.StringLiteral).text,
      elements: []
    }
    const importClause = nodeAsImport.importClause

    if (importClause && defaultHandler.isMatch(importClause)) {
      // TODOASKJOE
      jsxImport.elements.push(defaultHandler.getJsxImport(importClause))
    }
    if (importClause?.namedBindings) {
      const namedBindings = importClause.namedBindings
      if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
        namedBindings.elements.forEach((element) => {
          const matcher = Object.values(ImportSpecifierHandlers).find((m) => m.isMatch(element))
          if (matcher !== undefined) {
            // TODOASKJOE
            jsxImport.elements.push(matcher.getJsxImport(element))
          }
        })
      } else {
        if (allHandler.isMatch(namedBindings)) {
          // TODOASKJOE
          jsxImport.elements.push(allHandler.getJsxImport(namedBindings))
        }
      }
    }
    return jsxImport
  }
}
