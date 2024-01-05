/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { DEFAULT_ELEMENT_NAME, DEFAULT_IMPORT_KEY } from '../../constants.js'
import { JsxImport } from '../../interfaces.js'
import { type JsxElementAccumulator } from '../../jsx-element-accumulator.js'
import { ElementNodeHandler } from './element-node-handler.js'

/**
 * Holds logic to construct a VariableDeclaration object given a node of said kind.
 *
 */
export class VariableDeclarationNodeHandler extends ElementNodeHandler<JsxImport[]> {
  /**
   * Processes a VariableDeclaration node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated elements state.
   */
  handle(node: ts.VariableDeclaration, accumulator: JsxElementAccumulator) {
    accumulator.imports.push(...this.getData(node))
  }

  /**
   * Constructs a JsxImport object from a given VariableDeclaration type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxElement object.
   */
  getData(node: ts.VariableDeclaration): JsxImport[] {
    const imports: JsxImport[] = []
    let path: string | undefined
    // await import
    if (node.initializer !== undefined && ts.isAwaitExpression(node.initializer)) {
      if (ts.isCallExpression(node.initializer.expression)) {
        if (node.initializer.expression.expression.kind === ts.SyntaxKind.ImportKeyword) {
          path = node.initializer.expression.arguments[0]?.getText(this.sourceFile)
        }
      }

      if (path === undefined) return []
      // default import
      if (ts.isIdentifier(node.name)) {
        imports.push({
          name: DEFAULT_ELEMENT_NAME,
          rename: node.name.getText(this.sourceFile),
          path,
          isDefault: true,
          isAll: false
        })
      }
      if (ts.isObjectBindingPattern(node.name)) {
        node.name.elements.forEach((element) => {
          // named import
          if (!element.propertyName) {
            imports.push({
              name: element.name.getText(this.sourceFile),
              path: path as string,
              isDefault: false,
              isAll: false
            })
          }
          // default import
          if (
            element.propertyName &&
            element.propertyName.getText(this.sourceFile) === DEFAULT_IMPORT_KEY
          ) {
            imports.push({
              name: DEFAULT_ELEMENT_NAME,
              rename: element.name.getText(this.sourceFile),
              path: path as string,
              isDefault: true,
              isAll: false
            })
          }
          // renamed import
          if (
            element.propertyName &&
            element.propertyName.getText(this.sourceFile) !== DEFAULT_ELEMENT_NAME
          ) {
            imports.push({
              name: element.propertyName.getText(this.sourceFile),
              rename: element.name.getText(this.sourceFile),
              path: path as string,
              isDefault: false,
              isAll: false
            })
          }
        })
      }
    }

    // (await import)...
    if (node.initializer !== undefined && ts.isPropertyAccessExpression(node.initializer)) {
      if (ts.isParenthesizedExpression(node.initializer.expression)) {
        if (ts.isAwaitExpression(node.initializer.expression.expression)) {
          if (ts.isCallExpression(node.initializer.expression.expression.expression)) {
            if (
              node.initializer.expression.expression.expression.expression.kind ===
              ts.SyntaxKind.ImportKeyword
            ) {
              path = node.initializer.expression.expression.expression.arguments[0]?.getText(
                this.sourceFile
              )
            }
          }
        }
      }
      if (path === undefined) return []

      const propertyAccess = node.initializer.name.getText(this.sourceFile)
      const isDefault = propertyAccess === DEFAULT_IMPORT_KEY
      // default import
      if (ts.isIdentifier(node.name)) {
        imports.push({
          name: isDefault ? DEFAULT_ELEMENT_NAME : propertyAccess,
          rename: node.name.getText(this.sourceFile),
          path,
          isDefault,
          isAll: false
        })
      }
      if (ts.isObjectBindingPattern(node.name)) {
        node.name.elements.forEach((element) => {
          const rename = element.name.getText(this.sourceFile)
          // named import
          if (!element.propertyName) {
            imports.push({
              name: `${isDefault ? DEFAULT_ELEMENT_NAME : propertyAccess}.${rename}`,
              rename,
              path: path as string,
              isDefault,
              isAll: false
            })
          }
          // default import
          if (
            element.propertyName &&
            element.propertyName.getText(this.sourceFile) === DEFAULT_IMPORT_KEY
          ) {
            imports.push({
              name: DEFAULT_ELEMENT_NAME,
              rename,
              path: path as string,
              isDefault,
              isAll: false
            })
          }
          // renamed import
          if (
            element.propertyName &&
            element.propertyName.getText(this.sourceFile) !== DEFAULT_ELEMENT_NAME
          ) {
            imports.push({
              name: `${
                isDefault ? DEFAULT_ELEMENT_NAME : propertyAccess
              }.${element.propertyName.getText(this.sourceFile)}`,
              rename,
              path: path as string,
              isDefault,
              isAll: false
            })
          }
        })
      }
    }

    return imports
  }
}
