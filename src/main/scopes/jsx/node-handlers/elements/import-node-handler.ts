/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { type ASTNodeHandler, type JsxImport } from '../../interfaces.js'
import { type JsxScopeAccumulator } from '../../jsx-scope-accumulator.js'

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
    const nodeAsImport = node as ts.ImportDeclaration
    const jsxImport: JsxImport = {
      importPath: (nodeAsImport.moduleSpecifier as ts.StringLiteral).text,
      elements: []
    }
    const importClause = nodeAsImport.importClause
    // named import of isAll
    if (importClause?.namedBindings) {
      const namedBindings = importClause.namedBindings
      // TODOASKJOE
      if (namedBindings.kind === ts.SyntaxKind.NamedImports) {
        // TODOASKJOE
        namedBindings.elements.forEach((element) => {
          if (element.propertyName) {
            // import {default as Hey} from 'lol'
            if (element.propertyName.escapedText === 'default') {
              // TODOASKJOE
              (jsxImport.elements as any).push({
                name: element.name.escapedText,
                isDefault: true,
                isAll: false
              })
              // import {named as nameddd} from 'lil'
            } else {
              // TODOASKJOE
              (jsxImport.elements as any).push({
                name: element.propertyName.escapedText,
                rename: element.name.escapedText,
                isDefault: false,
                isAll: false
              })
            }
            // import {Button} from '@carbon/react'
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
          name: (namedBindings).name.escapedText,
          isDefault: false,
          isAll: true
        })
      }
    }
    // default import
    // import Button from 'button'
    if (importClause?.name) {
      (jsxImport.elements).push({
        // TODOASKJOE
        name: (importClause.name).escapedText,
        isDefault: true,
        isAll: false
      })
    }
    return jsxImport
  }
}
