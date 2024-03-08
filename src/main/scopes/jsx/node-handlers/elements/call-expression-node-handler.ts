/*
 * Copyright IBM Corp. 2023, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as ts from 'typescript'

import { DEFAULT_ELEMENT_NAME } from '../../constants.js'
import { JsxImport } from '../../interfaces.js'
import { type JsxElementAccumulator } from '../../jsx-element-accumulator.js'
import { ElementNodeHandler } from './element-node-handler.js'

/**
 * Holds logic to construct a CallExpression object given a node of said kind.
 *
 */
export class CallExpressionNodeHandler extends ElementNodeHandler<JsxImport[]> {
  /**
   * Processes a CallExpression node data and adds it to the given accumulator.
   *
   * @param node - Node element to process.
   * @param accumulator - JsxAccumulator instance that holds the aggregated elements state.
   */
  handle(node: ts.CallExpression, accumulator: JsxElementAccumulator) {
    accumulator.imports.push(...this.getData(node))
  }

  /**
   * Constructs a JsxImport object from a given CallExpression type AST node.
   *
   * @param node - Node element to process.
   * @returns Constructed JsxElement object.
   */
  getData(node: ts.CallExpression): JsxImport[] {
    const imports: JsxImport[] = []
    let path: string | undefined
    if (ts.isPropertyAccessExpression(node.expression)) {
      if (ts.isCallExpression(node.expression.expression)) {
        if (node.expression.expression.expression.kind === ts.SyntaxKind.ImportKeyword) {
          path = node.expression.expression.arguments[0]?.getText(this.sourceFile)
        }
      }
    }
    if (path === undefined) return []
    if (node.arguments[0] && ts.isArrowFunction(node.arguments[0])) {
      const parameter = node.arguments[0].parameters[0]

      if (parameter !== undefined && ts.isIdentifier(parameter.name)) {
        imports.push({
          name: DEFAULT_ELEMENT_NAME,
          rename: parameter.name.getText(this.sourceFile),
          path,
          isDefault: true,
          isAll: false
        })
      }
      if (parameter !== undefined && ts.isObjectBindingPattern(parameter.name)) {
        parameter.name.elements.forEach((element) => {
          imports.push({
            name: element.name.getText(this.sourceFile),
            path: path as string,
            isDefault: false,
            isAll: false
          })
        })
      }
    }

    return imports
  }
}
