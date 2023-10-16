/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type * as ts from 'typescript'

import { type ASTNodeHandler, type JsxImport } from '../interfaces.js'
import { type JsxScopeAccumulator } from '../jsx-scope-accumulator.js'

/**
 * Holds logic to construct a JsxImport object given an ImportDeclaration node.
 *
 */
export class ImportNodeHandler implements ASTNodeHandler {
  /**
   * Processes an ImportDeclaration node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated imports state.
   */
  public handle(node: ts.Node, accumulator: JsxScopeAccumulator) {
    accumulator.storeImport(this.getImportData(node as ts.ImportDeclaration))
  }

  /**
   * Constructs a JsxImport object from a given ImportDeclaration type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxImport object.
   */
  private getImportData(node: ts.ImportDeclaration): JsxImport {
    const jsxImport: JsxImport = {
      importPath: (node.moduleSpecifier as ts.StringLiteral).text,
      elements: []
    }
    const importClause = node.importClause
    // named import of isAll
    if (importClause?.namedBindings) {
      const namedBindings = importClause.namedBindings
      // TODOASKJOE
      if ((namedBindings as any).elements?.length > 0) {
        // TODOASKJOE
        (namedBindings as any).elements.forEach((element: any) => {
          if (element.propertyName !== null && element.propertyName !== undefined) {
            if (element.propertyName.escapedText === 'default') {
              // TODOASKJOE
              (jsxImport.elements as any).push({
                name: element.name.escapedText,
                isDefault: true,
                isAll: false
              })
            } else {
              // TODOASKJOE
              (jsxImport.elements as any).push({
                name: element.propertyName.escapedText,
                rename: element.name.escapedText,
                isDefault: false,
                isAll: false
              })
            }
          } else {
            (jsxImport.elements as any).push({
              name: element.name.escapedText,
              isDefault: false,
              isAll: false
            })
          }
        })
      } else {
        // TODOASKJOE
        (jsxImport.elements as any).push({
          // TODOASKJOE
          name: (namedBindings as any).name.escapedText,
          isDefault: false,
          isAll: true
        })
      }
    }
    // default import
    if (importClause?.name) {
      (jsxImport.elements).push({
        // TODOASKJOE
        name: (importClause.name as any).escapedText,
        isDefault: true,
        isAll: false
      })
    }
    return jsxImport
  }
}
